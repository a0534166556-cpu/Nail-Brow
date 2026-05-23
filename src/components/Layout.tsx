import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  DEVELOPER_CONTACT_PATH,
  DEVELOPER_EXTERNAL_URL,
  DEVELOPER_SITE_LABEL,
} from '../constants/developer'
import { PageSeo } from './PageSeo'

type NavItem = {
  to: string
  label: string
  cta?: boolean
  admin?: boolean
}

const NAV_LINKS: NavItem[] = [
  { to: '/', label: 'בית' },
  { to: '/menu', label: 'תפריט' },
  { to: '/contact', label: 'צור קשר' },
  { to: '/booking', label: 'קביעת תור', cta: true },
  { to: '/admin', label: 'ניהול', admin: true },
]

export function Layout() {
  const { pathname } = useLocation()
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.classList.toggle('nav-open', navOpen)
    return () => document.body.classList.remove('nav-open')
  }, [navOpen])

  return (
    <div className="layout">
      <PageSeo />
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo" onClick={() => setNavOpen(false)}>
            <span className="logo-mark" aria-hidden>
              ✦
            </span>
            <span className="logo-text">Nail & Brow</span>
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={navOpen}
            aria-controls="main-nav"
            onClick={() => setNavOpen((o) => !o)}
          >
            <span className="visually-hidden">{navOpen ? 'סגירת תפריט' : 'פתיחת תפריט'}</span>
            <span className="nav-toggle-icon" aria-hidden />
          </button>

          {navOpen ? (
            <button
              type="button"
              className="nav-backdrop"
              aria-label="סגירת תפריט"
              onClick={() => setNavOpen(false)}
            />
          ) : null}

          <nav id="main-nav" className={`nav${navOpen ? ' nav--open' : ''}`} aria-label="ניווט ראשי">
            <div className="nav-drawer-head">
              <span className="nav-drawer-title">תפריט</span>
              <button
                type="button"
                className="nav-drawer-close"
                aria-label="סגירה"
                onClick={() => setNavOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="nav-links">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    item.cta ? 'nav-cta' : '',
                    item.admin ? 'nav-admin' : '',
                    pathname === item.to ? 'nav-link-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setNavOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="page-enter" key={pathname}>
          <Outlet />
        </div>
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <p>© {new Date().getFullYear()} סטודיו ציפורניים וגבות — כל הזכויות שמורות.</p>
          <p className="footer-note">
            <Link to="/menu">תפריט</Link>
            {' · '}
            <Link to="/contact">צור קשר</Link>
            {' · '}
            <Link to="/booking">קביעת תור</Link>
          </p>
          <p className="footer-dev-credit">
            {DEVELOPER_EXTERNAL_URL ? (
              <a href={DEVELOPER_EXTERNAL_URL} target="_blank" rel="noopener noreferrer">
                {DEVELOPER_SITE_LABEL}
              </a>
            ) : (
              <Link to={DEVELOPER_CONTACT_PATH}>{DEVELOPER_SITE_LABEL}</Link>
            )}
          </p>
        </div>
      </footer>
    </div>
  )
}
