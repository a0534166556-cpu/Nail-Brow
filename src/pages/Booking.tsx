import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { createAppointment, fetchBookingSlots } from '../api/client'
import { markScratchEligible } from '../constants/scratchStorage'
import { BOOKING_SERVICE_OPTIONS } from '../constants/services'
import type { BookingSlotInfo } from '../types/bookingSlots'

const todayStr = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function firstAvailableTime(slots: BookingSlotInfo[]): string {
  const a = slots.find((s) => s.available)
  return a?.time ?? slots[0]?.time ?? '10:00'
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
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [message, setMessage] = useState('')
  const [slots, setSlots] = useState<BookingSlotInfo[] | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [slotsError, setSlotsError] = useState('')
  const [giftUnlocked, setGiftUnlocked] = useState(false)

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

  useEffect(() => {
    let cancelled = false
    setSlotsLoading(true)
    setSlotsError('')
    ;(async () => {
      try {
        const s = await fetchBookingSlots(date)
        if (cancelled) return
        setSlots(s)
        setTime((prev) => {
          const cur = s.find((x) => x.time === prev && x.available)
          if (cur) return prev
          return firstAvailableTime(s)
        })
      } catch (e) {
        if (!cancelled) {
          setSlotsError(e instanceof Error ? e.message : 'שגיאה בטעינת משבצות')
          setSlots(null)
        }
      } finally {
        if (!cancelled) setSlotsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [date])

  const hasAnyAvailable = slots?.some((s) => s.available) ?? false

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      const created = await createAppointment({
        name,
        phone,
        service,
        date,
        time,
        notes,
        ...(email.trim() ? { email: email.trim() } : {}),
      })
      if (created.giftCardUnlocked) {
        markScratchEligible()
        setGiftUnlocked(true)
      } else {
        setGiftUnlocked(false)
      }
      setStatus('ok')
      setMessage(
        'התור נשמר בהצלחה! נחזור אליך לאישור במידת הצורך. אם הוזן אימייל והמערכת מוגדרת — תישלח אליך גם הודעה בדוא״ל.',
      )
      setName('')
      setPhone('')
      setEmail('')
      setNotes('')
      try {
        const s = await fetchBookingSlots(date)
        setSlots(s)
        setTime(firstAvailableTime(s))
      } catch {
        /* ignore refresh error */
      }
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
          מלאי את הפרטים ונקבע יחד זמן נוח. כל תור נשמר כמשבצת של שעה — אם השעה תפוסה, היא תסומן ולא ניתן לבחור
          אותה. ניתן להוסיף אימייל לקבלת אישור בדוא״ל.
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
            <span>אימייל לאישור (אופציונלי)</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="לדוגמה: name@gmail.com"
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
              {slotsLoading ? (
                <p className="muted" style={{ margin: '0.35rem 0' }}>
                  טוען משבצות…
                </p>
              ) : null}
              {slotsError ? (
                <>
                  <p className="form-msg err" style={{ marginBottom: '0.5rem' }}>
                    {slotsError}
                  </p>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    step={1800}
                    required
                  />
                </>
              ) : null}
              {!slotsLoading && !slotsError && slots && slots.length > 0 ? (
                <>
                  {!hasAnyAvailable ? (
                    <p className="form-msg err" role="alert">
                      אין משבצות פנויות ביום זה — בחרי תאריך אחר.
                    </p>
                  ) : null}
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    disabled={!hasAnyAvailable}
                  >
                    {slots.map((s) => (
                      <option key={s.time} value={s.time} disabled={!s.available}>
                        {s.time}
                        {s.available ? '' : ' — תפוס'}
                      </option>
                    ))}
                  </select>
                </>
              ) : null}
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
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={
              status === 'loading' ||
              slotsLoading ||
              (!slotsError && slots !== null && !hasAnyAvailable)
            }
          >
            {status === 'loading' ? 'שולחים…' : 'שליחת בקשת תור'}
          </button>
        </form>

        {message ? (
          <p className={`form-msg ${status === 'ok' ? 'ok' : status === 'err' ? 'err' : ''}`} role="status">
            {message}
          </p>
        ) : null}

        {status === 'ok' && giftUnlocked ? (
          <div className="gift-unlock-banner" role="status">
            <p className="gift-unlock-title">יש לך כרטיס גירוד מתנה</p>
            <p className="gift-unlock-text">
              קבעת את התור השני עם אותו מספר טלפון — פתחי כרטיס גירוד וגלי איזו הטבה קיבלת.
            </p>
            <Link to="/gift-scratch" className="btn btn-primary gift-unlock-btn">
              פתיחת כרטיס הגירוד
            </Link>
          </div>
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
