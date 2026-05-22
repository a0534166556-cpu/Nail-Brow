import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import {
  buildSlotsForDate,
  hasSlotConflict,
  isValidDateParam,
} from './bookingSlots.mjs'
import { appendAppointment, readAppointments, removeAppointment } from './storage.mjs'
import {
  notifyFirstBookingThankYou,
  notifyGiftScratchUnlocked,
} from './notifyBooking.mjs'

function normalizeOptionalEmail(raw) {
  if (typeof raw !== 'string') return ''
  const t = raw.trim()
  if (!t) return ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return ''
  return t
}

function normalizePhoneDigits(phone) {
  return String(phone ?? '').replace(/\D/g, '')
}

/** נתיב לקבצי static — רק בשרת Node מלא; ב-Netlify Functions אין import.meta.url תקין */
function resolveStaticRoot() {
  try {
    if (import.meta.url) {
      return path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
    }
  } catch {
    /* bundled serverless */
  }
  return process.cwd()
}

/** תורים מצטברים מאותו מספר טלפון (כל השירותים) לקבלת כרטיס גירוד */
const GIFT_CARD_AFTER_BOOKINGS = 3

export function createApp({ enableStatic = false } = {}) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

  function adminAuth(req) {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) return false
    const raw = header.slice(7).trim()
    if (raw === ADMIN_PASSWORD) return true
    try {
      const decoded = Buffer.from(raw, 'base64').toString('utf8')
      return decoded === ADMIN_PASSWORD
    } catch {
      return false
    }
  }

  const app = express()
  app.use(cors({ origin: true, credentials: true }))
  app.use(express.json({ limit: '64kb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.get('/api/booking/slots', async (req, res, next) => {
    try {
      const date = req.query.date
      if (!isValidDateParam(date)) {
        res.status(400).json({ error: 'תאריך לא תקין' })
        return
      }
      const list = await readAppointments()
      res.json({ slots: buildSlotsForDate(date, list) })
    } catch (err) {
      next(err)
    }
  })

  app.get('/api/appointments', async (req, res, next) => {
    try {
      if (!adminAuth(req)) {
        res.status(401).json({ error: 'נדרשת התחברות מנהל' })
        return
      }
      const list = await readAppointments()
      const sorted = [...list].sort((a, b) => {
        const da = `${a.date}T${a.time}`
        const db = `${b.date}T${b.time}`
        return da.localeCompare(db)
      })
      res.json(sorted)
    } catch (err) {
      next(err)
    }
  })

  app.post('/api/appointments', async (req, res, next) => {
    try {
      const { name, phone, service, date, time, notes, email } = req.body ?? {}
      if (
        typeof name !== 'string' ||
        typeof phone !== 'string' ||
        typeof service !== 'string' ||
        typeof date !== 'string' ||
        typeof time !== 'string'
      ) {
        res.status(400).json({ error: 'חסרים שדות חובה' })
        return
      }
      const trimmed = {
        name: name.trim(),
        phone: phone.trim(),
        service: service.trim(),
        date: date.trim(),
        time: time.trim(),
        notes: typeof notes === 'string' ? notes.trim() : '',
        email: normalizeOptionalEmail(email),
      }
      if (!trimmed.name || !trimmed.phone || !trimmed.service || !trimmed.date || !trimmed.time) {
        res.status(400).json({ error: 'יש למלא את כל השדות הנדרשים' })
        return
      }

      const list = await readAppointments()
      if (hasSlotConflict(trimmed.date, trimmed.time, list)) {
        res.status(409).json({
          error: 'המשבצת תפוסה (כל תור נמשך שעה). בחרי שעה אחרת.',
        })
        return
      }

      const id = crypto.randomUUID()
      const createdAt = new Date().toISOString()
      const row = { id, ...trimmed, createdAt }
      const phoneKey = normalizePhoneDigits(trimmed.phone)
      const samePhoneBefore = list.filter(
        (a) => normalizePhoneDigits(a.phone) === phoneKey,
      ).length
      const giftCardUnlocked = samePhoneBefore + 1 >= GIFT_CARD_AFTER_BOOKINGS
      const isFirstPhoneBooking = samePhoneBefore === 0
      const isGiftScratchMilestone = samePhoneBefore + 1 === GIFT_CARD_AFTER_BOOKINGS
      await appendAppointment(row)
      res.status(201).json({ ...row, giftCardUnlocked })
      if (trimmed.email) {
        if (isFirstPhoneBooking) {
          void notifyFirstBookingThankYou(row).catch(() => {})
        }
        if (isGiftScratchMilestone) {
          void notifyGiftScratchUnlocked(row).catch(() => {})
        }
      }
    } catch (err) {
      next(err)
    }
  })

  app.delete('/api/appointments/:id', async (req, res, next) => {
    try {
      if (!adminAuth(req)) {
        res.status(401).json({ error: 'נדרשת התחברות מנהל' })
        return
      }
      const { id } = req.params
      const ok = await removeAppointment(id)
      if (!ok) {
        res.status(404).json({ error: 'לא נמצא' })
        return
      }
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  })

  if (enableStatic) {
    const dist = path.join(resolveStaticRoot(), 'dist')
    app.use(express.static(dist))
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next()
      if (req.path.startsWith('/api')) return next()
      res.sendFile(path.join(dist, 'index.html'), (err) => {
        if (err) next(err)
      })
    })
  }

  app.use((err, _req, res, _next) => {
    console.error('[api]', err)
    if (res.headersSent) return
    const dev = process.env.NODE_ENV !== 'production'
    res.status(500).json({
      error: dev && err instanceof Error ? err.message : 'שגיאת שרת בשמירה. נסה שוב או צור קשר.',
    })
  })

  return app
}
