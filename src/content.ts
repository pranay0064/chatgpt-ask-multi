// Multi-Ask content script — runs only on chatgpt.com.
//
// Each queued item is an optional quote + a question. On "Send queue", the
// extension types each item into the real composer (formatted as a markdown
// blockquote + question), clicks the native Send button, waits for the
// assistant's reply to finish, then moves on — so every item lands as a
// normal follow-up in the same conversation.

interface QItem {
  id: string;
  quote?: string;
  text: string;
  status: 'pending' | 'running' | 'done' | 'error';
  error?: string;
}

const state = {
  items: [] as QItem[],
  running: false,
  cancel: false,
};

const log = (...args: unknown[]) => console.log('[MultiAsk]', ...args);
const uid = () => Math.random().toString(36).slice(2, 10);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- DOM helpers: ChatGPT composer + send/stop buttons ----------

function findComposer(): HTMLElement | null {
  return (
    document.getElementById('prompt-textarea') ??
    (document.querySelector('form div[contenteditable="true"]') as HTMLElement | null) ??
    (document.querySelector('form textarea') as HTMLElement | null)
  );
}

function findSendButton(): HTMLButtonElement | null {
  return (
    (document.querySelector('button[data-testid="send-button"]') as HTMLButtonElement | null) ??
    (document.querySelector('button[aria-label="Send prompt"]') as HTMLButtonElement | null) ??
    (document.querySelector('button[aria-label*="Send" i]') as HTMLButtonElement | null)
  );
}

function findStopButton(): HTMLButtonElement | null {
  return (
    (document.querySelector('button[data-testid="stop-button"]') as HTMLButtonElement | null) ??
    (document.querySelector('button[aria-label="Stop generating"]') as HTMLButtonElement | null) ??
    (document.querySelector('button[aria-label*="Stop" i]') as HTMLButtonElement | null)
  );
}

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
  el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
  return true;
}

// "Done" = Stop button has been absent continuously for settleMs.
async function waitForResponseDone(opts: { timeoutMs?: number; settleMs?: number } = {}) {
  const timeoutMs = opts.timeoutMs ?? 5 * 60 * 1000;
  const settleMs = opts.settleMs ?? 1500;
  const start = Date.now();

  const startDeadline = Date.now() + 10_000;
  while (!findStopButton() && Date.now() < startDeadline) {
    if (state.cancel) throw new Error('cancelled');
    await sleep(150);
  }

  let stoppedAt: number | null = null;
  while (Date.now() - start < timeoutMs) {
    if (state.cancel) throw new Error('cancelled');
    if (findStopButton()) {
      stoppedAt = null;
    } else {
      if (stoppedAt === null) stoppedAt = Date.now();
      if (Date.now() - stoppedAt >= settleMs) return;
    }
    await sleep(200);
  }
  throw new Error('timed-out waiting for response');
}

function formatMessage(item: QItem): string {
  const q = item.text.trim();
  if (!item.quote) return q;
  const blockquote = item.quote
    .split('\n')
    .map((l) => `> ${l}`)
    .join('\n');
  return `${blockquote}\n\n${q}`;
}

async function sendOne(item: QItem) {
  const message = formatMessage(item);
  if (!setComposerText(message)) throw new Error('composer not found');
  await sleep(120);
  for (let i = 0; i < 12; i++) {
    const btn = findSendButton();
    if (btn && !btn.disabled) { btn.click(); return; }
    await sleep(150);
  }
  throw new Error('send button never enabled');
}

async function runQueue() {
  if (state.running) return;
  if (state.items.some((i) => i.status !== 'done' && !i.text.trim())) {
    setStatus('Every row needs a question.', true);
    return;
  }
  state.running = true;
  state.cancel = false;
  render();

  try {
    for (let i = 0; i < state.items.length; i++) {
      const item = state.items[i];
      if (item.status === 'done') continue;
      if (state.cancel) break;
      item.status = 'running';
      item.error = undefined;
      render();
      setStatus(`Sending ${i + 1}/${state.items.length}…`);
      log(`→ #${i + 1}`, { quote: item.quote?.slice(0, 40), q: item.text.slice(0, 60) });
      try {
        await sendOne(item);
        await waitForResponseDone();
        item.status = 'done';
        log(`  ✓ #${i + 1}`);
        await sleep(400);
      } catch (e) {
        item.status = 'error';
        item.error = (e as Error).message;
        log(`  ✗`, e);
        setStatus(`Stopped: ${item.error}`, true);
        render();
        break;
      }
      render();
    }
    if (!state.cancel && state.items.every((i) => i.status === 'done')) {
      setStatus('Queue complete.');
    }
  } finally {
    state.running = false;
    render();
  }
}

// ---------- Widget UI ----------

let root: HTMLDivElement | null = null;
let listEl: HTMLDivElement;
let countEl: HTMLSpanElement;
let sendBtn: HTMLButtonElement;
let cancelBtn: HTMLButtonElement;
let clearBtn: HTMLButtonElement;
let addBlankBtn: HTMLButtonElement;
let statusEl: HTMLDivElement;

function setStatus(text: string, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.toggle('error', isError);
}

function addItem(opts: { quote?: string } = {}) {
  const item: QItem = { id: uid(), quote: opts.quote, text: '', status: 'pending' };
  state.items.push(item);
  render();
  // Focus the new row's input.
  requestAnimationFrame(() => {
    const input = root?.querySelector(
      `.mq-item[data-id="${item.id}"] .mq-q-input`,
    ) as HTMLTextAreaElement | null;
    input?.focus();
  });
}

function removeItem(id: string) {
  state.items = state.items.filter((i) => i.id !== id);
  render();
}

function render() {
  if (!root) return;
  countEl.textContent = state.items.length ? `(${state.items.length})` : '';
  listEl.innerHTML = '';

  if (state.items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'mq-empty';
    empty.textContent = 'Select text in the chat to add a quoted question, or click + below for a plain question.';
    listEl.appendChild(empty);
  }

  state.items.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = `mq-item ${item.status}`;
    row.dataset.id = item.id;

    const num = `<span class="mq-num">${idx + 1}</span>`;
    const remove = `<button class="mq-remove" title="Remove">×</button>`;
    const quoteHtml = item.quote
      ? `<div class="mq-quote"><span class="mq-quote-icon">↪</span><span class="mq-quote-text"></span></div>`
      : '';
    row.innerHTML = `
      <div class="mq-row-head">${num}${remove}</div>
      ${quoteHtml}
      <textarea class="mq-q-input" placeholder="Your question about this…" rows="2"></textarea>
      ${item.error ? `<div class="mq-err"></div>` : ''}
    `;

    if (item.quote) {
      (row.querySelector('.mq-quote-text') as HTMLElement).textContent = item.quote;
    }
    const input = row.querySelector('.mq-q-input') as HTMLTextAreaElement;
    input.value = item.text;
    input.disabled = state.running && item.status !== 'pending';
    input.addEventListener('input', () => { item.text = input.value; });
    input.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        void runQueue();
      }
    });
    (row.querySelector('.mq-remove') as HTMLButtonElement).addEventListener('click', () => {
      if (state.running) return;
      removeItem(item.id);
    });
    if (item.error) {
      (row.querySelector('.mq-err') as HTMLElement).textContent = item.error;
    }

    listEl.appendChild(row);
  });

  sendBtn.disabled = state.running || !state.items.some((i) => i.status !== 'done' && i.text.trim());
  cancelBtn.disabled = !state.running;
  clearBtn.disabled = state.running || state.items.length === 0;
  addBlankBtn.disabled = state.running;
  sendBtn.textContent = state.running ? 'Sending…' : 'Send queue';
}

function buildWidget() {
  if (root) return;
  root = document.createElement('div');
  root.id = 'mq-widget';
  root.innerHTML = `
    <div id="mq-header">
      <span>Multi-Ask <span class="mq-count"></span></span>
      <button class="mq-toggle" title="Collapse">–</button>
    </div>
    <div id="mq-body">
      <div id="mq-list"></div>
      <button id="mq-add-blank" class="mq-add-blank" type="button">+ Add plain question</button>
    </div>
    <div id="mq-actions">
      <button class="mq-send" id="mq-send">Send queue</button>
      <button id="mq-cancel">Cancel</button>
      <button id="mq-clear">Clear</button>
    </div>
    <div id="mq-status"></div>
  `;
  document.body.appendChild(root);

  listEl = root.querySelector('#mq-list') as HTMLDivElement;
  countEl = root.querySelector('.mq-count') as HTMLSpanElement;
  sendBtn = root.querySelector('#mq-send') as HTMLButtonElement;
  cancelBtn = root.querySelector('#mq-cancel') as HTMLButtonElement;
  clearBtn = root.querySelector('#mq-clear') as HTMLButtonElement;
  addBlankBtn = root.querySelector('#mq-add-blank') as HTMLButtonElement;
  statusEl = root.querySelector('#mq-status') as HTMLDivElement;

  sendBtn.addEventListener('click', () => { void runQueue(); });
  cancelBtn.addEventListener('click', () => { state.cancel = true; setStatus('Cancelling…'); });
  clearBtn.addEventListener('click', () => { state.items = []; render(); setStatus(''); });
  addBlankBtn.addEventListener('click', () => addItem());

  const header = root.querySelector('#mq-header') as HTMLElement;
  const toggleBtn = root.querySelector('.mq-toggle') as HTMLButtonElement;
  const toggle = () => {
    root!.classList.toggle('collapsed');
    toggleBtn.textContent = root!.classList.contains('collapsed') ? '+' : '–';
  };
  header.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('.mq-toggle')) return;
    toggle();
  });
  toggleBtn.addEventListener('click', toggle);

  render();
  setStatus('Select text → click 📎 Quote → add question. Repeat. Then Send queue.');
}

// ---------- Selection-capture floating button ----------

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
    selectionBtn.addEventListener('mousedown', (e) => e.preventDefault()); // keep selection alive
    document.body.appendChild(selectionBtn);
  }
  selectionBtn.onclick = () => {
    addItem({ quote: text });
    hideSelectionButton();
    window.getSelection()?.removeAllRanges();
    if (root?.classList.contains('collapsed')) {
      (root.querySelector('.mq-toggle') as HTMLButtonElement).click();
    }
  };
  selectionBtn.style.display = 'block';
  selectionBtn.style.left = `${Math.max(8, x)}px`;
  selectionBtn.style.top = `${Math.max(8, y)}px`;
}

function isInsideWidget(target: EventTarget | null): boolean {
  if (!(target instanceof Node)) return false;
  if (root && root.contains(target)) return true;
  if (selectionBtn && selectionBtn.contains(target)) return true;
  return false;
}

document.addEventListener('mouseup', (e) => {
  if (isInsideWidget(e.target)) return;
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
  if (isInsideWidget(e.target)) return;
  hideSelectionButton();
});

// ---------- Intercept chatgpt.com's native "Ask ChatGPT" popup ----------
// When the user clicks the native popup, we suppress the default behavior
// (which would paste the quote into the composer and replace any prior quote),
// and instead add the selection to our queue as a new row.

function isNativeAskButton(el: HTMLElement | null): boolean {
  if (!el) return false;
  const btn = el.closest('button, [role="button"]') as HTMLElement | null;
  if (!btn) return false;
  const label = (btn.textContent ?? '').replace(/\s+/g, ' ').trim();
  // Match "Ask ChatGPT" exactly or with leading quote-mark glyph (»/99/etc).
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
  log('intercepted native Ask ChatGPT →', text.slice(0, 60));
  addItem({ quote: text });
  sel?.removeAllRanges();
  hideSelectionButton();
  if (root?.classList.contains('collapsed')) {
    (root.querySelector('.mq-toggle') as HTMLButtonElement).click();
  }
  flashWidget();
};

// Capture phase, on both pointerdown and click, so we beat chatgpt.com's own handler.
['pointerdown', 'mousedown', 'click'].forEach((type) => {
  document.addEventListener(type, interceptHandler as EventListener, { capture: true });
});

function flashWidget() {
  if (!root) return;
  root.classList.add('mq-flash');
  setTimeout(() => root?.classList.remove('mq-flash'), 700);
}

// ---------- Boot ----------

function boot() {
  if (document.body) buildWidget();
  else window.addEventListener('DOMContentLoaded', buildWidget, { once: true });
}
boot();
