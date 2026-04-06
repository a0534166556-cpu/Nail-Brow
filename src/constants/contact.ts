/** מספר הסטודיו לחיוג ו-WhatsApp (דף "צור קשר" הרגיל של האתר) */
export const PHONE_DISPLAY = '053-330-1966'
export const PHONE_E164 = '+972533301966'
export const WHATSAPP_LINK = 'https://wa.me/972533301966'

/** כתובת הסטודיו + ניווט במפות */
export const STUDIO_ADDRESS_DISPLAY = 'אורט 22, קומה 9, אשקלון'
const mapsQuery = encodeURIComponent('אורט 22 אשקלון')
export const STUDIO_GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`
export const STUDIO_WAZE_URL = `https://waze.com/ul?q=${mapsQuery}&navigate=yes`
