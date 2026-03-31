import pg from 'pg'

let pool = null
let ready = null

function shouldUseSsl(connectionString) {
  try {
    const u = new URL(connectionString.replace(/^postgresql:/i, 'postgres:'))
    const host = u.hostname || ''
    if (host === 'localhost' || host === '127.0.0.1') return false
  } catch {
    /* ignore */
  }
  return true
}

function getPool() {
  if (!process.env.DATABASE_URL) return null
  if (!pool) {
    const conn = process.env.DATABASE_URL
    pool = new pg.Pool({
      connectionString: conn,
      max: 8,
      ssl: shouldUseSsl(conn) ? { rejectUnauthorized: false } : false,
    })
  }
  return pool
}

async function ensureTable() {
  const p = getPool()
  if (!p) return
  if (!ready) {
    ready = p.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        service TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL
      )
    `)
  }
  await ready
}

function rowToAppointment(row) {
  const createdAt =
    row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    service: row.service,
    date: row.date,
    time: row.time,
    notes: row.notes ?? '',
    createdAt,
  }
}

export async function pgReadAppointments() {
  await ensureTable()
  const p = getPool()
  const { rows } = await p.query(
    `SELECT id, name, phone, service, date, time, notes, created_at
     FROM appointments`,
  )
  return rows.map(rowToAppointment)
}

export async function pgInsertAppointment(row) {
  await ensureTable()
  const p = getPool()
  await p.query(
    `INSERT INTO appointments (id, name, phone, service, date, time, notes, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::timestamptz)`,
    [
      row.id,
      row.name,
      row.phone,
      row.service,
      row.date,
      row.time,
      row.notes,
      row.createdAt,
    ],
  )
}

export async function pgDeleteAppointment(id) {
  await ensureTable()
  const p = getPool()
  const r = await p.query(`DELETE FROM appointments WHERE id = $1`, [id])
  return r.rowCount > 0
}
