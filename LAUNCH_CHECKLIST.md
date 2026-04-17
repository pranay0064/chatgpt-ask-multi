# Launch Checklist

Reference doc for the Chrome Web Store submission and the Reddit launch. Copy-pasteable.

---

## ✅ What's done

- [x] Icons generated (16 / 48 / 128 / 512 px) in `icons/`
- [x] `manifest.json` wired with icons, tightened description
- [x] Release zip `releases/ask-chatgpt-multi-v0.3.0.zip` (7 KB, includes icons)
- [x] GitHub release **v0.3.0** published and publicly downloadable
- [x] 3 listing screenshots captured
- [x] Demo GIF recorded and optimized → `docs/demo.gif` (1.3 MB, 19.6 s)
- [x] `PRIVACY.md` in the repo for the CWS privacy-policy URL

## ⏳ What's left

- [ ] Part 5: Chrome Web Store submission (30–40 min form)
- [ ] Part 6: Reddit post (after CWS approves — typically 1–5 business days)

---

# Part 5 — Chrome Web Store submission

## Prerequisites

1. A Google account (personal is fine).
2. **$5 one-time developer fee** — paid at first submission.
3. Everything listed under "What's done" above.

## Step-by-step

### 1. Register

Go to <https://chrome.google.com/webstore/devconsole/>. Sign in. Pay the $5. One-time, per Google account.

### 2. Create new item

Click **New item** → upload `releases/ask-chatgpt-multi-v0.3.0.zip`. The console parses the manifest and shows you the name/version/icons it extracted.

### 3. Fill the "Store listing" tab

**Extension name** (≤ 45 chars):
```
Ask ChatGPT Multi
```

**Summary** (short description, ≤ 132 chars):
```
Stack multiple quoted follow-ups into one ChatGPT message. Extends the built-in Ask ChatGPT popup. No API key, no telemetry.
```

**Description** (detailed, max 16k chars — paste this as-is):

```
Ask ChatGPT Multi upgrades the "Ask ChatGPT" popup that appears when you select text in a ChatGPT reply.

The built-in popup only quotes one passage at a time. If ChatGPT just gave you a six-bullet answer and you want to follow up on three of the bullets, you either send three separate messages (losing shared context) or paste quotes by hand.

This extension fixes that one thing: every time you click "Ask ChatGPT", the selected passage is appended to the composer as a markdown blockquote, with the cursor on a fresh blank line. Type your comment, select another passage, click again — quotes stack. Send the whole thing when you're ready.

HOW TO USE
1. Select text in any ChatGPT reply.
2. Click the built-in "Ask ChatGPT" popup.
3. The composer now contains "> your quote" with the cursor below. Type your comment.
4. Select more text. Ask ChatGPT again. The new quote stacks below.
5. Hit Send when ready — the whole stacked message goes in one shot.

PRIVACY
• No API key required — uses your existing chatgpt.com session.
• No data leaves your browser except to chatgpt.com (exactly what happens when you type a message by hand).
• No analytics, no telemetry, no background requests.
• Only runs on chatgpt.com and chat.openai.com. Does nothing on any other site.
• Open source under MIT — the entire extension is ~150 lines of TypeScript, auditable in one file.

SOURCE CODE
https://github.com/pranay0064/chatgpt-ask-multi

Not affiliated with, endorsed by, or sponsored by OpenAI.
```

**Category:** `Productivity`

**Language:** `English (United States)`

### 4. Upload images

- **Store icon:** `icons/icon128.png` (the console may also ask for a larger 440×280 promo tile — you can skip it initially)
- **Screenshots:** upload your three PNGs (the selection, one-quote, three-quotes shots)
  - Chrome Web Store accepts **1280×800** or **640×400**. Either works; I verified yours are fine.

### 5. "Privacy practices" tab

**Single purpose:**
```
Extends the built-in "Ask ChatGPT" popup on chatgpt.com so it stacks multiple quoted passages into one composer message instead of replacing the single quote each time.
```

**Permission justifications:** for **host access** to `https://chatgpt.com/*` and `https://chat.openai.com/*`:
```
Required to run the content script that intercepts the "Ask ChatGPT" popup and writes the user's selected text into the ChatGPT composer as a markdown blockquote. The extension is inert on every other site.
```

(No other permissions are requested, so nothing else needs justifying. This is a genuine advantage — call it out in the description if the reviewer asks.)

**Data usage:** tick **"I do not collect user data."** It's truthful — there is no fetch, no storage, no background page.

**Privacy policy URL:**
```
https://github.com/pranay0064/chatgpt-ask-multi/blob/main/PRIVACY.md
```

### 6. "Distribution" tab

- **Visibility:** **Unlisted** (launch mode — hidden from search; installable by anyone with the link)
- **Regions:** All regions

> **Why Unlisted first?** You get a one-click install link for the Reddit post without fighting for CWS search ranking or drawing an early takedown from OpenAI. Flip to **Public** after 2–4 weeks if installs and feedback are healthy.

### 7. Submit for review

Click **Submit for review** at the top. Typical wait for a first submission: 1–5 business days. You get email updates.

If it's rejected, the email will say which policy was cited. Paste me the rejection text and I'll help draft the appeal.

---

# Part 6 — Reddit launch

**Wait until CWS approves** so the post's install link is one-click. Posting before approval forces Redditors to do the "download zip → unzip → Load unpacked" dance, and you'll lose half your install conversions.

## Pick the subreddits

Post in this order, spaced ~1 day apart (never cross-post same-day — Reddit flags it):

1. **r/SideProject** (first) — kind audience, rewards honesty. Good pressure test before the bigger subs.
2. **r/chrome_extensions** — small but high-intent.
3. **r/ChatGPT** (biggest reach, most noise) — wait until the first two lands well.
4. Optional: **r/OpenAI**, **r/productivity**

## Title

Pick whichever voice fits you best; first is my top pick:

- `I got tired of ChatGPT's "Ask ChatGPT" button only letting me quote one thing, so I built a Chrome extension to stack them. Open source, no API key.`
- `Chrome extension: stack multiple quoted follow-ups into one ChatGPT message (150 lines, MIT)`
- `"Ask ChatGPT" but it lets you ask about 5 things at once — open-source Chrome extension`

## Body

```markdown
You know the little 💬 **Ask ChatGPT** popup that appears when you select text in a ChatGPT reply? It's genuinely useful — it quotes the passage, drops the cursor in the composer, you type your follow-up.

Problem: it only works for **one** passage. If ChatGPT just gave me a 6-bullet list and I want to ask about three of the bullets, I have three bad choices:
- Send three separate follow-ups (loses the shared context)
- Paste quotes by hand (tedious and the markdown-in-composer is fiddly)
- Just ask about one bullet and pretend the others didn't matter

So I built a tiny Chrome extension that fixes the one thing I wanted: **every time you click "Ask ChatGPT", it stacks a new quote into the composer instead of replacing the last one.** Cursor lands on a blank line so you type your comment, quote again, type, quote again, type, then hit Send — the whole thing goes as one message.

![demo](https://raw.githubusercontent.com/pranay0064/chatgpt-ask-multi/main/docs/demo.gif)

**What it is:**
- ~150 lines of TypeScript in one file, auditable
- No API key — uses your normal chatgpt.com session
- No servers, no analytics, no background requests
- Only runs on chatgpt.com
- MIT licensed

**What it isn't:**
- Not affiliated with OpenAI
- Not a silver bullet — if chatgpt.com changes their composer selectors the extension breaks until someone PRs a fix (it's three lines, labeled in the code)

**Install:** [Chrome Web Store link once approved] — or grab the zip from [the latest release](https://github.com/pranay0064/chatgpt-ask-multi/releases/latest) and Load Unpacked.

**Repo:** https://github.com/pranay0064/chatgpt-ask-multi

Star if it's useful, PRs welcome, roast away in comments if you hate it.
```

## First-hour tactics

Reddit's algorithm weights engagement in the first 30–60 minutes disproportionately:

1. **Post at a good time:** 9–11 AM ET on a weekday for US-heavy subs like r/ChatGPT. Check the sub's own active-hours with `https://subredditstats.com/r/chatgpt`.
2. **Pin the top comment yourself** — a short "Here's the one file that does all the work: [link to content.ts](https://github.com/pranay0064/chatgpt-ask-multi/blob/main/src/content.ts)" gives code-curious readers an immediate payoff and boosts engagement.
3. **Reply to every question in the first two hours.** Upvotes track reply velocity.
4. **Don't respond to trolls.** Ignore them; comments drag a post down fastest by triggering mod review.

## If it takes off

- Bump the version and add any requested features on `main` (keeping each feature narrow — people clone for the 150-line charm).
- Turn CWS listing **Public** after ~2 weeks of stability.
- If someone files a bug that selectors broke, prioritize — that's the one class of issue that kills user trust fastest.

## If it flops

- Don't repost to the same sub. Shadow-ban risk.
- Try a different sub with a different angle (r/productivity frames this as "less typing," r/ChatGPTPro frames it as "fewer API round-trips," etc.).
- Or just let it sit; 90% of useful small utilities live quietly on GitHub and accrue users over years.
