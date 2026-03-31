import { Link } from 'react-router-dom'
import { MENU_SECTIONS } from '../constants/menuItems'
import { WHATSAPP_LINK } from '../constants/contact'

function formatPrice(n: number) {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 2,
  }).format(n)
}

export function Menu() {
  return (
    <div className="menu-page menu-premium">
      <div className="menu-premium-hero">
        <div className="container menu-premium-hero-inner">
          <nav className="menu-premium-nav" aria-label="ניווט תפריט">
            <Link to="/" className="menu-premium-nav-btn" aria-label="חזרה לדף הבית">
              <span className="menu-premium-nav-icon" aria-hidden>
                ←
              </span>
              <span className="menu-premium-nav-text">בית</span>
            </Link>
            <Link to="/booking" className="menu-premium-nav-btn menu-premium-nav-btn-accent" aria-label="קביעת תור">
              <span className="menu-premium-nav-text">תור</span>
            </Link>
          </nav>
          <p className="eyebrow menu-premium-eyebrow">המחירים והשירותים</p>
          <h1 className="menu-premium-title">תפריט הטיפולים</h1>
          <p className="menu-premium-intro">
            בוחרים טיפול או מוצר, ונקבעות תור בלחיצה — או כותבות לנו בוואטסאפ.
          </p>
        </div>
      </div>

      <div className="container menu-premium-body">
        {MENU_SECTIONS.map((section) => (
          <section key={section.id} className="menu-premium-section">
            {section.title ? (
              <header className="menu-premium-section-head">
                <span className="menu-premium-section-line" aria-hidden />
                <h2 className="menu-premium-section-title">{section.title}</h2>
                <span className="menu-premium-section-line" aria-hidden />
              </header>
            ) : null}

            <ul className="menu-premium-grid">
              {section.items.map((item) => (
                <li key={item.id}>
                  <article className="menu-premium-card">
                    <div className="menu-premium-card-media">
                      <img
                        className="menu-premium-card-img"
                        src={item.image}
                        alt=""
                        width={120}
                        height={120}
                        loading="lazy"
                      />
                    </div>

                    <div className="menu-premium-card-main">
                      <h3 className="menu-premium-card-title">{item.title}</h3>
                      {item.description ? (
                        <p className="menu-premium-card-desc">{item.description}</p>
                      ) : null}
                      {item.price != null ? (
                        <div className="menu-premium-card-price-row">
                          {item.oldPrice != null ? (
                            <span className="menu-premium-card-price-old">
                              {formatPrice(item.oldPrice)}
                            </span>
                          ) : null}
                          <span className="menu-premium-card-price">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="menu-premium-card-action">
                      <Link
                        className="menu-premium-cta"
                        to={
                          item.skipBooking
                            ? '/contact'
                            : `/booking?service=${encodeURIComponent(item.bookingLabel)}`
                        }
                      >
                        {item.skipBooking ? 'פרטים' : 'בחרי'}
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="menu-premium-outro">
          <p className="menu-premium-outro-text">
            לא מצאת בדיוק מה שחיפשת? נשמח לייעץ בוואטסאפ או בטלפון.
          </p>
          <div className="menu-premium-outro-btns">
            <a
              href={WHATSAPP_LINK}
              className="btn btn-whatsapp"
              target="_blank"
              rel="noopener noreferrer"
            >
              הודעה ב־WhatsApp
            </a>
            <Link to="/booking" className="btn btn-primary">
              קביעת תור
            </Link>
            <Link to="/contact" className="btn btn-ghost">
              צור קשר
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
