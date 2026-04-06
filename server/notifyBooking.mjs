/**
 * התראות אחרי קביעת תור (לא חוסמות את התשובה ללקוח).
 *
 * אימייל (Resend):
 *   RESEND_API_KEY
 *   BOOKING_EMAIL_FROM — כתובת מאומתת ב-Resend, למשל: Nail & Brow <hello@yourdomain.com>
 *   הלקוח ממלא אימייל אופציונלי בטופס — רק אז נשלח מייל.
 *
 * SMS (Twilio) — יתווסף בהמשך; בינתיים לא מופעל בקוד.
 */

const STUDIO_LABEL = process.env.BOOKING_STUDIO_NAME?.trim() || 'Nail & Brow'

function buildEmailHtml(a) {
  const when = `${a.date} בשעה ${a.time}`
  const notes = a.notes ? `<p><strong>הערות:</strong> ${escapeHtml(a.notes)}</p>` : ''
  return `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="utf-8"/></head><body style="font-family:system-ui,sans-serif;line-height:1.6;color:#3a2830;">
<p>שלום <strong>${escapeHtml(a.name)}</strong>,</p>
<p>נקבעה בקשת תור ב<strong>${escapeHtml(STUDIO_LABEL)}</strong> בהצלחה.</p>
<ul>
<li><strong>שירות:</strong> ${escapeHtml(a.service)}</li>
<li><strong>מועד:</strong> ${escapeHtml(when)}</li>
<li><strong>טלפון:</strong> ${escapeHtml(a.phone)}</li>
</ul>
${notes}
<p style="color:#6e5a63;font-size:0.95em;">נחזור אליך לאישור סופי במידת הצורך.</p>
<p>תודה שבחרת בנו!</p>
</body></html>`
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function resendConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.BOOKING_EMAIL_FROM?.trim())
}

async function sendResendEmail(to, subject, html) {
  const key = process.env.RESEND_API_KEY.trim()
  const from = process.env.BOOKING_EMAIL_FROM.trim()
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

/**
 * @param {{ name: string; phone: string; email?: string; service: string; date: string; time: string; notes?: string }} a
 */
export function notifyBookingConfirmed(a) {
  if (!resendConfigured() || !a.email?.trim()) {
    return Promise.resolve()
  }

  const to = a.email.trim()
  const subject = `אישור קבלת בקשת תור — ${STUDIO_LABEL}`
  return sendResendEmail(to, subject, buildEmailHtml(a)).then(
    () => console.log('[notify] אימייל נשלח'),
    (err) => console.error('[notify] אימייל נכשל:', err instanceof Error ? err.message : err),
  )
}
