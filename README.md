# LingQ Quick Sentence Mode Toggle

A lightweight browser extension for [LingQ](https://www.lingq.com/) that makes switching between **Scroll Mode** and **Sentence Mode** fast, predictable, and one-click.

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

## License

[MIT](./LICENSE)
