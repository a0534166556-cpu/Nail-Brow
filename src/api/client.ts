import type { Appointment } from '../types/appointment'

const jsonHeaders = { 'Content-Type': 'application/json' } as const

export async function createAppointment(body: {
  name: string
  phone: string
  service: string
  date: string
  time: string
  notes?: string
}): Promise<Appointment> {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  })
  const data = (await res.json()) as Appointment | { error?: string }
  if (!res.ok) {
    throw new Error('error' in data && data.error ? data.error : 'שגיאה בשמירת התור')
  }
  return data as Appointment
}

export async function listAppointments(token: string): Promise<Appointment[]> {
  const res = await fetch('/api/appointments', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = (await res.json()) as Appointment[] | { error?: string }
  if (!res.ok) {
    throw new Error('error' in data && data.error ? data.error : 'שגיאה בטעינה')
  }
  return data as Appointment[]
}

export async function deleteAppointment(id: string, token: string): Promise<void> {
  const res = await fetch(`/api/appointments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const data = (await res.json()) as { error?: string }
    throw new Error(data.error ?? 'מחיקה נכשלה')
  }
}
