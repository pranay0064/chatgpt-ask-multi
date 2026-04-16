# Ask ChatGPT Multi

Chrome extension that adds a floating **Multi-Ask** widget on chatgpt.com. Queue as many questions as you want, then hit **Send queue** — each one fires into the current chat as a normal follow-up, one after another.

No side panel. No new tabs. No API key. Every question lands in the same conversation you're already in.

## Install (dev)

```bash
npm install
npm run build
```

Then in Chrome:

1. `chrome://extensions` → enable **Developer mode**
2. **Load unpacked** → pick `dist/`
3. Open chatgpt.com — the Multi-Ask widget docks bottom-right

## Use

1. Type a question in the widget → **Add** (or ⌘/Ctrl+Enter)
2. Repeat for as many as you want
3. Click **Send queue**
   - The extension types Q1 into the real composer, clicks Send, waits for the response to finish streaming, then sends Q2, and so on
4. **Cancel** stops after the current question completes

## How it works

- Content script runs only on `chatgpt.com` / `chat.openai.com`
- To send: sets the composer text via `execCommand('insertText')` (works with ChatGPT's ProseMirror contenteditable) and clicks the page's own Send button
- To know when to send the next one: watches the Stop button — when it disappears and the Send button re-enables, the assistant is done

## Fragility

- Selectors (`data-testid="send-button"`, `data-testid="stop-button"`, `#prompt-textarea`) can change. If sends stop working, update the selectors in [src/content.ts](src/content.ts).
- If an assistant response takes longer than 5 minutes, the wait times out — bump `timeoutMs` in `waitForResponseDone`.
