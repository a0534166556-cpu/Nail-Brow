import { Link, Outlet } from 'react-router-dom'

export function Layout() {
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
            <Link to="/services">שירותים</Link>
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
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <p>© {new Date().getFullYear()} סטודיו ציפורניים וגבות — כל הזכויות שמורות.</p>
          <p className="footer-note">לקביעת תור: דף &quot;קביעת תור&quot; או יצירת קשר בטלפון.</p>
        </div>
      </footer>
    </div>
  )
}
