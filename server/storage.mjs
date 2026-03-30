import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { getStore } from '@netlify/blobs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'data')
const dataFile = path.join(dataDir, 'appointments.json')

const BLOB_STORE = 'nail-studio-appointments'
const BLOB_KEY = 'appointments-list'

function useBlobs() {
  return process.env.NETLIFY_STORAGE === 'blobs'
}

async function readFs() {
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
  if (useBlobs()) return readBlobs()
  return readFs()
}

export async function writeAppointments(list) {
  if (useBlobs()) return writeBlobs(list)
  return writeFs(list)
}
