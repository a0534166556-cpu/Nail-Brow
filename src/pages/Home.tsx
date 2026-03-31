import { Link } from 'react-router-dom'
import { NAIL_SERVICES, BROW_SERVICES } from '../constants/services'

const IMG_NAILS =
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&w=900&h=1120&fit=crop&q=80'
const IMG_BROWS =
  'https://images.unsplash.com/photo-1595550912256-b24059bb08e8?auto=format&w=760&h=950&fit=crop&crop=faces&facepad=3&q=85'
const IMG_STUDIO =
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&w=1400&h=560&fit=crop&q=80'

export function Home() {
  return (
    <>
      <section className="hero hero-light">
        <div className="hero-pattern" aria-hidden />
        <div className="container hero-landing">
          <div className="hero-copy">
            <p className="eyebrow">סטודיו יוקרתי לנשים</p>
            <h1>ציפורניים מושלמות וגבות שמסגרות את הפנים</h1>
            <p className="lead">
              בניית ציפורניים, ג׳ל, מניקור ופדיקור — לצד עיצוב גבות, צבע וטיפולים מקצועיים. חוויית טיפוח רגועה,
              נקייה ומדויקת.
            </p>
            <div className="hero-actions">
              <Link to="/menu" className="btn btn-primary">
                תפריט ומחירים
              </Link>
              <Link to="/booking" className="btn btn-ghost">
                קביעת תור
              </Link>
              <Link to="/contact" className="btn btn-ghost">
                צור קשר
              </Link>
            </div>
            <ul className="hero-bullets">
              <li>חומרים איכותיים וצבעים עשירים</li>
              <li>בתפריט — כל הפריטים למכירה ולטיפול, כולל לק ג׳ל ומוצרי גבות</li>
              <li>ייעוץ מקצועי לפי סגנון ואורח חיים</li>
            </ul>
          </div>

          <div className="hero-mosaic">
            <figure className="hero-fig hero-fig-nails">
              <img src={IMG_NAILS} alt="מניקור וציפורניים מעוצבות בסטודיו" width={450} height={560} loading="eager" />
            </figure>
            <figure className="hero-fig hero-fig-brows">
              <img
                src={IMG_BROWS}
                alt="אישה עם גבות מעוצבות ומראה נקי אחרי טיפול גבות ואיפור טבעי"
                width={380}
                height={475}
                loading="eager"
              />
            </figure>
            <div className="hero-floating-card">
              <span className="hero-floating-title">Nail &amp; Brow</span>
              <p>לוק נקי, ברק עדין ותוצאות שמחזיקות מעמד.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="showcase-strip" aria-label="אווירת הסטודיו">
        <div className="showcase-strip-inner">
          <img
            src={IMG_STUDIO}
            alt="אווירת טיפוח וציפורניים בסטודיו"
            width={1400}
            height={560}
            loading="lazy"
            className="showcase-img"
          />
          <div className="showcase-caption">
            <h2>מקום שבו הרגע שייך לך</h2>
            <p>תאורה נעימה, כיסאות נוחים וידיים מקצועיות — בדיוק בשביל להירגע בזמן הטיפול.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">ציפורניים</h2>
          <p className="section-sub">
            טיפוח ידיים ורגליים — מקצועי, עדין ומדויק.{' '}
            <Link to="/menu" className="section-inline-link">
              כל המחירים והפריטים — בתפריט
            </Link>
          </p>
          <div className="cards">
            {NAIL_SERVICES.map((s) => (
              <article key={s.id} className="card">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">גבות</h2>
          <p className="section-sub">מבט מסודר וטבעי שמתאים לך.</p>
          <div className="cards">
            {BROW_SERVICES.map((s) => (
              <article key={s.id} className="card card-brow">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </article>
            ))}
          </div>
          <div className="section-cta-row">
            <Link to="/menu" className="btn btn-ghost">
              כל המחירים והמוצרים בתפריט
            </Link>
            <Link to="/booking" className="btn btn-primary">
              קביעת תור
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
