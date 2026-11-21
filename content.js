(() => {
  "use strict";

  const BTN_CLASS = "lingq-mode-toggle-btn";
  const FLASH_CLASS = "lingq-sentence-target-flash";

  // SVG icon for switching TO Sentence Mode (focus/sentence frame icon)
  const ICON_TO_SENTENCE = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="1" width="20" height="12" rx="2"></rect>
      <line x1="5" y1="5.5" x2="17" y2="5.5"></line>
      <line x1="5" y1="8.5" x2="12" y2="8.5"></line>
    </svg>
  `;

  // SVG icon for switching BACK to Scroll Mode (paragraph/scroll lines icon)
  const ICON_TO_SCROLL = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m16 16-3 3 3 3"></path>
      <path d="M3 12h14.5a1 1 0 0 1 0 7H13"></path>
      <path d="M3 19h6"></path>
      <path d="M3 5h18"></path>
    </svg>
  `;

  /**
   * Detects the current reading mode from the toolbar trigger button or DOM structure.
   * Returns "sentence", "scroll", or "page".
   */
  function getCurrentMode(sentenceEl) {
    const modeBtn = findModeTriggerButton();
    if (modeBtn) {
      const label = (modeBtn.getAttribute("aria-label") || "").toLowerCase();
      if (label.includes("sentence")) return "sentence";
      if (label.includes("scroll")) return "scroll";
      if (label.includes("page")) return "page";
    }
    if (sentenceEl) {
      const parentP = sentenceEl.closest("p");
      if (parentP && !parentP.classList.contains("reader-paragraph")) {
        return "sentence";
      }
    }
    return "scroll";
  }

  /**
   * Finds LingQ's Reading Mode dropdown trigger button in the toolbar.
   */
  function findModeTriggerButton() {
    return (
      document.querySelector('button[aria-label^="Reading mode:"]') ||
      document.querySelector('button[aria-label*="Scroll Mode"]') ||
      document.querySelector('button[aria-label*="Sentence Mode"]') ||
      document.querySelector('button[aria-label*="Page Mode"]')
    );
  }

  /**
   * Simulates a full Radix-compatible pointer/mouse/keyboard sequence on an element.
   * Radix UI dropdowns often listen to pointerdown rather than just click().
   */
  function simulateRadixClick(el) {
    if (!el) return;
    const opts = { bubbles: true, cancelable: true, view: window };
    el.dispatchEvent(new PointerEvent("pointerdown", { ...opts, button: 0, pointerId: 1, pointerType: "mouse" }));
    el.dispatchEvent(new MouseEvent("mousedown", { ...opts, button: 0 }));
    el.dispatchEvent(new PointerEvent("pointerup", { ...opts, button: 0, pointerId: 1, pointerType: "mouse" }));
    el.dispatchEvent(new MouseEvent("mouseup", { ...opts, button: 0 }));
    el.click();
  }

  /**
   * Selects a word inside the target sentence so LingQ updates its active sentence cursor.
   * Prefers an already-selected word, then a learned/known/lingq word (to avoid turning blue words known if single-click actions exist),
   * and falls back to the first word in the sentence.
   */
  function selectWordInSentence(sentenceEl) {
    const alreadySelected = sentenceEl.querySelector(".sentence-item.selected");
    if (alreadySelected) {
      return alreadySelected;
    }

    const safeWord =
      sentenceEl.querySelector(".sentence-item.ar-learned") ||
      sentenceEl.querySelector(".sentence-item.ar-known") ||
      sentenceEl.querySelector(".sentence-item.ar-lingq") ||
      sentenceEl.querySelector(".sentence-item");

    if (safeWord) {
      simulateRadixClick(safeWord);
    }
    return safeWord;
  }

  /**
   * Opens the Reading Mode dropdown menu invisibly and clicks the target mode ("Sentence Mode" or "Scroll Mode").
   */
  function switchReadingMode(targetModeName) {
    return new Promise((resolve) => {
      const triggerBtn = findModeTriggerButton();
      if (!triggerBtn) {
        console.warn("[LingQ Sentence Toggle] Could not find Reading mode button.");
        resolve(false);
        return;
      }

      // Suppress menu flicker while opening and selecting from the Radix dropdown
      document.body.classList.add("lingq-silent-mode-switch");
      const cleanup = (result) => {
        requestAnimationFrame(() => {
          document.body.classList.remove("lingq-silent-mode-switch");
        });
        resolve(result);
      };

      // Open the Radix dropdown menu
      simulateRadixClick(triggerBtn);

      const targetLower = targetModeName.toLowerCase();
      let attempts = 0;
      const maxAttempts = 30;

      const checkMenu = () => {
        attempts++;
        const items = document.querySelectorAll('[role="menuitemradio"], [data-slot="dropdown-menu-radio-item"]');
        for (const item of items) {
          const text = (item.textContent || "").trim().toLowerCase();
          if (text.includes(targetLower)) {
            simulateRadixClick(item);
            cleanup(true);
            return;
          }
        }

        if (attempts < maxAttempts) {
          requestAnimationFrame(checkMenu);
        } else {
          console.warn(`[LingQ Sentence Toggle] Dropdown menu item "${targetModeName}" did not appear.`);
          cleanup(false);
        }
      };

      requestAnimationFrame(checkMenu);
    });
  }

  /**
   * Waits for Scroll Mode to render the sentence with data-s="sentenceIndex",
   * then scrolls it into view and flashes a subtle highlight.
   */
  function scrollToSentenceWhenReady(sentenceIndex) {
    let attempts = 0;
    const maxAttempts = 50; // up to ~1.5s

    const checkSentence = () => {
      attempts++;
      const targetSentence = document.querySelector(
        `p.reader-paragraph .reader-sentence[data-s="${sentenceIndex}"], .reader-sentence[data-s="${sentenceIndex}"]`
      );
      const currentMode = getCurrentMode(targetSentence);

      if (targetSentence && currentMode !== "sentence") {
        targetSentence.scrollIntoView({ behavior: "smooth", block: "center" });
        targetSentence.classList.remove(FLASH_CLASS);
        // Trigger reflow to restart animation if needed
        void targetSentence.offsetWidth;
        targetSentence.classList.add(FLASH_CLASS);
        setTimeout(() => targetSentence.classList.remove(FLASH_CLASS), 2000);
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(checkSentence, 30);
      }
    };

    setTimeout(checkSentence, 40);
  }

  /**
   * Handles clicking our inline toggle button next to a sentence.
   */
  async function onToggleButtonClick(event, sentenceEl) {
    event.preventDefault();
    event.stopPropagation();

    const sentenceIndex = sentenceEl.getAttribute("data-s");
    const currentMode = getCurrentMode(sentenceEl);

    if (currentMode === "sentence") {
      // Currently in Sentence Mode -> switch back to Scroll Mode at this sentence
      const switched = await switchReadingMode("Scroll Mode");
      if (switched && sentenceIndex !== null) {
        scrollToSentenceWhenReady(sentenceIndex);
      }
    } else {
      // Currently in Scroll (or Page) Mode -> select a word in this sentence, then switch to Sentence Mode on the next frame
      selectWordInSentence(sentenceEl);
      requestAnimationFrame(async () => {
        await switchReadingMode("Sentence Mode");
      });
    }
  }

  /**
   * Injects or updates the toggle button inside every .reader-sentence element.
   */
  function decorateSentences() {
    const sentences = document.querySelectorAll(".reader-sentence[data-s]");
    if (!sentences.length) return;

    for (const sentenceEl of sentences) {
      const mode = getCurrentMode(sentenceEl);
      let btn = sentenceEl.querySelector(`:scope > .${BTN_CLASS}`);

      if (!btn) {
        btn = document.createElement("button");
        btn.type = "button";
        btn.className = BTN_CLASS;
        btn.addEventListener("click", (e) => onToggleButtonClick(e, sentenceEl));
        sentenceEl.appendChild(btn);
      } else if (sentenceEl.lastElementChild !== btn) {
        // Keep the button at the very end of the sentence if LingQ re-renders word spans inside
        sentenceEl.appendChild(btn);
      }

      if (btn.getAttribute("data-current-mode") !== mode) {
        btn.setAttribute("data-current-mode", mode);
        if (mode === "sentence") {
          btn.innerHTML = ICON_TO_SCROLL;
          btn.title = "Switch back to Scroll Mode at this sentence";
          btn.setAttribute("aria-label", "Switch back to Scroll Mode at this sentence");
        } else {
          btn.innerHTML = ICON_TO_SENTENCE;
          btn.title = "Open this sentence in Sentence Mode";
          btn.setAttribute("aria-label", "Open this sentence in Sentence Mode");
        }
      }
    }
  }

  // Observe DOM changes so buttons are injected automatically as you scroll or switch modes
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      decorateSentences();
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial pass
  decorateSentences();
})();
