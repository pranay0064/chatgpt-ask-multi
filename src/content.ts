// V2 — inline composer.
//
// No widget. When the user selects text in the chat and clicks the native
// "Ask ChatGPT" popup, we intercept it: the selection is appended to the
// existing composer content as a markdown blockquote, followed by a blank
// line, and the cursor is left at the end — ready for the user to type
// their comment. Repeating the flow stacks multiple quote+comment blocks
// inside the composer. The user sends the whole thing manually when ready.

const log = (...args: unknown[]) => console.log('[MultiAsk]', ...args);

function findComposer(): HTMLElement | null {
  return (
    document.getElementById('prompt-textarea') ??
    (document.querySelector('form div[contenteditable="true"]') as HTMLElement | null) ??
    (document.querySelector('form textarea') as HTMLElement | null)
  );
}

// Collapse any run of 3+ newlines down to exactly two (i.e. at most one blank
// line between blocks). ProseMirror's innerText readout can include extra
// newlines for empty paragraphs, which would otherwise accumulate every time
// we round-trip through the composer.
function normalizeBlankLines(text: string): string {
  return text.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n');
}

function getComposerText(): string {
  const el = findComposer();
  if (!el) return '';
  if (el instanceof HTMLTextAreaElement) return el.value;
  // innerText preserves visual line breaks between paragraphs.
  return (el as HTMLElement).innerText ?? '';
}

// Replaces the whole composer with `text`; cursor ends at the end of the
// inserted text. Works for both a plain <textarea> and ChatGPT's ProseMirror
// contenteditable (where execCommand('insertText') is the one reliable way
// to drive ProseMirror from outside React).
function setComposerText(text: string): boolean {
  const el = findComposer();
  if (!el) return false;

  if (el instanceof HTMLTextAreaElement) {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value',
    )?.set;
    setter?.call(el, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus();
    el.setSelectionRange(text.length, text.length);
    return true;
  }

  el.focus();
  const sel = window.getSelection();
  if (sel) {
    const range = document.createRange();
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);
  }
  document.execCommand('insertText', false, text);
  el.dispatchEvent(
    new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }),
  );
  return true;
}

// Build a blockquote from a possibly-multiline selection. Internal blank lines
// in the quote are collapsed so the block stays tight.
function asBlockquote(quote: string): string {
  const lines = normalizeBlankLines(quote.trim()).split('\n');
  return lines.map((l) => (l ? `> ${l}` : '>')).join('\n');
}

// Append the selected passage to whatever the user already has in the
// composer, then leave one blank line below it for their next comment.
//
//   [existing text, normalized + trimmed]
//
//   > <new quote>
//
//   ▮  ← cursor
function appendQuoteToComposer(quote: string) {
  const current = normalizeBlankLines(getComposerText()).trim();
  const block = asBlockquote(quote);
  const combined = current ? `${current}\n\n${block}\n\n` : `${block}\n\n`;
  // Guard against anything still sneaking through (e.g. a quote that ends
  // with its own trailing blanks).
  setComposerText(normalizeBlankLines(combined));
}

// ---------- Intercept chatgpt.com's native "Ask ChatGPT" popup ----------

function isNativeAskButton(el: HTMLElement | null): boolean {
  if (!el) return false;
  const btn = el.closest('button, [role="button"]') as HTMLElement | null;
  if (!btn) return false;
  const label = (btn.textContent ?? '').replace(/\s+/g, ' ').trim();
  // Match "Ask ChatGPT" exactly or with a leading glyph (» / 99 / etc).
  return /^(?:[^\w\s]*\s*)?Ask ChatGPT$/i.test(label) && label.length < 40;
}

const interceptHandler = (e: MouseEvent | PointerEvent) => {
  const target = e.target as HTMLElement | null;
  if (!isNativeAskButton(target)) return;
  const sel = window.getSelection();
  const text = sel?.toString().trim() ?? '';
  if (!text) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  log('intercepted Ask ChatGPT →', text.slice(0, 60));
  sel?.removeAllRanges();
  appendQuoteToComposer(text);
};

// Capture phase on all three events so we beat chatgpt.com's own handler
// no matter which one it uses to trigger the default quote behavior.
['pointerdown', 'mousedown', 'click'].forEach((type) => {
  document.addEventListener(type, interceptHandler as EventListener, { capture: true });
});

// ---------- Fallback: floating "📎 Quote" button near any selection ----------
// If the native popup doesn't appear (e.g. selecting outside a ChatGPT message
// bubble), this button lets the user still append to the composer.

let selectionBtn: HTMLButtonElement | null = null;

function hideSelectionButton() {
  if (selectionBtn) selectionBtn.style.display = 'none';
}

function showSelectionButton(x: number, y: number, text: string) {
  if (!selectionBtn) {
    selectionBtn = document.createElement('button');
    selectionBtn.id = 'mq-sel-btn';
    selectionBtn.type = 'button';
    selectionBtn.innerHTML = '📎 Quote';
    selectionBtn.addEventListener('mousedown', (e) => e.preventDefault());
    document.body.appendChild(selectionBtn);
  }
  selectionBtn.onclick = () => {
    appendQuoteToComposer(text);
    window.getSelection()?.removeAllRanges();
    hideSelectionButton();
  };
  selectionBtn.style.display = 'block';
  selectionBtn.style.left = `${Math.max(8, x)}px`;
  selectionBtn.style.top = `${Math.max(8, y)}px`;
}

document.addEventListener('mouseup', (e) => {
  if (selectionBtn && selectionBtn.contains(e.target as Node)) return;
  setTimeout(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? '';
    if (!text || text.length < 2) {
      hideSelectionButton();
      return;
    }
    const range = sel!.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const x = Math.min(window.innerWidth - 110, rect.right - 8);
    const y = Math.min(window.innerHeight - 40, rect.bottom + 6);
    showSelectionButton(x, y, text);
  }, 10);
});

document.addEventListener('mousedown', (e) => {
  if (selectionBtn && selectionBtn.contains(e.target as Node)) return;
  hideSelectionButton();
});
