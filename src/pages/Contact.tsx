import { Link } from 'react-router-dom'
import {
  PHONE_DISPLAY,
  PHONE_E164,
  STUDIO_ADDRESS_DISPLAY,
  STUDIO_GOOGLE_MAPS_URL,
  STUDIO_WAZE_URL,
  WHATSAPP_LINK,
} from '../constants/contact'

export function Contact() {
  return (
    <div className="page">
      <div className="container page-narrow">
        <h1 className="page-title">צור קשר</h1>
        <p className="page-lead">
          שמחים לענות לשאלות, לתאם תור או להתייעץ — צרו קשר בטלפון או ב-WhatsApp, או השאירו בקשה בדף קביעת התור.
        </p>

        <div className="contact-panel">
          <h2 className="contact-panel-title">טלפון</h2>
          <a className="contact-phone" href={`tel:${PHONE_E164}`}>
            {PHONE_DISPLAY}
          </a>
          <p className="contact-hint">לחץ על המספר כדי לחייג ישירות מהנייד.</p>

          <div className="contact-actions">
            <a className="btn btn-primary" href={`tel:${PHONE_E164}`}>
              חיוג עכשיו
            </a>
            <a className="btn btn-ghost" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </div>
        </div>

        <div className="contact-panel">
          <h2 className="contact-panel-title">כתובת</h2>
          <p className="contact-address">{STUDIO_ADDRESS_DISPLAY}</p>
          <p className="contact-hint">ניווט ישירות מהנייד למיקום הסטודיו.</p>
          <div className="contact-actions">
            <a className="btn btn-primary" href={STUDIO_GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer">
              פתיחה ב-Google Maps
            </a>
            <a className="btn btn-ghost" href={STUDIO_WAZE_URL} target="_blank" rel="noopener noreferrer">
              ניווט ב-Waze
            </a>
          </div>
        </div>

        <div className="contact-panel contact-panel-muted">
          <h2 className="contact-panel-title">קביעת תור אונליין</h2>
          <p>ניתן למלא טופס קצר ולבחור שירות ומועד — נחזור אליך לאישור במידת הצורך.</p>
          <Link to="/booking" className="btn btn-primary btn-block contact-panel-btn">
            לדף קביעת תור
          </Link>
        </div>

        <p className="back-link">
          <Link to="/menu">תפריט</Link>
          {' · '}
          <Link to="/">דף הבית</Link>
        </p>
      </div>
    </div>
  )
}
