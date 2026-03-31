import { getBookingOptions } from './menuItems'

/** אפשרויות בטופס קביעת תור — נגזרות מהתפריט */
export const BOOKING_SERVICE_OPTIONS: string[] = getBookingOptions()

export const NAIL_SERVICES = [
  { id: 'extension', title: 'בניית ציפורניים / הארכה', desc: 'ארכה בעמידות גבוהה, צורה מדויקת ולוק מושלם.' },
  { id: 'gel', title: 'ציפורניים ג׳ל', desc: 'ציפוי ג׳ל חזק, ברק עדין ועמידות לאורך זמן.' },
  { id: 'manicure', title: 'מניקור קלאסי', desc: 'טיפוח, עידון קוטיקולה ולכה לבחירתך.' },
  { id: 'pedicure', title: 'פדיקור', desc: 'טיפוח כפות רגליים, עיצוב וצבע מרענן.' },
  { id: 'art', title: 'אמנות ציפורניים', desc: 'עיצובים מיוחדים, אבנים ודוגמאות אישיות.' },
] as const

export const BROW_SERVICES = [
  { id: 'shape', title: 'עיצוב גבות', desc: 'עיצוב לפי מבנה הפנים — טבעי ומדויק.' },
  { id: 'tint', title: 'צבע גבות', desc: 'הדגשת גבות בגוון שמתאים לעור ולשיער.' },
  { id: 'lamination', title: 'למינציה לגבות', desc: 'מראה מלא, מסודר ומורם לאורך שבועות.' },
] as const
