/**
 * Adaptiva AI — Contact Form Cloudflare Worker
 *
 * Handles POST submissions from the website contact forms.
 * - Validates required fields and email format
 * - Checks honeypot/botcheck fields for spam
 * - Forwards submission to Web3Forms (server-side key — no client exposure)
 * - Sends an HTML/text acknowledgement email to the submitter via Resend
 *
 * Required secrets/variables (set with `wrangler secret put` or in the dashboard):
 *   WEB3FORMS_ACCESS_KEY  — Web3Forms access key (secret)
 *   RESEND_API_KEY        — Resend API key (secret) — see README.md for setup
 *
 * Optional environment variables (set in wrangler.toml [vars] or dashboard):
 *   FROM_EMAIL            — Sender address, e.g. "Adaptiva AI <info@adaptivaai.com>"
 *   REPLY_TO_EMAIL        — Reply-to address, e.g. "info@adaptivaai.com"
 *   ALLOWED_ORIGIN        — CORS origin, e.g. "https://adaptivaai.com" (defaults to *)
 */

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "*";

    if (request.method === "OPTIONS") {
      return corsPreflightResponse(origin);
    }

    if (request.method !== "POST") {
      return jsonResponse({ success: false, message: "Method not allowed" }, 405, origin);
    }

    let fields;
    try {
      fields = await parseBody(request);
    } catch {
      return jsonResponse({ success: false, message: "Invalid request body" }, 400, origin);
    }

    // Honeypot checks — return silent success to avoid leaking bot-detection logic
    const botcheck = String(fields.botcheck || "").trim().toLowerCase();
    const company  = String(fields.company  || "").trim();
    if (botcheck === "true" || botcheck === "on" || company) {
      return jsonResponse({ success: true }, 200, origin);
    }

    // Field extraction
    const email   = String(fields.email   || "").trim().toLowerCase();
    const name    = deriveDisplayName(fields);
    const message = String(fields.message || fields.aiTools || "").trim();

    // Basic validation
    if (!email || !isValidEmail(email)) {
      return jsonResponse({ success: false, message: "A valid email address is required" }, 400, origin);
    }
    if (!name) {
      return jsonResponse({ success: false, message: "Name is required" }, 400, origin);
    }
    if (!message) {
      return jsonResponse({ success: false, message: "Message is required" }, 400, origin);
    }

    // Forward to Web3Forms
    let web3Success = false;
    let web3Error   = null;
    try {
      await forwardToWeb3Forms(fields, env);
      web3Success = true;
    } catch (err) {
      web3Error = String(err?.message ?? err);
      console.error("[contact-worker] Web3Forms error:", web3Error);
    }

    // Send auto-reply via Resend
    let resendSuccess = false;
    let resendError   = null;
    try {
      await sendAutoReply({ name, email, env });
      resendSuccess = true;
    } catch (err) {
      resendError = String(err?.message ?? err);
      console.error("[contact-worker] Resend error:", resendError);
    }

    // Both failed — surface a generic error without leaking internals
    if (!web3Success && !resendSuccess) {
      console.error("[contact-worker] Both services failed.", { web3Error, resendError });
      return jsonResponse(
        { success: false, message: "The form service is unavailable right now. Please try again later." },
        503,
        origin
      );
    }

    // Partial failures are logged above but we return success to the user
    return jsonResponse({ success: true }, 200, origin);
  }
};

// ─── Body parsing ─────────────────────────────────────────────────────────────

async function parseBody(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();
    const obj = {};
    for (const [key, value] of formData.entries()) {
      obj[key] = value;
    }
    return obj;
  }

  throw new Error("Unsupported content type");
}

// ─── Field helpers ─────────────────────────────────────────────────────────────

function deriveDisplayName(fields) {
  if (fields.name) return String(fields.name).trim();
  const first = String(fields.firstName || "").trim();
  const last  = String(fields.surname   || "").trim();
  return [first, last].filter(Boolean).join(" ");
}

function isValidEmail(email) {
  // Validates the shape of an email address (local@domain.tld).
  // Accepts plus-addressing and subdomain dots; rejects missing local-part,
  // missing domain, or a bare domain with no TLD dot.
  return /^[^\s@"(),[\]\\]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email);
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ─── Web3Forms forwarding ──────────────────────────────────────────────────────

async function forwardToWeb3Forms(fields, env) {
  if (!env.WEB3FORMS_ACCESS_KEY) {
    throw new Error("WEB3FORMS_ACCESS_KEY is not configured");
  }

  // Build a clean copy of the submission with the server-side access key
  const payload = { ...fields };

  // Remove internal/honeypot fields that Web3Forms doesn't need
  delete payload.botcheck;
  delete payload.company;

  payload.access_key = env.WEB3FORMS_ACCESS_KEY;

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Web3Forms responded ${response.status}: ${body}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(`Web3Forms rejected submission: ${result.message}`);
  }
}

// ─── Resend auto-reply ─────────────────────────────────────────────────────────

async function sendAutoReply({ name, email, env }) {
  if (!env.RESEND_API_KEY) {
    // Key not yet configured — log and skip gracefully
    console.warn("[contact-worker] RESEND_API_KEY not set — skipping auto-reply");
    return;
  }

  const from    = env.FROM_EMAIL    || "Adaptiva AI <info@adaptivaai.com>";
  const replyTo = env.REPLY_TO_EMAIL || "info@adaptivaai.com";

  const emailPayload = {
    from,
    to:       [email],
    reply_to: replyTo,
    subject:  "Thanks for contacting Adaptiva AI",
    html:     buildHtmlBody(name),
    text:     buildTextBody(name)
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.RESEND_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(emailPayload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend responded ${response.status}: ${body}`);
  }
}

// ─── Email templates ───────────────────────────────────────────────────────────

function buildHtmlBody(name) {
  const safeName = escapeHtml(name);
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f8fb;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0"
               style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="background:#0f172a;padding:20px 24px;">
              <span style="font-size:20px;font-weight:700;color:#ffffff;">Adaptiva AI</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 24px;">
              <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">Hi ${safeName},</p>
              <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">
                Thank you for reaching out to <strong>Adaptiva AI</strong>.
                We&rsquo;ve received your message and will be in touch as soon as possible.
              </p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">
                If your request is urgent, feel free to reply directly to this email.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius:8px;background:#2563eb;">
                    <a href="https://adaptivaai.com"
                       style="display:inline-block;padding:11px 20px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                      Visit our website &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:14px;color:#374151;line-height:1.6;">
                Kind regards,<br>
                <strong>Adaptiva AI Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;line-height:1.5;">
              This is an automated acknowledgement of your enquiry. Please do not reply to this message
              if you did not submit a contact form at <a href="https://adaptivaai.com" style="color:#6b7280;">adaptivaai.com</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildTextBody(name) {
  return `Hi ${name},

Thank you for reaching out to Adaptiva AI. We've received your message and will be in touch as soon as possible.

If your request is urgent, simply reply to this email.

Kind regards,
Adaptiva AI Team
https://adaptivaai.com

---
This is an automated acknowledgement of your enquiry.`;
}

// ─── Response helpers ──────────────────────────────────────────────────────────

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin":  origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept"
  };
}

function corsPreflightResponse(origin) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin)
  });
}

function jsonResponse(obj, status, origin) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin)
    }
  });
}
