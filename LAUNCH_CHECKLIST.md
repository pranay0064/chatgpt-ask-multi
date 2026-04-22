# Launch Checklist

Copy-pasteable reference for the Reddit launch. The Chrome Web Store listing is already live — this doc is now just the post.

**Extension URL:** https://chromewebstore.google.com/detail/gfimipjodfpoeocpboomepjgmocigfjb

---

## ✅ What's done

- [x] Chrome Web Store listing **live** (v0.4.0 approved and published)
- [x] Icons, privacy policy, screenshots, manifest — all shipped
- [x] Demo GIF (`docs/demo.gif`, 1.3 MB, 19.6 s) — verified to show the Quote button being clicked
- [x] Bug fix: native "Ask ChatGPT" popup is no longer hijacked

## ⏳ What's left

- [ ] Post to r/SideProject
- [ ] Post to r/chrome_extensions (day 2, if first one lands well)
- [ ] Post to r/ChatGPT (day 3, only if above two gained traction)

---

# Reddit post — v0.4.0 copy

## Pick the subreddits

Post in this order, spaced **~24 hours apart** (same-day cross-posts get flagged):

1. **r/SideProject** — kind audience, rewards honesty. Good pressure test.
2. **r/chrome_extensions** — small but high-intent.
3. **r/ChatGPT** — biggest reach, most noise. Only go here after the first two land.
4. Optional: **r/OpenAI**, **r/productivity**

## Title

Top pick first. Pick whichever sounds most like you:

- `Tiny Chrome extension I built to stack multiple quoted follow-ups into one ChatGPT message. Open source, no API key.`
- `Chrome extension: select text in a ChatGPT reply, click Quote, repeat, stack, send (150 lines, MIT, open source)`
- `I wanted to ask ChatGPT follow-ups about 3 things at once. So I built this Chrome extension.`

## Body (paste as-is)

```markdown
You know the little 💬 **Ask ChatGPT** popup that appears when you select text in a ChatGPT reply? It's useful, but it only quotes **one** passage — click it twice and the second quote replaces the first.

If ChatGPT just gave me a 6-bullet answer and I want to follow up on three bullets together, my choices were:
- Send three separate messages (loses the shared context)
- Paste the quotes by hand (tedious; markdown in the composer is fiddly)
- Just ask about one bullet and drop the others

So I built a tiny Chrome extension. It adds a small green **📎 Quote** button next to any text you highlight on chatgpt.com. Click it — the selection appends to the composer as a markdown blockquote and the cursor lands on a fresh blank line. Type your comment. Select another passage. Click Quote again. It stacks below. Keep going. Hit Send when ready — the whole thing goes as one message, and ChatGPT addresses all of them together.

ChatGPT's own "Ask ChatGPT" popup is left completely alone — if you want the native single-quote behavior, use that. If you want to stack, use the Quote button.

![demo](https://raw.githubusercontent.com/pranay0064/chatgpt-ask-multi/main/docs/demo.gif)

**What it is:**
- ~145 lines of TypeScript in one file, auditable
- No API key — uses your normal chatgpt.com session
- No servers, no analytics, no background requests
- Only runs on chatgpt.com and chat.openai.com
- MIT licensed

**What it isn't:**
- Not affiliated with OpenAI
- Not a silver bullet — if chatgpt.com changes their composer selector the extension breaks until someone PRs a fix (it's one function, labeled in the code)

**Install (one click):** https://chromewebstore.google.com/detail/gfimipjodfpoeocpboomepjgmocigfjb

**Source:** https://github.com/pranay0064/chatgpt-ask-multi

Star if it's useful, PRs welcome, roast away in comments if you hate it.
```

---

## First-hour tactics

Reddit weights the first 30–60 minutes disproportionately. Plan around that:

1. **Time the post.** For US-heavy subs (r/ChatGPT, r/SideProject): **9–11 AM Eastern** on a weekday. Indian time: 18:30–20:30 IST. Avoid weekends — engagement drops.
2. **Pin the top comment yourself** within the first 2 minutes. Suggested:
   > Here's the one file that does all the work: https://github.com/pranay0064/chatgpt-ask-multi/blob/main/src/content.ts — 145 lines, one function per concern, zero dependencies. If chatgpt.com ever changes their composer selector, it's a two-line fix.
3. **Reply to every question in the first two hours.** Upvotes track reply velocity.
4. **Don't respond to trolls.** Ignoring is faster than arguing; comments drag a post down fastest by triggering mod review.

## If a post gets rejected by automod

Common reasons in these subs:
- **Account too new** — r/ChatGPT often requires account age > 30 days and some karma. Start in r/SideProject if your main account is new.
- **Self-promotion ratio** — some subs want 9 non-promo comments per 1 promo post. Comment in other threads before you post.
- **No screenshot/GIF** — post gets auto-removed. The GIF in the body should cover this; if automod still flags it, add a top-level comment with just the CWS screenshot.

## If a post flops

- **Don't repost to the same sub for at least 30 days** — shadow-ban risk.
- Try a different sub with a different angle: r/productivity frames this as "less typing," r/ChatGPTPro as "fewer round-trips," r/learnprogramming as "here's a 150-line Chrome MV3 extension that does one thing well."
- Or let it sit. 90% of useful utilities accrue users quietly over years. The CWS listing earns installs from people searching the store independently of any Reddit hit.

---

## After the launch — things to watch

- **GitHub issues** — if anyone reports "selectors broken," that's the most time-sensitive bug class. Fix within a day if possible; it's the one thing that kills user trust fastest.
- **CWS dashboard** — weekly active users, review stars. If you get a 1-star review with a specific complaint, reply to it.
- **OpenAI ToS action** — unlikely, but if CWS emails you about a trademark claim, reply calmly and offer to rename (e.g. "Stack Quote for ChatGPT"). Don't fight it.
- **v0.5.0 ideas** — keyboard shortcut to quote without clicking, remove-individual-quote-block from the composer, Firefox port. Keep each new feature narrow.
