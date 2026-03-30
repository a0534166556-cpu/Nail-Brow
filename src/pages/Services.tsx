import { NAIL_SERVICES, BROW_SERVICES } from '../constants/services'

export function Services() {
  return (
    <div className="page">
      <div className="container page-narrow">
        <h1 className="page-title">השירותים שלנו</h1>
        <p className="page-lead">
          כאן תמצאי את כל מה שקשור לציפורניים ולגבות — אפשר לשלב טיפולים או לבחור טיפול בודד. בזמן קביעת
          התור תוכלי לפרט בקצרה מה חשוב לך.
        </p>

        <h2 className="page-h2">ציפורניים</h2>
        <ul className="service-list">
          {NAIL_SERVICES.map((s) => (
            <li key={s.id}>
              <strong>{s.title}</strong>
              <span>{s.desc}</span>
            </li>
          ))}
        </ul>

        <h2 className="page-h2">גבות</h2>
        <ul className="service-list">
          {BROW_SERVICES.map((s) => (
            <li key={s.id}>
              <strong>{s.title}</strong>
              <span>{s.desc}</span>
            </li>
          ))}
        </ul>

        <div className="tips">
          <h3 className="page-h3">טיפים לפני הביקור</h3>
          <ul>
            <li>מומלץ להגיע בלי לק ישן על הציפורניים (אם מתאפשר) לחיסכון בזמן.</li>
            <li>אם יש רגישות לעור — עדכני מראש כדי שנתאים חומרים.</li>
            <li>לגבות: נמליץ על צורה וגוון לפי מבנה הפנים והעדפה אישית.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
