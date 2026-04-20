# Ask ChatGPT Multi

> Stack multiple quoted follow-ups into one ChatGPT message — without ever leaving the composer.

A tiny Chrome extension that adds a green **📎 Quote** button next to any text you select on chatgpt.com. Clicking it appends the selection into the composer as a markdown blockquote and drops the cursor on a fresh blank line so you can type your comment. Quote again → stacks below. Quote again → stacks below. Send when you're ready.

No widget. No side panel. No API key. ChatGPT's own "Ask ChatGPT" popup is left completely alone — use it when you want the native single-quote behavior, use our Quote button when you want to stack.

![Demo: selecting multiple passages and stacking them as quoted follow-ups in one ChatGPT message](docs/demo.gif)

---

## Why

ChatGPT's native "Ask ChatGPT" popup quotes **one** passage at a time and replaces any prior quote. If a long reply has five bullet points and you want to ask about four of them, you either:

- send four separate follow-ups (loses shared context), or
- paste quotes by hand (tedious and error-prone)

This extension adds a **📎 Quote** button next to any selection. Click it once for each passage you want to reference, type a comment under each, and send them all in one message. The native Ask ChatGPT popup keeps working as normal — use whichever fits your current flow.

---

## Install

### 👉 [Install from the Chrome Web Store](https://chromewebstore.google.com/detail/gfimipjodfpoeocpboomepjgmocigfjb)

One click, auto-updates, works in Chrome / Edge / Brave / Arc / any Chromium browser.

### Alternative: unpacked zip

<details>
<summary>If you'd rather not use the store listing</summary>

1. Download `ask-chatgpt-multi-vX.Y.Z.zip` from [**Releases**](https://github.com/pranay0064/chatgpt-ask-multi/releases)
2. Unzip it somewhere you'll keep around
3. Chrome → `chrome://extensions` → enable **Developer mode** → **Load unpacked** → pick the unzipped folder

</details>

### Build from source

<details>
<summary>For contributors / auditors</summary>

```bash
git clone https://github.com/pranay0064/chatgpt-ask-multi.git
cd chatgpt-ask-multi
npm install
npm run build
```

Then in Chrome: `chrome://extensions` → Developer mode → **Load unpacked** → pick `dist/`.

</details>

---

## Usage

### The basic flow

1. In any ChatGPT reply, **select a passage** with your mouse
2. Click the green **📎 Quote** button that appears next to the selection
3. The composer now contains:
   ```
   > your selected passage

   ▮
   ```
   (cursor on the blank line, ready to type)
4. Type your comment/question for that passage
5. Select another passage → **📎 Quote** → it stacks below
6. Keep going as long as you want
7. Hit the normal ChatGPT **Send** button (↑ arrow)

> ChatGPT's own **💬 Ask ChatGPT** popup is unchanged — it still quotes one passage in its native style. Use it when that's what you want; use our **📎 Quote** button when you want to stack.

### Example

Starting from a ChatGPT reply like:
```
• MergeTree stores files as marks, columns, checksums
• Bloom filters work by hashing into bitmaps
• Query planner chooses between full scans and index scans
```

After three quote-and-comment cycles, your composer looks like:
```
> MergeTree stores files as marks, columns, checksums

how are marks computed?

> Bloom filters work by hashing into bitmaps

which hash function does ClickHouse use?

> Query planner chooses between full scans and index scans

when does it prefer full scans?
```

Send that, ChatGPT addresses all three in one reply.

---

## Privacy

- **No API key.** The extension uses your existing chatgpt.com browser session, same as clicking around the site manually.
- **No data leaves your browser.** Your selections and messages go only to chatgpt.com — exactly where they'd go if you typed them by hand. The extension has no servers, no telemetry, no analytics.
- **No tracking.** No background requests, no bundled SDKs. Read [src/content.ts](src/content.ts) — it's under 150 lines.
- **Host permissions** are limited to `chatgpt.com` and `chat.openai.com`. The extension does nothing on any other site.

---

## Troubleshooting

**The 📎 Quote button never appears.**
Make sure you've selected at least 2 characters and that the extension is enabled on chatgpt.com. Check Chrome DevTools → Console for errors. If the button never shows, the content script isn't running — reload the extension on `chrome://extensions` and refresh chatgpt.com.

**Extra blank lines are creeping in.**
Already fixed in the latest release. If it still happens with a specific sequence, open an issue with the exact steps.

**The composer selector stopped working after a chatgpt.com update.**
The extension is small and there's one place to fix it: the `findComposer` helper at the top of [src/content.ts](src/content.ts). PRs welcome.

**I want to quote from outside chatgpt.com (e.g. a docs page).**
Not supported. The extension only runs on chatgpt.com itself.

---

## How it works (for contributors)

- Content script runs only on `chatgpt.com` / `chat.openai.com` (see `manifest.json`)
- `mouseup` listener watches for text selections and shows a small **📎 Quote** button positioned just below the selection's bounding box
- Click handler calls `appendQuoteToComposer`, which reads the composer's current `innerText`, normalizes whitespace, appends `\n\n> <quote>\n\n`, and writes it back via `execCommand('insertText')` — the one reliable way to drive ChatGPT's ProseMirror composer from outside React
- `normalizeBlankLines` collapses any run of 3+ newlines to 2, so round-tripping through the composer can't accumulate extra gaps
- We deliberately do **not** touch ChatGPT's own "Ask ChatGPT" popup — users who want the native single-quote behavior still have it

Everything worth reading is in one file: [src/content.ts](src/content.ts).

---

## Development

```bash
npm install
npm run dev     # rebuild on every save
npm run build   # one-shot production build into dist/
```

After a rebuild, hit the reload arrow on `chrome://extensions` and refresh your chatgpt.com tab.

---

## Roadmap / ideas

Open to PRs on any of these:

- [ ] Keyboard shortcut (e.g. ⌘⇧Q) to append the current selection without clicking the popup
- [ ] Support selections from arbitrary web pages, with their source URL included in the quote
- [ ] Edit/remove individual quote blocks from inside the composer
- [ ] Firefox port (MV3 differences to sort out)

---

## Contributing

Issues and PRs welcome. Keep changes scoped — this extension should stay small and auditable. If you're adding a feature, please also note in the PR whether it could trip Chrome Web Store policies.

---

## Disclaimer

Not affiliated with, endorsed by, or sponsored by OpenAI. "ChatGPT" is a trademark of OpenAI. This extension automates clicks and text entry on `chatgpt.com` inside your own browser session — no different, technically, from typing faster. You are responsible for making sure your usage complies with OpenAI's Terms of Service.

---

## License

[MIT](LICENSE) — do what you want, no warranty.
