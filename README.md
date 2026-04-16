# Ask ChatGPT Multi — inline composer (V2)

Chrome extension that extends chatgpt.com's built-in **"Ask ChatGPT"** popup. Instead of overwriting the composer's single quote reference, it **appends** each selection you quote into the composer as a markdown blockquote and drops the cursor on the next line — so you can build up a multi-quote, multi-comment message and send it yourself when you're ready.

No widget. No side panel. No new tabs. No API key.

## Install (dev)

```bash
npm install
npm run build
```

Then in Chrome:

1. `chrome://extensions` → enable **Developer mode**
2. **Load unpacked** → pick `dist/`
3. Open chatgpt.com

## Use

1. Select a passage in a ChatGPT reply → click the native **💬 Ask ChatGPT** popup
2. The composer now contains:
   ```
   > your selected passage

   ▮
   ```
   (cursor on the blank line)
3. Type your comment / question for that passage
4. Select another passage → **Ask ChatGPT** → the composer now looks like:
   ```
   > passage 1

   your comment 1

   > passage 2

   ▮
   ```
5. Repeat as many times as you want
6. Hit the normal ChatGPT **Send** button — it goes as one message

**Fallback:** if the native popup doesn't appear for some selection (e.g. selecting outside a message bubble), a small green **📎 Quote** button floats next to the selection. Clicking it does the same thing.

## How it works

- Content script runs only on `chatgpt.com` / `chat.openai.com`
- Listens for clicks on any button whose label is "Ask ChatGPT" and intercepts them in the capture phase — chatgpt.com's own handler never runs, so no single quote pill appears
- Reads the composer's current `innerText`, appends `\n\n> <quote>\n\n`, and writes it back via `execCommand('insertText')` (the one reliable way to drive ChatGPT's ProseMirror composer from outside React)
- Cursor ends up at the end of the inserted text — ready for typing

## Fragility

- Selectors (`#prompt-textarea`, the "Ask ChatGPT" popup label) can change with chatgpt.com updates. If anything breaks, the one place to fix is `findComposer` / `isNativeAskButton` at the top of [src/content.ts](src/content.ts).
- This branch (`feat/inline-composer`) is an alternative to the queue-widget approach on `main` / `feat/combined-send`; pick whichever UX you prefer.
