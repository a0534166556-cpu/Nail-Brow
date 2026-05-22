import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { getStore } from '@netlify/blobs'
import * as db from './db.mjs'

function fsDataPaths() {
  try {
    if (import.meta.url) {
      const dir = path.dirname(fileURLToPath(import.meta.url))
      const dataDir = path.join(dir, '..', 'data')
      return { dataDir, dataFile: path.join(dataDir, 'appointments.json') }
    }
  } catch {
    /* bundled serverless */
  }
  const dataDir = path.join(process.cwd(), 'data')
  return { dataDir, dataFile: path.join(dataDir, 'appointments.json') }
}

const BLOB_STORE = 'nail-studio-appointments'
const BLOB_KEY = 'appointments-list'

function storageMode() {
  if (process.env.DATABASE_URL) return 'pg'
  if (process.env.NETLIFY_STORAGE === 'blobs') return 'blobs'
  return 'fs'
}

async function readFs() {
  const { dataDir, dataFile } = fsDataPaths()
  await fs.mkdir(dataDir, { recursive: true })
  try {
    await fs.access(dataFile)
  } catch {
    await fs.writeFile(dataFile, '[]', 'utf8')
  }
  const raw = await fs.readFile(dataFile, 'utf8')
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeFs(list) {
  const { dataDir, dataFile } = fsDataPaths()
  await fs.mkdir(dataDir, { recursive: true })
  await fs.writeFile(dataFile, JSON.stringify(list, null, 2), 'utf8')
}

async function readBlobs() {
  const store = getStore(BLOB_STORE)
  const value = await store.get(BLOB_KEY, { type: 'json' })
  if (value == null) return []
  return Array.isArray(value) ? value : []
}

async function writeBlobs(list) {
  const store = getStore(BLOB_STORE)
  await store.setJSON(BLOB_KEY, list)
}

export async function readAppointments() {
  if (storageMode() === 'pg') return db.pgReadAppointments()
  if (storageMode() === 'blobs') return readBlobs()
  return readFs()
}

export async function appendAppointment(row) {
  if (storageMode() === 'pg') {
    await db.pgInsertAppointment(row)
    return
  }
  if (storageMode() === 'blobs') {
    const list = await readBlobs()
    list.push(row)
    await writeBlobs(list)
    return
  }
  const list = await readFs()
  list.push(row)
  await writeFs(list)
}

export async function removeAppointment(id) {
  if (storageMode() === 'pg') return db.pgDeleteAppointment(id)
  if (storageMode() === 'blobs') {
    const list = await readBlobs()
    const next = list.filter((a) => a.id !== id)
    if (next.length === list.length) return false
    await writeBlobs(next)
    return true
  }
  const list = await readFs()
  const next = list.filter((a) => a.id !== id)
  if (next.length === list.length) return false
  await writeFs(next)
  return true
}
