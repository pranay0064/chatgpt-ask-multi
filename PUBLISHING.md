# Publishing to the Chrome Web Store

This extension is distributable today as an unpacked load. If you want it on the Chrome Web Store so users can install it in one click, here's what's involved.

---

## TL;DR of the risk

- **Possible, not guaranteed.** Chrome Web Store review is discretionary. Extensions that automate third-party sites (chatgpt.com) can be approved *or* rejected depending on the reviewer and the wording of your listing.
- **OpenAI's ToS.** OpenAI's Terms of Service prohibit "automated or programmatic" use that "interferes with the service." This extension augments the site's own UI rather than scripting it headlessly, but you should read the ToS for yourself and accept the risk of a takedown request.
- **Low-risk play:** publish it as **Unlisted** first so only people with the link can install. That gets you a one-click install URL for your Reddit post without fighting for search ranking.

---

## What you need before submitting

### 1. A developer account ($5 one-time)

Register at <https://chrome.google.com/webstore/devconsole/>. Google charges a one-time $5 registration fee.

### 2. Icons (required)

Add PNG icons into `icons/` at three sizes:

- `icons/icon16.png` (toolbar)
- `icons/icon48.png` (extensions page)
- `icons/icon128.png` (store listing — **required**)

Then add to `manifest.json`:

```json
"icons": {
  "16": "icons/icon16.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
}
```

Design tip: it's a utility extension, so keep the icon simple — a `💬+` glyph or a stacked-quote motif reads well at 16px.

### 3. Screenshots (required)

Between 1 and 5 PNG/JPG screenshots at **1280×800** or **640×400**. Capture the flow:

1. Selecting a passage in a ChatGPT reply
2. The composer after one quote is added
3. The composer after several quotes are stacked
4. (Optional) The multi-part ChatGPT reply you got back

### 4. Store listing copy

- **Name:** "Ask ChatGPT Multi" (≤45 chars)
- **Short description** (≤132 chars): *"Stack multiple quoted follow-ups into one ChatGPT message. No widget, no API key, just the composer."*
- **Detailed description:** adapt the top of the [README](README.md) — explain the problem, show the flow, list the permissions.
- **Category:** Productivity

### 5. Permissions justification

The store makes you justify each permission. For this extension:

- **Host permissions (`chatgpt.com`, `chat.openai.com`)** — "The extension enhances the composer on ChatGPT pages. It reads the text of a user's active selection inside a ChatGPT message and writes it into the ChatGPT composer as a markdown blockquote. No data leaves chatgpt.com."
- **No other permissions** — this extension does not request `tabs`, `storage`, `scripting`, or background permissions. Call that out; it helps reviewers.

### 6. Privacy policy (required if you handle any user data)

You don't handle user data — the extension doesn't send anything anywhere. You still need a linkable privacy policy. A GitHub-hosted page works:

Create `PRIVACY.md` (in this repo) with a one-paragraph "we don't collect anything" statement, and point the store listing at `https://github.com/pranay0064/chatgpt-ask-multi/blob/main/PRIVACY.md`.

---

## Build a release .zip

The store takes a `.zip` of the extension (not the whole repo):

```bash
npm run build
cd dist
zip -r ../ask-chatgpt-multi-v0.2.0.zip .
cd ..
```

Upload `ask-chatgpt-multi-v0.2.0.zip` in the developer console.

---

## Recommended publish flow

1. **First push: Unlisted.** Only people with the install link can install. No search visibility. Great for a Reddit launch.
2. Get 10–100 users and feedback. Iterate.
3. **Then switch to Public** if everything looks good. Public listings get more scrutiny and more chance of being flagged.

---

## If it gets rejected or taken down

Common reasons for this kind of extension:

- Reviewer thinks it "circumvents a feature" of chatgpt.com → clarify in the appeal that you're extending, not bypassing, the site's own Ask ChatGPT button
- OpenAI submits a trademark complaint → rename (e.g. "Stack Ask", "Quote Stack")
- Single-purpose policy violation → make sure your description says one clear thing

**Plan B:** keep the GitHub repo and publish signed `.crx` releases there. Users can drag-and-drop the `.crx` onto `chrome://extensions` (requires developer mode toggled on). Less polished, no forced updates, but nobody can deplatform you from your own repo.

---

## Other stores

- **Microsoft Edge Add-ons** — mostly accepts Chrome MV3 extensions unchanged. Separate ($0) registration.
- **Firefox** — requires porting (MV3 support differences; content scripts mostly work but some APIs differ). Mozilla's review is stricter than Chrome's.
- **Brave / Arc / Opera** — all support installing from the Chrome Web Store directly, so you don't need separate listings.
