import { useCallback, useEffect, useState } from 'react'
import { deleteAppointment, listAppointments } from '../api/client'
import type { Appointment } from '../types/appointment'

const STORAGE_KEY = 'nailstudio_admin_token'

function formatHebrewDate(dateStr: string, timeStr: string) {
  try {
    const d = new Date(`${dateStr}T${timeStr}:00`)
    return new Intl.DateTimeFormat('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return `${dateStr} ${timeStr}`
  }
}

/** פותח תוכנת דוא״ל עם נמען, נושא וגוף מוכנים ללקוח */
function buildCustomerMailtoHref(a: Appointment): string {
  const to = a.email?.trim()
  if (!to) return ''
  const when = formatHebrewDate(a.date, a.time)
  const subject = encodeURIComponent(`תור ב־Nail & Brow — ${a.name}`)
  const body = encodeURIComponent(
    `שלום ${a.name},\n\n` +
      `בקשר לתור שנקבע אצלנו:\n` +
      `שירות: ${a.service}\n` +
      `מועד: ${when}\n\n` +
      `בברכה,\nצוות Nail & Brow`,
  )
  return `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${body}`
}

export function Admin() {
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(() => sessionStorage.getItem(STORAGE_KEY) ?? '')
  const [rows, setRows] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const list = await listAppointments(token)
      setRows(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'שגיאה')
      if (e instanceof Error && e.message.includes('נדרשת')) {
        sessionStorage.removeItem(STORAGE_KEY)
        setToken('')
      }
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  function login(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = password.trim()
    if (!trimmed) return
    sessionStorage.setItem(STORAGE_KEY, trimmed)
    setToken(trimmed)
    setPassword('')
    setError('')
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY)
    setToken('')
    setRows([])
  }

  async function onDelete(id: string) {
    if (!token) return
    if (!confirm('למחוק תור זה?')) return
    setDeletingId(id)
    setError('')
    try {
      await deleteAppointment(id, token)
      setRows((r) => r.filter((x) => x.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'מחיקה נכשלה')
    } finally {
      setDeletingId(null)
    }
  }

  if (!token) {
    return (
      <div className="page">
        <div className="container page-narrow">
          <h1 className="page-title">דף ניהול</h1>
          <p className="page-lead">הזיני סיסמת מנהל כדי לראות את רשימת התורים.</p>
          <form className="form" onSubmit={login}>
            <label className="field">
              <span>סיסמה</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                dir="ltr"
                spellCheck={false}
              />
            </label>
            <button type="submit" className="btn btn-primary btn-block">
              כניסה
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="admin-toolbar">
          <h1 className="page-title admin-title">תורים שנקבעו</h1>
          <div className="admin-actions">
            <button type="button" className="btn btn-ghost" onClick={() => void load()} disabled={loading}>
              רענון
            </button>
            <button type="button" className="btn btn-outline" onClick={logout}>
              יציאה
            </button>
          </div>
        </div>
        {error ? <p className="form-msg err">{error}</p> : null}
        {loading && rows.length === 0 ? <p className="muted">טוען…</p> : null}
        {!loading && rows.length === 0 ? <p className="muted">אין תורים עדיין.</p> : null}
        {rows.length > 0 ? (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>טלפון</th>
                  <th>אימייל</th>
                  <th>שירות</th>
                  <th>מועד</th>
                  <th>הערות</th>
                  <th aria-label="פעולות" />
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td>
                      <a href={`tel:${a.phone.replace(/\s/g, '')}`}>{a.phone}</a>
                    </td>
                    <td>
                      {a.email?.trim() ? (
                        <a
                          className="admin-email-link"
                          href={buildCustomerMailtoHref(a)}
                          title="שליחת אימייל ללקוח"
                        >
                          {a.email.trim()}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{a.service}</td>
                    <td>{formatHebrewDate(a.date, a.time)}</td>
                    <td className="notes-cell">{a.notes || '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => void onDelete(a.id)}
                        disabled={deletingId === a.id}
                      >
                        מחיקה
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  )
}
