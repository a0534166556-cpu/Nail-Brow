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
      const scratched =
        'scratched' in o && typeof (o as { scratched: unknown }).scratched === 'boolean'
          ? (o as { scratched: boolean }).scratched
          : undefined
      return {
        label: (o as { label: string }).label,
        revealedAt:
          'revealedAt' in o && typeof (o as { revealedAt: unknown }).revealedAt === 'string'
            ? (o as { revealedAt: string }).revealedAt
            : new Date().toISOString(),
        scratched,
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

function drawScratchOverlay(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, '#b8a898')
  g.addColorStop(0.2, '#e8e0d8')
  g.addColorStop(0.45, '#9a8a7a')
  g.addColorStop(0.55, '#f0ebe4')
  g.addColorStop(0.75, '#a09080')
  g.addColorStop(1, '#c8beb4')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 600; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.12})`
    const s = 0.8 + Math.random() * 2.2
    ctx.fillRect(x, y, s, s)
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 1
  for (let y = 0; y < h; y += 6) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y + 3)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(45, 35, 40, 0.35)'
  ctx.font = `700 ${Math.max(14, w * 0.048)}px var(--font, system-ui)`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('✦ גרדי כאן לחשיפת המתנה ✦', w / 2, h / 2 - 10)
  ctx.font = `500 ${Math.max(11, w * 0.032)}px var(--font, system-ui)`
  ctx.fillStyle = 'rgba(45, 35, 40, 0.22)'
  ctx.fillText('עם האצבע או העכבר', w / 2, h / 2 + 16)
}

type ScratchCanvasProps = {
  prizeLabel: string
  prizeVisible: boolean
  onRevealed: () => void
  onProgress: (ratio: number) => void
}

function ScratchCanvas({ prizeLabel, prizeVisible, onRevealed, onProgress }: ScratchCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const revealedRef = useRef(false)
  const drawingRef = useRef(false)
  const lastRef = useRef<{ x: number; y: number } | null>(null)
  const progressThrottleRef = useRef(0)

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
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    drawScratchOverlay(ctx, canvas.width, canvas.height)
  }, [])

  useEffect(() => {
    layoutCanvas()
    const ro = new ResizeObserver(() => layoutCanvas())
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [layoutCanvas])

  const measureProgress = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return 0
    const ctx = canvas.getContext('2d')
    if (!ctx) return 0
    const { width, height } = canvas
    const step = 8
    let transparent = 0
    let total = 0
    const id = ctx.getImageData(0, 0, width, height)
    const data = id.data
    for (let py = 0; py < height; py += step) {
      for (let px = 0; px < width; px += step) {
        const i = (py * width + px) * 4
        total++
        if (data[i + 3]! < 40) transparent++
      }
    }
    return total > 0 ? transparent / total : 0
  }, [])

  const scratchAt = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas || revealedRef.current) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const x = (clientX - rect.left) * scaleX
      const y = (clientY - rect.top) * scaleY
      const brush = 36 * Math.max(scaleX, scaleY)

      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, brush, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'

      const now = Date.now()
      if (now - progressThrottleRef.current > 80) {
        progressThrottleRef.current = now
        const ratio = measureProgress()
        onProgress(ratio)
        if (ratio > 0.48) {
          revealedRef.current = true
          onProgress(1)
          onRevealed()
        }
      }
    },
    [measureProgress, onProgress, onRevealed],
  )

  const lineTo = useCallback(
    (clientX: number, clientY: number) => {
      const last = lastRef.current
      lastRef.current = { x: clientX, y: clientY }
      if (!last) {
        scratchAt(clientX, clientY)
        return
      }
      const dx = clientX - last.x
      const dy = clientY - last.y
      const dist = Math.hypot(dx, dy)
      const steps = Math.max(1, Math.ceil(dist / 6))
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
      <div
        className={`scratch-prize-layer${prizeVisible ? ' scratch-prize-layer--revealed' : ' scratch-prize-layer--hidden'}`}
        aria-hidden
      >
        <div className="scratch-prize-glow" />
        <span className="scratch-prize-sparkle scratch-prize-sparkle--l">✦</span>
        <p className="scratch-prize-label">{prizeLabel}</p>
        <span className="scratch-prize-sparkle scratch-prize-sparkle--r">✦</span>
      </div>
      <canvas
        ref={canvasRef}
        className="scratch-canvas"
        aria-label="שכבת גירוד — גרדי לחשיפת הפרס"
        onPointerDown={(e) => {
          e.preventDefault()
          e.currentTarget.setPointerCapture(e.pointerId)
          drawingRef.current = true
          lineTo(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => {
          if (!drawingRef.current) return
          e.preventDefault()
          lineTo(e.clientX, e.clientY)
        }}
        onPointerUp={() => {
          drawingRef.current = false
          lastRef.current = null
        }}
        onPointerLeave={() => {
          if (!drawingRef.current) return
          drawingRef.current = false
          lastRef.current = null
        }}
      />
    </div>
  )
}

function ConfettiBurst() {
  const colors = ['#c94b7d', '#d4a574', '#fdeef4', '#8b5a3c', '#fff9fb', '#e8c4a8']
  return (
    <div className="scratch-confetti" aria-hidden>
      {Array.from({ length: 48 }, (_, i) => (
        <span
          key={i}
          className="scratch-confetti-piece"
          style={
            {
              '--c': colors[i % colors.length],
              '--x': `${(i * 17) % 100}%`,
              '--delay': `${(i % 12) * 0.04}s`,
              '--rot': `${(i * 47) % 360}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

type Phase = 'scratch' | 'celebrating' | 'done'

export function GiftScratch() {
  const [stored, setStored] = useState<StoredScratchPrize | null>(null)
  const [eligible, setEligible] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [pendingLabel, setPendingLabel] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('scratch')
  const [scratchProgress, setScratchProgress] = useState(0)
  const pendingRef = useRef<string | null>(null)
  const revealOnceRef = useRef(false)

  useEffect(() => {
    const prize = readStoredPrize()
    const el = isEligible()
    setStored(prize)
    setEligible(el)
    setHydrated(true)

    const alreadyDone = prize && prize.scratched === true
    const canScratchAgain = prize && el && prize.scratched !== true

    if (alreadyDone) {
      setPhase('done')
      return
    }

    if (canScratchAgain) {
      pendingRef.current = prize.label
      setPendingLabel(prize.label)
      setPhase('scratch')
      return
    }

    if (!prize && el) {
      const label = pickRandomPrize()
      pendingRef.current = label
      setPendingLabel(label)
      setPhase('scratch')
    }
  }, [])

  const persistPrize = useCallback((label: string, scratched: boolean) => {
    const payload: StoredScratchPrize = {
      label,
      revealedAt: new Date().toISOString(),
      scratched,
    }
    try {
      localStorage.setItem(SCRATCH_PRIZE_KEY, JSON.stringify(payload))
    } catch {
      /* ignore quota */
    }
    setStored(payload)
  }, [])

  const handleRevealed = useCallback(() => {
    if (revealOnceRef.current) return
    revealOnceRef.current = true
    const label = pendingRef.current ?? pickRandomPrize()
    setPhase('celebrating')
    persistPrize(label, true)
    window.setTimeout(() => setPhase('done'), 2800)
  }, [persistPrize])

  const revealWithoutScratch = useCallback(() => {
    if (revealOnceRef.current) return
    const label = pendingRef.current ?? pickRandomPrize()
    revealOnceRef.current = true
    persistPrize(label, false)
    setPhase('done')
  }, [persistPrize])

  const prizeVisible = scratchProgress > 0.12
  const displayPrize =
    pendingLabel && prizeVisible ? pendingLabel : '??? מתנה מפתיעה מחכה לך'

  if (!hydrated) {
    return (
      <div className="page gift-scratch-page">
        <div className="container page-narrow">
          <p className="muted">טוען…</p>
        </div>
      </div>
    )
  }

  if (phase === 'done' && stored) {
    return (
      <div className="page gift-scratch-page gift-scratch-page--won">
        <ConfettiBurst />
        <div className="container page-narrow">
          <h1 className="page-title gift-scratch-title">מזל טוב!</h1>
          <div className="scratch-revealed-card scratch-revealed-card--pop">
            <p className="scratch-revealed-badge">המתנה שלך</p>
            <p className="scratch-revealed-prize">{stored.label}</p>
            <p className="scratch-revealed-intro">
              תודה שבחרת בנו — הציגי את המסך בביקור הבא או צייני בוואטסאפ.
            </p>
            {stored.scratched === false ? (
              <p className="scratch-revealed-note">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm scratch-retry-btn"
                  onClick={() => {
                    revealOnceRef.current = false
                    setScratchProgress(0)
                    pendingRef.current = stored.label
                    setPendingLabel(stored.label)
                    setPhase('scratch')
                  }}
                >
                  רוצה לגרוד? נסי שוב את כרטיס הגירוד
                </button>
              </p>
            ) : null}
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

  if (phase === 'celebrating' && stored) {
    return (
      <div className="page gift-scratch-page gift-scratch-page--celebrate">
        <ConfettiBurst />
        <div className="container page-narrow">
          <h1 className="page-title gift-scratch-title gift-scratch-title--pulse">מזל טוב!</h1>
          <div className="scratch-revealed-card scratch-revealed-card--pop">
            <p className="scratch-revealed-badge">גילית את המתנה</p>
            <p className="scratch-revealed-prize">{stored.label}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page gift-scratch-page">
      <div className="container page-narrow">
        <h1 className="page-title gift-scratch-title">כרטיס גירוד — מתנה ממנו</h1>
        <p className="page-lead gift-scratch-lead">
          גרדי את השכבה המנצנצת עם האצבע או העכבר — רק אז תופיע ההטבה שלך.
        </p>

        <div className="scratch-progress-wrap" aria-hidden={scratchProgress <= 0}>
          <div className="scratch-progress-track">
            <div
              className="scratch-progress-fill"
              style={{ width: `${Math.min(100, Math.round(scratchProgress * 100))}%` }}
            />
          </div>
          <span className="scratch-progress-label">
            {scratchProgress < 0.48
              ? `גרידי… ${Math.min(47, Math.round(scratchProgress * 100))}%`
              : 'כמעט שם!'}
          </span>
        </div>

        <div className="scratch-card-outer scratch-card-outer--shimmer">
          <div className="scratch-card-inner">
            {pendingLabel ? (
              <ScratchCanvas
                prizeLabel={displayPrize}
                prizeVisible={prizeVisible}
                onRevealed={handleRevealed}
                onProgress={setScratchProgress}
              />
            ) : null}
          </div>
        </div>

        <p className="scratch-hint-finger" aria-hidden>
          👆 גרדי כאן
        </p>

        <div className="scratch-a11y">
          <button type="button" className="scratch-skip-link" onClick={revealWithoutScratch}>
            חשיפה מהירה (בלי גירוד)
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
