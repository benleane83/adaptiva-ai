/**
 * Adaptiva AI — Contact Form Cloudflare Worker
 *
 * Handles POST submissions from the website contact forms.
 * - Validates required fields and email format
 * - Checks honeypot/botcheck fields for spam
 * - Sends a structured internal notification email via Resend
 * - Sends an HTML/text acknowledgement email to the submitter via Resend
 *
 * Required secrets/variables (set with `wrangler secret put` or in the dashboard):
 *   RESEND_API_KEY        — Resend API key (secret) — see README.md for setup
 *
 * Optional environment variables (set in wrangler.toml [vars] or dashboard):
 *   NOTIFICATION_TO_EMAIL  — Recipient for internal notifications (defaults to info@adaptivaai.com)
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
    const formId  = String(fields.form_id || fields.formId || "contact").trim();
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
    // Message is required for contact form but optional for complimentary session
    if (!message && formId !== "complimentary_session") {
      return jsonResponse({ success: false, message: "Message is required" }, 400, origin);
    }
    // Provide default message for complimentary session form
    const displayMessage = message || (formId === "complimentary_session" ? "Registered for complimentary Copilot session" : "");

    // Send structured internal notification (required)
    try {
      await sendInternalNotification({ fields, name, email, message: displayMessage, env });
    } catch (err) {
      const notificationError = String(err?.message ?? err);
      console.error("[contact-worker] Notification email error:", notificationError);
      return jsonResponse(
        { success: false, message: "The form service is unavailable right now. Please try again later." },
        503,
        origin
      );
    }

    // Send auto-reply via Resend (best effort)
    try {
      await sendAutoReply({ name, email, formId, env });
    } catch (err) {
      const resendError = String(err?.message ?? err);
      console.error("[contact-worker] Auto-reply error:", resendError);
    }

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

// ─── Resend emails ──────────────────────────────────────────────────────────────

async function sendInternalNotification({ fields, name, email, message, env }) {
  if (!env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const from = env.FROM_EMAIL || "Adaptiva AI <info@adaptivaai.com>";
  const replyTo = env.REPLY_TO_EMAIL || "info@adaptivaai.com";
  const notifyTo = env.NOTIFICATION_TO_EMAIL || "info@adaptivaai.com";
  const formId = String(fields.form_id || fields.formId || "contact").trim();

  const subjectMap = {
    complimentary_session: `Complimentary session from ${name}`,
    contact: `Request for consultation from ${name}`
  };
  const subject = subjectMap[formId] ?? `Request for consultation from ${name}`;

  const emailPayload = {
    from,
    to: [notifyTo],
    reply_to: replyTo,
    subject,
    html: buildInternalNotificationHtml({ fields, name, email, message }),
    text: buildInternalNotificationText({ fields, name, email, message })
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

// ─── Resend auto-reply ─────────────────────────────────────────────────────────

async function sendAutoReply({ name, email, formId, env }) {
  if (!env.RESEND_API_KEY) {
    // Key not yet configured — log and skip gracefully
    console.warn("[contact-worker] RESEND_API_KEY not set — skipping auto-reply");
    return;
  }

  const from    = env.FROM_EMAIL    || "Adaptiva AI <info@adaptivaai.com>";
  const replyTo = env.REPLY_TO_EMAIL || "info@adaptivaai.com";

  let subject, html, text;
  
  if (formId === "complimentary_session") {
    subject = "Thanks for registering for a complimentary Copilot intro session";
    html = buildHtmlBodyComplimentary(name);
    text = buildTextBodyComplimentary(name);
  } else {
    subject = "Thanks for contacting Adaptiva AI";
    html = buildHtmlBodyContact(name);
    text = buildTextBodyContact(name);
  }

  const emailPayload = {
    from,
    to:       [email],
    reply_to: replyTo,
    subject,
    html,
    text
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

function buildHtmlBodyComplimentary(name) {
  const safeFirstName = escapeHtml(deriveFirstName(name));
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
              <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">Hello ${safeFirstName},</p>
              <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">
                Thank you for registering your interest in a complimentary Microsoft 365 Copilot introductory session.
                We have received your details and will be in touch once the session date is confirmed.
              </p>
              <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">
                For inquiries about any of our other services, please complete the
                &ldquo;Request a Consultation&rdquo; form on our website.
              </p>
              <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">
                We appreciate your interest in Adaptiva AI and look forward to connecting with you.
              </p>
              <p style="margin:24px 0 0;font-size:14px;color:#374151;line-height:1.6;">
                Warm regards,<br>
                <strong>The Adaptiva AI Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;line-height:1.5;">
              This is an automated message from Adaptiva AI.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildTextBodyComplimentary(name) {
  const firstName = deriveFirstName(name);
  return `Hello ${firstName},

Thank you for registering your interest in a complimentary Microsoft 365 Copilot introductory session. We have received your details and will be in touch once the session date is confirmed.

For inquiries about any of our other services, please complete the "Request a Consultation" form on our website.

We appreciate your interest in Adaptiva AI and look forward to connecting with you.

Warm regards,

The Adaptiva AI Team`;
}

function buildHtmlBodyContact(name) {
  const safeFirstName = escapeHtml(deriveFirstName(name));
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
              <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">Hello ${safeFirstName},</p>
              <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">
                Thank you for contacting Adaptiva AI. We have received your consultation request and will review your message.
              </p>
              <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">
                Our team will be in touch to discuss your needs and explore how we can assist your organization.
              </p>
              <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">
                We appreciate your interest in Adaptiva AI and look forward to connecting with you soon.
              </p>
              <p style="margin:24px 0 0;font-size:14px;color:#374151;line-height:1.6;">
                Warm regards,<br>
                <strong>The Adaptiva AI Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;line-height:1.5;">
              This is an automated message from Adaptiva AI.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildTextBodyContact(name) {
  const firstName = deriveFirstName(name);
  return `Hello ${firstName},

Thank you for contacting Adaptiva AI. We have received your consultation request and will review your message.

We will be in touch to discuss your needs and explore how we can assist your organization.

We appreciate your interest in Adaptiva AI and look forward to connecting with you soon.

Warm regards,

The Adaptiva AI Team`;
}

function deriveFirstName(name) {
  const trimmedName = String(name || "").trim();
  if (!trimmedName) {
    return "there";
  }
  return trimmedName.split(/\s+/)[0];
}

function buildInternalNotificationHtml({ fields, name, email, message }) {
  const submittedAt = new Date().toISOString();
  const rows = Object.entries(fields)
    .filter(([key]) => key !== "botcheck" && key !== "company")
    .map(([key, value]) => {
      return `<tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:600;background:#f8fafc;">${escapeHtml(key)}</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${escapeHtml(value)}</td></tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
    <tr>
      <td style="background:#0f172a;padding:16px 20px;color:#ffffff;font-size:18px;font-weight:700;">New Contact Form Submission</td>
    </tr>
    <tr>
      <td style="padding:18px 20px;">
        <p style="margin:0 0 10px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin:0 0 10px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin:0 0 10px;"><strong>Message:</strong><br>${escapeHtml(message)}</p>
        <p style="margin:0 0 16px;"><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          ${rows}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildInternalNotificationText({ fields, name, email, message }) {
  const submittedAt = new Date().toISOString();
  const lines = Object.entries(fields)
    .filter(([key]) => key !== "botcheck" && key !== "company")
    .map(([key, value]) => `${key}: ${String(value ?? "")}`);

  return [
    "New Contact Form Submission",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Message: ${message}`,
    `Submitted: ${submittedAt}`,
    "",
    "All Fields:",
    ...lines
  ].join("\n");
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
