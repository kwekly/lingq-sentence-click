// ==UserScript==
// @name         LingQ Quick Sentence Mode Toggle
// @namespace    https://github.com/lingq-community
// @version      1.1.0
// @description  Adds a hover button at the end of each sentence in LingQ to jump directly between Scroll Mode and Sentence Mode at that exact sentence.
// @author       LingQ Community
// @match        https://www.lingq.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  "use strict";

  const STYLE_ID = "lingq-mode-toggle-styles";
  const BTN_CLASS = "lingq-mode-toggle-btn";
  const FLASH_CLASS = "lingq-sentence-target-flash";

  const CSS = `
    .lingq-mode-toggle-btn {
      position: relative;
      z-index: 40;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      margin-left: 2px;
      margin-right: -24px;
      padding: 0;
      border: 1px solid rgba(59, 130, 246, 0.45);
      border-radius: 5px;
      background-color: rgba(30, 41, 59, 0.92);
      color: #f8fafc;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.28);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      cursor: pointer;
      vertical-align: middle;
      transform: translateY(-1px) scale(0.92);
      transition:
        opacity 0.35s ease 0.7s,
        transform 0.35s ease 0.7s,
        visibility 0s linear 1.05s,
        background-color 0.15s ease 0s,
        border-color 0.15s ease 0s;
      user-select: none;
      line-height: 1;
    }

    .lingq-mode-toggle-btn::before {
      content: "";
      position: absolute;
      inset: -7px -7px -7px -10px;
    }

    .reader-sentence:hover .lingq-mode-toggle-btn,
    .lingq-mode-toggle-btn:hover,
    .lingq-mode-toggle-btn:focus-visible {
      opacity: 0.94;
      visibility: visible;
      pointer-events: auto;
      transform: translateY(-1px) scale(1);
      transition:
        opacity 0.12s ease 0s,
        transform 0.12s ease 0s,
        visibility 0s linear 0s,
        background-color 0.15s ease 0s,
        border-color 0.15s ease 0s;
    }

    .lingq-mode-toggle-btn:hover {
      z-index: 60;
      opacity: 1 !important;
      background-color: rgb(37, 99, 235);
      border-color: rgb(96, 165, 250);
      transform: translateY(-1px) scale(1.1) !important;
    }

    .lingq-mode-toggle-btn:active {
      transform: translateY(-1px) scale(0.95) !important;
    }

    .lingq-mode-toggle-btn svg {
      width: 13px;
      height: 13px;
      pointer-events: none;
    }

    p.m-0 .lingq-mode-toggle-btn,
    .lingq-mode-toggle-btn[data-current-mode="sentence"] {
      width: 24px;
      height: 24px;
      margin-left: 5px;
      margin-right: -29px;
    }

    p.m-0 .lingq-mode-toggle-btn svg,
    .lingq-mode-toggle-btn[data-current-mode="sentence"] svg {
      width: 15px;
      height: 15px;
    }

    @keyframes lingq-sentence-flash {
      0% {
        background-color: rgba(59, 130, 246, 0.32);
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
      }
      100% {
        background-color: transparent;
        box-shadow: 0 0 0 0 transparent;
      }
    }

    .lingq-sentence-target-flash {
      border-radius: 4px;
      animation: lingq-sentence-flash 1.8s ease-out forwards;
    }

    body.lingq-silent-mode-switch [data-radix-popper-content-wrapper],
    body.lingq-silent-mode-switch [role="menu"] {
      opacity: 0 !important;
      pointer-events: none !important;
      transition: none !important;
      animation: none !important;
    }
  `;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  const ICON_TO_SENTENCE = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="1" width="20" height="12" rx="2"></rect>
      <line x1="5" y1="5.5" x2="17" y2="5.5"></line>
      <line x1="5" y1="8.5" x2="12" y2="8.5"></line>
    </svg>
  `;

  const ICON_TO_SCROLL = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m16 16-3 3 3 3"></path>
      <path d="M3 12h14.5a1 1 0 0 1 0 7H13"></path>
      <path d="M3 19h6"></path>
      <path d="M3 5h18"></path>
    </svg>
  `;

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

  function findModeTriggerButton() {
    return (
      document.querySelector('button[aria-label^="Reading mode:"]') ||
      document.querySelector('button[aria-label*="Scroll Mode"]') ||
      document.querySelector('button[aria-label*="Sentence Mode"]') ||
      document.querySelector('button[aria-label*="Page Mode"]')
    );
  }

  function simulateRadixClick(el) {
    if (!el) return;
    const opts = { bubbles: true, cancelable: true, view: window };
    el.dispatchEvent(new PointerEvent("pointerdown", { ...opts, button: 0, pointerId: 1, pointerType: "mouse" }));
    el.dispatchEvent(new MouseEvent("mousedown", { ...opts, button: 0 }));
    el.dispatchEvent(new PointerEvent("pointerup", { ...opts, button: 0, pointerId: 1, pointerType: "mouse" }));
    el.dispatchEvent(new MouseEvent("mouseup", { ...opts, button: 0 }));
    el.click();
  }

  function selectWordInSentence(sentenceEl) {
    const alreadySelected = sentenceEl.querySelector(".sentence-item.selected");
    if (alreadySelected) return alreadySelected;

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

  function switchReadingMode(targetModeName) {
    return new Promise((resolve) => {
      const triggerBtn = findModeTriggerButton();
      if (!triggerBtn) {
        resolve(false);
        return;
      }

      document.body.classList.add("lingq-silent-mode-switch");
      const cleanup = (result) => {
        requestAnimationFrame(() => {
          document.body.classList.remove("lingq-silent-mode-switch");
        });
        resolve(result);
      };

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
          cleanup(false);
        }
      };

      requestAnimationFrame(checkMenu);
    });
  }

  function scrollToSentenceWhenReady(sentenceIndex) {
    let attempts = 0;
    const maxAttempts = 50;

    const checkSentence = () => {
      attempts++;
      const targetSentence = document.querySelector(
        `p.reader-paragraph .reader-sentence[data-s="${sentenceIndex}"], .reader-sentence[data-s="${sentenceIndex}"]`
      );
      const currentMode = getCurrentMode(targetSentence);

      if (targetSentence && currentMode !== "sentence") {
        targetSentence.scrollIntoView({ behavior: "smooth", block: "center" });
        targetSentence.classList.remove(FLASH_CLASS);
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

  async function onToggleButtonClick(event, sentenceEl) {
    event.preventDefault();
    event.stopPropagation();

    const sentenceIndex = sentenceEl.getAttribute("data-s");
    const currentMode = getCurrentMode(sentenceEl);

    if (currentMode === "sentence") {
      const switched = await switchReadingMode("Scroll Mode");
      if (switched && sentenceIndex !== null) {
        scrollToSentenceWhenReady(sentenceIndex);
      }
    } else {
      selectWordInSentence(sentenceEl);
      requestAnimationFrame(async () => {
        await switchReadingMode("Sentence Mode");
      });
    }
  }

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

  injectStyles();

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

  decorateSentences();
})();
