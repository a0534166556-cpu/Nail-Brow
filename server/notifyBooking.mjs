/**
 * התראות אחרי קביעת תור (לא חוסמות את התשובה ללקוח).
 *
 * אימייל — אחד מהבאים:
 *
 * Resend:
 *   RESEND_API_KEY
 *   BOOKING_EMAIL_FROM — למשל: Nail & Brow <booking@domain.com>
 *
 * SendGrid:
 *   SENDGRID_API_KEY
 *   BOOKING_EMAIL_FROM או SENDGRID_FROM_EMAIL — כתובת/שולח מאומתים ב-SendGrid
 *
 * עדיפות: אם מוגדר Resend — משתמשים בו; אחרת SendGrid.
 *
 * לוגיקה:
 *   - תור ראשון (מצטבר לפי טלפון) + אימייל — מכתב תודה.
 *   - תור שלישי (מצטבר) + אימייל — מייל על כרטיס הגירוד.
 *   קישור לדף הגירוד: BOOKING_PUBLIC_SITE_URL (למשל https://example.com) ללא סלאש בסוף.
 *
 * SMS (Twilio) — יתווסף בהמשך; בינתיים לא מופעל בקוד.
 */

const STUDIO_LABEL = process.env.BOOKING_STUDIO_NAME?.trim() || 'Nail & Brow'

function publicSiteOrigin() {
  const raw = process.env.BOOKING_PUBLIC_SITE_URL?.trim() || ''
  if (!raw) return ''
  return raw.replace(/\/+$/, '')
}

function giftScratchPageUrl() {
  const o = publicSiteOrigin()
  return o ? `${o}/gift-scratch` : ''
}

function buildThankYouEmailHtml(a) {
  const when = `${a.date} בשעה ${a.time}`
  const notes = a.notes ? `<p style="margin:12px 0 0;color:#6e5a63;font-size:15px;"><strong>הערות שלך:</strong> ${escapeHtml(a.notes)}</p>` : ''
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:24px;background:#fdf7f8;font-family:'Segoe UI',system-ui,sans-serif;color:#3a2830;line-height:1.65;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
    <tr>
      <td style="background:linear-gradient(165deg,#fff9fb 0%,#fdeef4 40%,#f8f0e8 100%);border-radius:18px;padding:32px 28px;border:1px solid rgba(201,75,125,0.18);box-shadow:0 16px 48px rgba(58,40,48,0.08);">
        <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.06em;color:#c94b7d;text-transform:uppercase;">מכתב תודה</p>
        <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#3a2830;line-height:1.35;">שלום ${escapeHtml(a.name)}, תודה רבה על בחירתך בנו</h1>
        <p style="margin:0 0 18px;font-size:16px;color:#3a2830;">
          התרגשנו לקבל את בקשת התור שלך ל<strong>${escapeHtml(STUDIO_LABEL)}</strong>.
          כל פנייה חדשה חשובה לנו — נדאג שתרגישי נוחות, יופי וטיפוח ברמה שמתאימה לך.
        </p>
        <div style="margin:22px 0;padding:18px 20px;background:rgba(255,255,255,0.92);border-radius:14px;border:1px solid rgba(166,124,82,0.15);">
          <p style="margin:0 0 12px;font-size:14px;color:#6e5a63;">זה מה ששמרנו בשבילך:</p>
          <ul style="margin:0;padding:0 22px 0 0;list-style:none;">
            <li style="margin:8px 0;"><strong style="color:#c94b7d;">שירות:</strong> ${escapeHtml(a.service)}</li>
            <li style="margin:8px 0;"><strong style="color:#c94b7d;">מועד מבוקש:</strong> ${escapeHtml(when)}</li>
            <li style="margin:8px 0;"><strong style="color:#c94b7d;">טלפון:</strong> ${escapeHtml(a.phone)}</li>
          </ul>
          ${notes}
        </div>
        <p style="margin:20px 0 0;font-size:15px;color:#6e5a63;">
          נחזור אליך לאישור סופי במידת הצורך. עד אז — תודה על האמון, ונשמח לראות אותך בסטודיו.
        </p>
        <p style="margin:24px 0 0;font-size:15px;color:#3a2830;font-weight:600;">בברכה,<br/>צוות ${escapeHtml(STUDIO_LABEL)}</p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildGiftScratchEmailHtml(a, scratchUrl) {
  const when = `${a.date} בשעה ${a.time}`
  const cta = scratchUrl
    ? `<p style="margin:28px 0 0;text-align:center;">
        <a href="${encodeURI(scratchUrl)}" style="display:inline-block;padding:14px 28px;background:#c94b7d;color:#fff;text-decoration:none;border-radius:12px;font-size:16px;font-weight:600;">פתיחת כרטיס הגירוד</a>
      </p>
      <p style="margin:14px 0 0;font-size:13px;color:#8a7a80;text-align:center;">אם הכפתור לא נפתח, העתיקי לדפדפן: ${escapeHtml(scratchUrl)}</p>`
    : `<p style="margin:24px 0 0;font-size:15px;color:#6e5a63;">
        פתחי את האתר שלנו והיכנסי לדף <strong>כרטיס גירוד</strong> (בסיום הנתיב: <code style="background:#f5eaee;padding:2px 6px;border-radius:4px;">/gift-scratch</code>).
        מומלץ להגדיר במערכת את משתנה הסביבה <code style="background:#f5eaee;padding:2px 6px;border-radius:4px;">BOOKING_PUBLIC_SITE_URL</code> כדי לקבל קישור ישיר במיילים הבאים.
      </p>`

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:24px;background:#fdf7f8;font-family:'Segoe UI',system-ui,sans-serif;color:#3a2830;line-height:1.65;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
    <tr>
      <td style="background:linear-gradient(165deg,#fff9fb 0%,#fdeef4 40%,#f8f0e8 100%);border-radius:18px;padding:32px 28px;border:1px solid rgba(201,75,125,0.18);box-shadow:0 16px 48px rgba(58,40,48,0.08);">
        <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.06em;color:#c94b7d;text-transform:uppercase;">מתנה ממנו</p>
        <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#3a2830;line-height:1.35;">שלום ${escapeHtml(a.name)}, יש לך כרטיס גירוד</h1>
        <p style="margin:0 0 18px;font-size:16px;color:#3a2830;">
          הגעת ל<strong>שלושה תורים מצטברים</strong> עם אותו מספר טלפון דרך האתר — תודה על האמון ב<strong>${escapeHtml(STUDIO_LABEL)}</strong>.
          גלי עכשיו איזו הטבה חיכתה לך מאחורי שכבת הגירוד.
        </p>
        <div style="margin:22px 0;padding:18px 20px;background:rgba(255,255,255,0.92);border-radius:14px;border:1px solid rgba(166,124,82,0.15);">
          <p style="margin:0 0 8px;font-size:14px;color:#6e5a63;">התור שסגר את המספר שלוש:</p>
          <ul style="margin:0;padding:0 22px 0 0;list-style:none;">
            <li style="margin:8px 0;"><strong style="color:#c94b7d;">שירות:</strong> ${escapeHtml(a.service)}</li>
            <li style="margin:8px 0;"><strong style="color:#c94b7d;">מועד מבוקש:</strong> ${escapeHtml(when)}</li>
          </ul>
        </div>
        ${cta}
        <p style="margin:28px 0 0;font-size:15px;color:#3a2830;font-weight:600;">בברכה,<br/>צוות ${escapeHtml(STUDIO_LABEL)}</p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function mailFromEnv() {
  return (
    process.env.BOOKING_EMAIL_FROM?.trim() ||
    process.env.SENDGRID_FROM_EMAIL?.trim() ||
    ''
  )
}

function resendConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && mailFromEnv())
}

function sendgridConfigured() {
  return Boolean(process.env.SENDGRID_API_KEY?.trim() && mailFromEnv())
}

/** לפורמט SendGrid: { email, name? } מ־"שם <mail@x.com>" או רק מייל */
function parseFromForSendGrid(fromHeader) {
  const t = fromHeader.trim()
  const m = t.match(/^(.+?)\s*<([^>]+)>\s*$/)
  if (m) {
    const name = m[1].trim().replace(/^["']|["']$/g, '')
    const email = m[2].trim()
    return name ? { email, name } : { email }
  }
  return { email: t }
}

async function sendResendEmail(to, subject, html) {
  const key = process.env.RESEND_API_KEY.trim()
  const from = mailFromEnv()
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Resend ${res.status}: ${text.slice(0, 200)}`)
  }
}

async function sendSendGridEmail(to, subject, html) {
  const key = process.env.SENDGRID_API_KEY.trim()
  const from = parseFromForSendGrid(mailFromEnv())
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from,
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`SendGrid ${res.status}: ${text.slice(0, 200)}`)
  }
}

function sendHtmlEmail(to, subject, html, logOk) {
  if (resendConfigured()) {
    return sendResendEmail(to, subject, html).then(
      () => console.log(logOk),
      (err) => console.error('[notify] אימייל נכשל:', err instanceof Error ? err.message : err),
    )
  }

  if (sendgridConfigured()) {
    return sendSendGridEmail(to, subject, html).then(
      () => console.log(logOk),
      (err) => console.error('[notify] אימייל נכשל:', err instanceof Error ? err.message : err),
    )
  }

  return Promise.resolve()
}

/**
 * @param {{ name: string; phone: string; email?: string; service: string; date: string; time: string; notes?: string }} a
 */
export function notifyFirstBookingThankYou(a) {
  if (!a.email?.trim()) {
    return Promise.resolve()
  }

  const to = a.email.trim()
  const subject = `תודה שקבעת תור — ${STUDIO_LABEL}`
  const html = buildThankYouEmailHtml(a)
  return sendHtmlEmail(to, subject, html, '[notify] מכתב תודה (תור ראשון מהטלפון) נשלח')
}

/**
 * @param {{ name: string; phone: string; email?: string; service: string; date: string; time: string; notes?: string }} a
 */
export function notifyGiftScratchUnlocked(a) {
  if (!a.email?.trim()) {
    return Promise.resolve()
  }

  const scratchUrl = giftScratchPageUrl()
  if (!scratchUrl) {
    console.warn(
      '[notify] BOOKING_PUBLIC_SITE_URL לא מוגדר — מייל כרטיס גירוד יישלח בלי קישור ישיר (מומלץ להגדיר כתובת בסיס מלאה של האתר)',
    )
  }

  const to = a.email.trim()
  const subject = `כרטיס גירוד מתנה — ${STUDIO_LABEL}`
  const html = buildGiftScratchEmailHtml(a, scratchUrl)
  return sendHtmlEmail(to, subject, html, '[notify] מייל כרטיס גירוד (תור שלישי) נשלח')
}
