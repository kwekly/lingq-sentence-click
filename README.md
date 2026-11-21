# LingQ Quick Sentence Mode Toggle

A lightweight browser extension for [LingQ](https://www.lingq.com/) that makes switching between **Scroll Mode** and **Sentence Mode** fast, predictable, and one-click.

## The Problem

In LingQ's web reader, entering **Sentence Mode** from **Scroll Mode** requires:
1. Clicking a word in the target sentence first (otherwise Sentence Mode may open at the wrong sentence).
2. Moving the mouse up to the top toolbar to open the **Reading Mode** dropdown menu.
3. Clicking **Sentence Mode**.
4. Repeating the dropdown dance to return to **Scroll Mode**, and visually hunting for where you left off.

## What This Extension Does

- **In Scroll Mode (or Page Mode):** Hovering over any sentence reveals a subtle floating toggle button right at the end of the sentence (with zero text layout shift or extra indentation).
  - Clicking it selects that sentence and switches directly into **Sentence Mode** at that exact sentence.
- **In Sentence Mode:** Displays a matching return button at the end of the sentence.
  - Clicking it switches back to **Scroll Mode**, automatically scrolls the viewport to center the current sentence (even if you navigated forward/backward while in Sentence Mode), and briefly flashes a subtle highlight around the sentence so your eyes immediately lock onto your place.

---

## Installation (Chrome / Edge / Brave / Arc)

1. Download or clone this repository to your computer (if downloading a ZIP from GitHub, click **Code -> Download ZIP** and unzip it).
2. Open your browser and navigate to:
   - **Chrome:** `chrome://extensions/`
   - **Edge:** `edge://extensions/`
   - **Brave:** `brave://extensions/`
3. Turn on **Developer mode** (toggle switch in the top-right corner).
4. Click **Load unpacked** (top-left button) and select this folder (the folder containing `manifest.json`).
5. Open or refresh any lesson on [lingq.com](https://www.lingq.com/).

### Firefox (Temporary Add-on)
1. Open `about:debugging#/runtime/this-firefox` in Firefox.
2. Click **Load Temporary Add-on...**
3. Select the `manifest.json` file in this folder.

### Alternative: Tampermonkey / Violentmonkey Userscript
If you prefer a userscript manager instead of loading an unpacked extension, open [`lingq-sentence-toggle.user.js`](./lingq-sentence-toggle.user.js) (or click **Raw** on GitHub) with Tampermonkey or Violentmonkey installed.

---

## Privacy & Security

This extension is intentionally minimal and transparent:
- **Zero special permissions** requested in `manifest.json`.
- **No background scripts, no network requests, no analytics, and no access to cookies or account tokens.**
- Runs strictly on `https://www.lingq.com/*` using standard DOM interactions (`content.js` and `styles.css`).

---

## Note for LingQ Developers

This extension was built as a proof-of-concept for a native UX improvement in the LingQ Web Reader.

Because LingQ already renders every sentence as `<span class="reader-sentence" data-s="...">` in both Scroll Mode and Sentence Mode, this extension works by:
1. Appending a zero-layout-footprint hover button to `.reader-sentence[data-s]`.
2. Setting the active sentence cursor and toggling the reading mode state.
3. Scrolling `.reader-sentence[data-s="<activeIndex>"]` into view when returning to Scroll Mode.

Implemented natively inside LingQ's frontend state store (without needing to simulate clicks on the Radix UI dropdown menu), this transition would be instantaneous!

---

## License

[MIT](./LICENSE)
