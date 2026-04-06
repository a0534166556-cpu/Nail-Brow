/** משך טיפול לכל תור (דקות) — משבצת שלמה נחסמת */
export const SLOT_DURATION_MINUTES = 60

/** תחילת יום עבודה (דקות מחצות) */
const DAY_START_MINUTES = 8 * 60
/** תחילת התור האחרונה המותרת (כך שהטיפול מסתיים עד 20:00) */
const LAST_START_MINUTES = 19 * 60
/** ריווח בין תחילות תורים לבחירה */
const STEP_MINUTES = 30

const TIME_RE = /^(\d{1,2}):(\d{2})$/

export function parseTimeToMinutes(t) {
  const m = TIME_RE.exec(String(t).trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (!Number.isInteger(h) || !Number.isInteger(min) || h < 0 || h > 23 || min < 0 || min > 59) return null
  return h * 60 + min
}

export function minutesToTime(total) {
  const h = Math.floor(total / 60)
  const min = total % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

function rangesOverlap(a0, a1, b0, b1) {
  return a0 < b1 && a1 > b0
}

/** האם תחילת תור חדש ב־date/time מתנגש עם תור קיים */
export function hasSlotConflict(date, timeStart, existingAppointments) {
  const newStart = parseTimeToMinutes(timeStart)
  if (newStart === null) return true
  const newEnd = newStart + SLOT_DURATION_MINUTES
  for (const a of existingAppointments) {
    if (a.date !== date) continue
    const oldStart = parseTimeToMinutes(a.time)
    if (oldStart === null) continue
    const oldEnd = oldStart + SLOT_DURATION_MINUTES
    if (rangesOverlap(newStart, newEnd, oldStart, oldEnd)) return true
  }
  return false
}

export function generateSelectableSlotStarts() {
  const out = []
  for (let m = DAY_START_MINUTES; m <= LAST_START_MINUTES; m += STEP_MINUTES) {
    out.push(minutesToTime(m))
  }
  return out
}

/** לכל שעת התחלה ברשימה — האם פנוי ביום date */
export function buildSlotsForDate(date, appointments) {
  const starts = generateSelectableSlotStarts()
  return starts.map((time) => ({
    time,
    available: !hasSlotConflict(date, time, appointments),
  }))
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function isValidDateParam(d) {
  return typeof d === 'string' && DATE_RE.test(d)
}
