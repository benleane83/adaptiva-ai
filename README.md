# Adaptiva AI — Website

Static marketing site for [adaptivaai.com](https://adaptivaai.com).

---

## Contact Form Backend (Cloudflare Worker)

The contact forms on the site post to a **Cloudflare Worker** (`worker/contact-worker.js`) that:

1. Validates the submission server-side.
2. Checks honeypot / botcheck fields and silently discards spam.
3. Forwards the submission to **Web3Forms** (keeps it visible in the Web3Forms dashboard).
4. Sends an HTML + plain-text acknowledgement email to the submitter via **Resend**.

All API keys are stored as Worker secrets — none are exposed in the browser.

---

## Worker Setup

### Prerequisites

| Tool | Install |
|------|---------|
| Node.js ≥ 18 | [nodejs.org](https://nodejs.org) |
| Wrangler CLI | `npm install -g wrangler` |
| Cloudflare account | [dash.cloudflare.com](https://dash.cloudflare.com) |
| Web3Forms account | [web3forms.com](https://web3forms.com) |
| Resend account *(optional for now)* | [resend.com](https://resend.com) |

---

### 1 — Authenticate Wrangler

```bash
wrangler login
```

---

### 2 — Store secrets

Secrets are **never** committed to the repository. Run the following from the repo root:

```bash
# Required — your Web3Forms access key (from web3forms.com/dashboard)
wrangler secret put WEB3FORMS_ACCESS_KEY

# Optional for now — add when you have a Resend API key
# Without this the worker still forwards to Web3Forms; auto-replies are skipped
wrangler secret put RESEND_API_KEY
```

> **RESEND_API_KEY placeholder**: Leave this unset until you have created a Resend account
> and verified your sending domain (see [DNS setup](#dns--sender-verification) below).
> The worker detects the missing key and skips auto-replies gracefully.

---

### 3 — Review environment variables

Non-secret configuration lives in `wrangler.toml` under `[vars]`:

| Variable | Default | Description |
|----------|---------|-------------|
| `FROM_EMAIL` | `Adaptiva AI <info@adaptivaai.com>` | Sender shown in auto-replies |
| `REPLY_TO_EMAIL` | `info@adaptivaai.com` | Reply-to address in auto-replies |
| `ALLOWED_ORIGIN` | `*` | CORS origin — set to `https://adaptivaai.com` for production |

Edit `wrangler.toml` to change any of these before deploying.

---

### 4 — Deploy the Worker

```bash
wrangler deploy
```

Wrangler prints the Worker URL, e.g.:

```
https://adaptiva-contact.YOUR_CF_ACCOUNT.workers.dev
```

---

### 5 — Update the form action URL in contact.html

Replace the placeholder in both form `action` attributes:

```html
<!-- Before -->
action="https://adaptiva-contact.YOUR_CF_ACCOUNT.workers.dev/contact"

<!-- After (use your actual URL) -->
action="https://adaptiva-contact.acmecorp.workers.dev/contact"
```

Both forms in `contact.html` need this update:

1. The main **Contact** form (around line 97)
2. The **Complimentary Session** dialog form (around line 241)

Alternatively, add a [Custom Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
to the Worker (e.g. `contact-api.adaptivaai.com`) for a cleaner URL.

---

## DNS / Sender Verification

For Resend auto-replies to deliver correctly from `@adaptivaai.com`:

### Resend domain verification

1. Log in to [resend.com](https://resend.com) → **Domains** → **Add Domain**.
2. Enter `adaptivaai.com` and follow the wizard.
3. Add the provided DNS records to your DNS provider:

| Type | Name | Value |
|------|------|-------|
| TXT | `resend._domainkey` | *(DKIM key from Resend)* |
| TXT | `@` | `v=spf1 include:amazonses.com ~all` *(or as instructed)* |
| MX | `bounce` | *(MX record from Resend)* |

> Check **Resend → Domains** for the exact records — they may differ slightly.

4. Once verified, set your `FROM_EMAIL` to a verified sender such as `Adaptiva AI <info@adaptivaai.com>`.

### Recommended DMARC record

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:info@adaptivaai.com
```

Start with `p=none` to monitor before enforcing.

---

## Local Development

```bash
# Install Wrangler if not already installed
npm install -g wrangler

# Run the worker locally (binds to http://localhost:8787)
wrangler dev worker/contact-worker.js
```

Test with curl:

```bash
curl -X POST http://localhost:8787/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Hello"}'
```

Expected response:

```json
{"success":true}
```

---

## Secrets reference

| Secret / Variable | Required | Description |
|-------------------|----------|-------------|
| `WEB3FORMS_ACCESS_KEY` | **Yes** | Web3Forms access key — stored as Worker secret |
| `RESEND_API_KEY` | No (placeholder) | Resend API key — add when ready; auto-replies are skipped without it |
| `FROM_EMAIL` | No | Sender address for auto-replies (default: `Adaptiva AI <info@adaptivaai.com>`) |
| `REPLY_TO_EMAIL` | No | Reply-to address (default: `info@adaptivaai.com`) |
| `ALLOWED_ORIGIN` | No | CORS origin restriction (default: `*`) |
