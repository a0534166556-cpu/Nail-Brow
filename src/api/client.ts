import type { Appointment, CreateAppointmentResult } from '../types/appointment'
import type { BookingSlotInfo } from '../types/bookingSlots'

const jsonHeaders = { 'Content-Type': 'application/json' } as const

const rawBase = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '')
const API_ORIGIN =
  rawBase === ''
    ? ''
    : /^https?:\/\//i.test(rawBase)
      ? rawBase
      : `https://${rawBase}`

function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return API_ORIGIN ? `${API_ORIGIN}${p}` : p
}

/** כותרת Authorization בטוחה לדפדפן: ערכי Header חייבים להיות ASCII — סיסמה בעברית מקודדת ב-Base64 (UTF-8). */
function adminAuthHeaders(token: string): { Authorization: string } {
  const b64 = btoa(unescape(encodeURIComponent(token)))
  return { Authorization: `Bearer ${b64}` }
}

async function parseJsonBody<T>(res: Response): Promise<T | null> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export async function fetchBookingSlots(date: string): Promise<BookingSlotInfo[]> {
  const q = new URLSearchParams({ date })
  const res = await fetch(apiUrl(`/api/booking/slots?${q.toString()}`))
  const data = await parseJsonBody<{ slots?: BookingSlotInfo[]; error?: string }>(res)
  if (!res.ok) {
    throw new Error(data?.error ?? 'שגיאה בטעינת משבצות')
  }
  return Array.isArray(data?.slots) ? data.slots : []
}

export async function createAppointment(body: {
  name: string
  phone: string
  service: string
  date: string
  time: string
  notes?: string
  email?: string
}): Promise<CreateAppointmentResult> {
  const res = await fetch(apiUrl('/api/appointments'), {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  })
  const data = await parseJsonBody<CreateAppointmentResult | { error?: string }>(res)
  if (!res.ok) {
    const msg =
      data && 'error' in data && data.error
        ? data.error
        : res.status === 502 || res.status === 503
          ? 'השרת לא זמין כרגע (שגיאת שער). נסה שוב בעוד רגע.'
          : res.status === 409
            ? 'המשבצת תפוסה. בחרי שעה אחרת.'
            : 'שגיאה בשמירת התור'
    throw new Error(msg)
  }
  if (!data || !('id' in data)) {
    throw new Error('תשובה לא תקינה מהשרת')
  }
  return data as CreateAppointmentResult
}

export async function listAppointments(token: string): Promise<Appointment[]> {
  const res = await fetch(apiUrl('/api/appointments'), {
    headers: adminAuthHeaders(token),
  })
  const data = (await res.json()) as Appointment[] | { error?: string }
  if (!res.ok) {
    throw new Error('error' in data && data.error ? data.error : 'שגיאה בטעינה')
  }
  return data as Appointment[]
}

export async function deleteAppointment(id: string, token: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/appointments/${encodeURIComponent(id)}`), {
    method: 'DELETE',
    headers: adminAuthHeaders(token),
  })
  if (!res.ok) {
    const data = (await res.json()) as { error?: string }
    throw new Error(data.error ?? 'מחיקה נכשלה')
  }
}
