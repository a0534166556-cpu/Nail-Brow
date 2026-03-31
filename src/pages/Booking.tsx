import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { createAppointment } from '../api/client'
import { BOOKING_SERVICE_OPTIONS } from '../constants/services'

const todayStr = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function Booking() {
  const [searchParams] = useSearchParams()
  const defaultService = BOOKING_SERVICE_OPTIONS[0] ?? 'אחר / שירות שלא ברשימה'

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState<string>(defaultService)
  const [date, setDate] = useState(todayStr())
  const [time, setTime] = useState('10:00')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const raw = searchParams.get('service')
    if (!raw) return
    try {
      const decoded = decodeURIComponent(raw)
      if (BOOKING_SERVICE_OPTIONS.includes(decoded)) {
        setService(decoded)
      }
    } catch {
      /* ignore malformed query */
    }
  }, [searchParams])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      await createAppointment({ name, phone, service, date, time, notes })
      setStatus('ok')
      setMessage('התור נשמר בהצלחה! נחזור אליך לאישור במידת הצורך.')
      setName('')
      setPhone('')
      setNotes('')
    } catch (err) {
      setStatus('err')
      setMessage(err instanceof Error ? err.message : 'אירעה שגיאה')
    }
  }

  return (
    <div className="page">
      <div className="container page-narrow">
        <h1 className="page-title">קביעת תור</h1>
        <p className="page-lead">
          מלאי את הפרטים ונקבע יחד זמן נוח. התורים נשמרים במערכת — הצוות רואה אותם בדף הניהול.
        </p>

        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span>שם מלא</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="לדוגמה: שרה כהן"
            />
          </label>
          <label className="field">
            <span>טלפון</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
              placeholder="050-0000000"
            />
          </label>
          <label className="field">
            <span>שירות</span>
            <select value={service} onChange={(e) => setService(e.target.value)} required>
              {BOOKING_SERVICE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <div className="field-row">
            <label className="field">
              <span>תאריך</span>
              <input type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <label className="field">
              <span>שעה</span>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </label>
          </div>
          <label className="field">
            <span>הערות (אופציונלי)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="למשל: אורך קצר, צבע ניוד, רגישות לעור..."
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={status === 'loading'}>
            {status === 'loading' ? 'שולחים…' : 'שליחת בקשת תור'}
          </button>
        </form>

        {message ? (
          <p className={`form-msg ${status === 'ok' ? 'ok' : status === 'err' ? 'err' : ''}`} role="status">
            {message}
          </p>
        ) : null}

        <p className="back-link">
          <Link to="/menu">חזרה לתפריט</Link>
          {' · '}
          <Link to="/">דף הבית</Link>
        </p>
      </div>
    </div>
  )
}
