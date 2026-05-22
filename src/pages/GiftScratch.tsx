import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SCRATCH_PRIZES } from '../constants/scratchPrizes'
import {
  SCRATCH_ELIGIBLE_KEY,
  SCRATCH_PRIZE_KEY,
  type StoredScratchPrize,
} from '../constants/scratchStorage'

function pickRandomPrize(): string {
  const i = Math.floor(Math.random() * SCRATCH_PRIZES.length)
  return SCRATCH_PRIZES[i] ?? SCRATCH_PRIZES[0]
}

function readStoredPrize(): StoredScratchPrize | null {
  try {
    const raw = localStorage.getItem(SCRATCH_PRIZE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as unknown
    if (
      o &&
      typeof o === 'object' &&
      'label' in o &&
      typeof (o as { label: unknown }).label === 'string'
    ) {
      return {
        label: (o as { label: string }).label,
        revealedAt:
          'revealedAt' in o && typeof (o as { revealedAt: unknown }).revealedAt === 'string'
            ? (o as { revealedAt: string }).revealedAt
            : new Date().toISOString(),
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

function isEligible(): boolean {
  return Boolean(localStorage.getItem(SCRATCH_ELIGIBLE_KEY))
}

type ScratchCanvasProps = {
  prizeLabel: string
  onRevealed: () => void
}

function ScratchCanvas({ prizeLabel, onRevealed }: ScratchCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const revealedRef = useRef(false)
  const drawingRef = useRef(false)
  const lastRef = useRef<{ x: number; y: number } | null>(null)

  const layoutCanvas = useCallback(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const rect = wrap.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
    const w = Math.max(1, Math.floor(rect.width))
    const h = Math.max(1, Math.floor(rect.height))
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#c8b8a8')
    g.addColorStop(0.35, '#e8ddd0')
    g.addColorStop(0.55, '#a89888')
    g.addColorStop(0.72, '#d4c4b4')
    g.addColorStop(1, '#9a8a7c')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.globalCompositeOperation = 'source-over'
    for (let i = 0; i < 420; i++) {
      const x = Math.random() * w
      const y = Math.random() * h
      ctx.fillStyle = `rgba(255,255,255,${0.04 + Math.random() * 0.08})`
      ctx.fillRect(x, y, 1.2, 1.2)
    }
    ctx.fillStyle = 'rgba(60, 48, 42, 0.12)'
    ctx.font = `600 ${Math.max(13, w * 0.045)}px var(--font, system-ui)`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✦ גרדי לחשיפת המתנה ✦', w / 2, h / 2)
  }, [])

  useEffect(() => {
    layoutCanvas()
    const ro = new ResizeObserver(() => layoutCanvas())
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [layoutCanvas])

  const scratchAt = useCallback(
    (cx: number, cy: number) => {
      const canvas = canvasRef.current
      if (!canvas || revealedRef.current) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const rect = canvas.getBoundingClientRect()
      const dpr = canvas.width / rect.width
      const x = (cx - rect.left) * dpr
      const y = (cy - rect.top) * dpr
      ctx.globalCompositeOperation = 'destination-out'
      const r = 28 * dpr
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'

      const { width, height } = canvas
      const step = 6
      let transparent = 0
      let total = 0
      const id = ctx.getImageData(0, 0, width, height)
      const data = id.data
      for (let py = 0; py < height; py += step) {
        for (let px = 0; px < width; px += step) {
          const i = (py * width + px) * 4
          total++
          if (data[i + 3]! < 32) transparent++
        }
      }
      if (total > 0 && transparent / total > 0.42) {
        revealedRef.current = true
        onRevealed()
      }
    },
    [onRevealed],
  )

  const lineTo = useCallback(
    (cx: number, cy: number) => {
      const last = lastRef.current
      lastRef.current = { x: cx, y: cy }
      if (!last) {
        scratchAt(cx, cy)
        return
      }
      const dx = cx - last.x
      const dy = cy - last.y
      const dist = Math.hypot(dx, dy)
      const steps = Math.max(1, Math.ceil(dist / 8))
      for (let s = 0; s <= steps; s++) {
        const t = s / steps
        scratchAt(last.x + dx * t, last.y + dy * t)
      }
    },
    [scratchAt],
  )

  useEffect(() => {
    const onUp = () => {
      drawingRef.current = false
      lastRef.current = null
    }
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

  return (
    <div className="scratch-canvas-wrap" ref={wrapRef}>
      <div className="scratch-prize-layer" aria-hidden>
        <span className="scratch-prize-sparkle">✦</span>
        <p className="scratch-prize-label">{prizeLabel}</p>
        <span className="scratch-prize-sparkle">✦</span>
      </div>
      <canvas
        ref={canvasRef}
        className="scratch-canvas"
        role="presentation"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          drawingRef.current = true
          lineTo(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => {
          if (!drawingRef.current) return
          lineTo(e.clientX, e.clientY)
        }}
        onPointerUp={() => {
          drawingRef.current = false
          lastRef.current = null
        }}
        onPointerLeave={() => {
          drawingRef.current = false
          lastRef.current = null
        }}
      />
    </div>
  )
}

export function GiftScratch() {
  const [stored, setStored] = useState<StoredScratchPrize | null>(null)
  const [eligible, setEligible] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [pendingLabel, setPendingLabel] = useState<string | null>(null)
  const pendingRef = useRef<string | null>(null)
  const revealOnceRef = useRef(false)

  useEffect(() => {
    const prize = readStoredPrize()
    const el = isEligible()
    setStored(prize)
    setEligible(el)
    setHydrated(true)
    if (!prize && el) {
      const label = pickRandomPrize()
      pendingRef.current = label
      setPendingLabel(label)
    }
  }, [])

  const handleRevealed = useCallback(() => {
    if (revealOnceRef.current) return
    revealOnceRef.current = true
    const label = pendingRef.current ?? pickRandomPrize()
    const payload: StoredScratchPrize = { label, revealedAt: new Date().toISOString() }
    try {
      localStorage.setItem(SCRATCH_PRIZE_KEY, JSON.stringify(payload))
    } catch {
      /* ignore quota */
    }
    setStored(payload)
  }, [])

  const revealAll = useCallback(() => {
    if (stored) return
    handleRevealed()
  }, [handleRevealed, stored])

  if (!hydrated) {
    return (
      <div className="page gift-scratch-page">
        <div className="container page-narrow">
          <p className="muted">טוען…</p>
        </div>
      </div>
    )
  }

  if (stored) {
    return (
      <div className="page gift-scratch-page">
        <div className="container page-narrow">
          <h1 className="page-title gift-scratch-title">המתנה שלך</h1>
          <div className="scratch-revealed-card">
            <p className="scratch-revealed-intro">תודה שבחרת בנו — זה הפרס שלך:</p>
            <p className="scratch-revealed-prize">{stored.label}</p>
            <p className="scratch-revealed-note">
              הצגי את המסך בביקור הבא או צייני בווטסאפ — נשמח לאשר יחד את הפרטים.
            </p>
          </div>
          <p className="back-link">
            <Link to="/booking">קביעת תור</Link>
            {' · '}
            <Link to="/">דף הבית</Link>
          </p>
        </div>
      </div>
    )
  }

  if (!eligible) {
    return (
      <div className="page gift-scratch-page">
        <div className="container page-narrow">
          <h1 className="page-title gift-scratch-title">כרטיס מתנה</h1>
          <div className="scratch-locked-card">
            <p>
              כרטיס הגירוד נפתח אחרי <strong>שלושה תורים מצטברים</strong> עם אותו מספר טלפון דרך האתר —{' '}
              <strong>לא משנה באיזה שירות</strong>.
            </p>
            <p className="muted">
              לאחר התור השלישי — אם הוזן אימייל יישלח גם דוא״ל, ותופיע הודעה בדף הקביעה עם קישור לכאן.
            </p>
          </div>
          <p className="back-link">
            <Link to="/booking">לקביעת תור</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page gift-scratch-page">
      <div className="container page-narrow">
        <h1 className="page-title gift-scratch-title">כרטיס גירוד — מתנה ממנו</h1>
        <p className="page-lead gift-scratch-lead">
          גרדי בעדינות את השכבה המנצנצת כדי לגלות איזה טיפול או הטבה קיבלת במתנה.
        </p>

        <div className="scratch-card-outer">
          <div className="scratch-card-inner">
            {pendingLabel ? (
              <ScratchCanvas prizeLabel={pendingLabel} onRevealed={handleRevealed} />
            ) : null}
          </div>
        </div>

        <div className="scratch-a11y">
          <button type="button" className="btn btn-secondary" onClick={revealAll}>
            חשפי את המתנה (ללא גירוד)
          </button>
        </div>

        <p className="back-link">
          <Link to="/booking">קביעת תור</Link>
          {' · '}
          <Link to="/menu">תפריט</Link>
        </p>
      </div>
    </div>
  )
}
