import { Link, Outlet, useLocation } from 'react-router-dom'

export function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="layout">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <span className="logo-mark" aria-hidden>
              ✦
            </span>
            <span>Nail & Brow</span>
          </Link>
          <nav className="nav" aria-label="ניווט ראשי">
            <Link to="/">בית</Link>
            <Link to="/menu">תפריט</Link>
            <Link to="/contact">צור קשר</Link>
            <Link to="/booking" className="nav-cta">
              קביעת תור
            </Link>
            <Link to="/admin" className="nav-admin">
              ניהול
            </Link>
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
        </div>
      </footer>
    </div>
  )
}
