import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { createApp } from './app.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
dotenv.config({ path: path.join(root, '.env') })
dotenv.config({ path: path.join(root, '.env.local'), override: true })

const PORT = Number(process.env.PORT) || 3040
const isProd =
  process.env.NODE_ENV === 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT)

const app = createApp({ enableStatic: isProd })

const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'
const server = app.listen(PORT, HOST)
server.on('listening', () => {
  console.log(`API server http://${HOST}:${PORT}`)
  if (isProd) console.log('Serving static from dist/')
})
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `פורט ${PORT} תפוס. סגרי תהליך אחר על אותו פורט, או הגדירי פורט אחר: PowerShell: $env:PORT=3041 ; npm run dev`,
    )
  } else {
    console.error('שגיאת שרת:', err.message)
  }
  process.exit(1)
})
