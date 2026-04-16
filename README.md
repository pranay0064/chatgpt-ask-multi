# Ask ChatGPT Multi

Chrome extension that adds a floating **Multi-Ask** widget on chatgpt.com. Stack as many quoted follow-ups as you want, then hit **Send as one** — every row goes into the current chat as a single combined message, so the assistant can address all of them in one reply.

No side panel. No new tabs. No API key. Everything lands in the conversation you're already in.

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

1. Select text in the chat → click the native **💬 Ask ChatGPT** popup (the extension intercepts it and adds a row to the widget with that quote pinned)
2. Type your follow-up question for that row
3. Select more text → **Ask ChatGPT** → next row → type its question
4. Click **Send as one** — every row is combined into a single message (each quote as a markdown blockquote followed by its question) and sent to the current chat

Other actions:
- **+ Add plain question** for a row without a quote
- **📎 Quote** button that floats next to any selection (backup for when the native popup doesn't show)
- **⌘/Ctrl+Enter** inside any question input to send

## How it works

- Content script runs only on `chatgpt.com` / `chat.openai.com`
- Intercepts clicks on the native "Ask ChatGPT" popup so the selection is routed to our queue instead of overwriting the composer's single quote reference
- On send: joins every pending row into one message, types it into ChatGPT's ProseMirror composer via `execCommand('insertText')`, then clicks the page's own Send button

## Fragility

- Selectors (`data-testid="send-button"`, `data-testid="stop-button"`, `#prompt-textarea`, the "Ask ChatGPT" popup label) can change with chatgpt.com updates. If anything breaks, the one place to fix is the `find*` / `isNativeAskButton` helpers at the top of [src/content.ts](src/content.ts).
- Long assistant replies can exceed the 5-minute wait — bump `timeoutMs` in `waitForResponseDone`.
