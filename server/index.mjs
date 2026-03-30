import { createApp } from './app.mjs'

const PORT = Number(process.env.PORT) || 3040
const isProd = process.env.NODE_ENV === 'production'

const app = createApp({ enableStatic: isProd })

const server = app.listen(PORT)
server.on('listening', () => {
  console.log(`API server http://127.0.0.1:${PORT}`)
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
