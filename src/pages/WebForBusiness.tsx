import { Link } from 'react-router-dom'
import { DEV_PHONE_DISPLAY, DEV_PHONE_E164, DEV_WHATSAPP_LINK } from '../constants/developerContact'

export function WebForBusiness() {
  return (
    <div className="page">
      <div className="container page-narrow">
        <p className="eyebrow">פיתוח אתרים לעסקים</p>
        <h1 className="page-title">צור קשר</h1>
        <p className="page-lead">בנייה ועיצוב אתרים לעסקים — נשמח לשמוע מה צריך ולתאם שיחה קצרה.</p>

        <div className="contact-panel">
          <h2 className="contact-panel-title">טלפון ו־WhatsApp</h2>
          <a className="contact-phone" href={`tel:${DEV_PHONE_E164}`}>
            {DEV_PHONE_DISPLAY}
          </a>
          <p className="contact-hint">לחץ על המספר לחיוג מהנייד.</p>

          <div className="contact-actions">
            <a className="btn btn-primary" href={`tel:${DEV_PHONE_E164}`}>
              חיוג עכשיו
            </a>
            <a className="btn btn-ghost" href={DEV_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </div>
        </div>

        <p className="back-link">
          <Link to="/">דף הבית</Link>
        </p>
      </div>
    </div>
  )
}
