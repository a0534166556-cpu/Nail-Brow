import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { readAppointments, writeAppointments } from './storage.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

export function createApp({ enableStatic = false } = {}) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

  function adminAuth(req) {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) return false
    const token = header.slice(7)
    return token === ADMIN_PASSWORD
  }

  const app = express()
  app.use(cors({ origin: true, credentials: true }))
  app.use(express.json({ limit: '64kb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.get('/api/appointments', async (req, res) => {
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
  })

  app.post('/api/appointments', async (req, res) => {
    const { name, phone, service, date, time, notes } = req.body ?? {}
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
    }
    if (!trimmed.name || !trimmed.phone || !trimmed.service || !trimmed.date || !trimmed.time) {
      res.status(400).json({ error: 'יש למלא את כל השדות הנדרשים' })
      return
    }

    const list = await readAppointments()
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    const row = { id, ...trimmed, createdAt }
    list.push(row)
    await writeAppointments(list)
    res.status(201).json(row)
  })

  app.delete('/api/appointments/:id', async (req, res) => {
    if (!adminAuth(req)) {
      res.status(401).json({ error: 'נדרשת התחברות מנהל' })
      return
    }
    const { id } = req.params
    const list = await readAppointments()
    const next = list.filter((a) => a.id !== id)
    if (next.length === list.length) {
      res.status(404).json({ error: 'לא נמצא' })
      return
    }
    await writeAppointments(next)
    res.json({ ok: true })
  })

  if (enableStatic) {
    const dist = path.join(root, 'dist')
    app.use(express.static(dist))
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next()
      if (req.path.startsWith('/api')) return next()
      res.sendFile(path.join(dist, 'index.html'), (err) => {
        if (err) next(err)
      })
    })
  }

  return app
}
