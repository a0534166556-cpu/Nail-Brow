/** כתובת האתר המפורסם (ללא סלאש בסוף) — להגדרה ב-Netlify: VITE_SITE_URL */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL?.trim() || 'https://nail-brow.netlify.app'
).replace(/\/$/, '')

export const SITE_NAME = 'Nail & Brow'
export const SITE_LOCALITY = 'אשקלון'

export const SITE_DESCRIPTION =
  'סטודיו לציפורניים, לק ג׳ל, מניקור, פדיקור ועיצוב גבות באשקלון. קביעת תור אונליין, מחירים בתפריט, וואטסאפ וטלפון.'

export const SITE_TITLE_DEFAULT = `${SITE_NAME} | ציפורניים וגבות באשקלון`

export type PageSeoMeta = {
  title: string
  description: string
  /** לא לסרוק בגוגל */
  noIndex?: boolean
}

export const PAGE_SEO: Record<string, PageSeoMeta> = {
  '/': {
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
  },
  '/menu': {
    title: `תפריט ומחירים | ${SITE_NAME}`,
    description:
      'מחירון טיפולי ציפורניים, לק ג׳ל, גבות ומוצרים. בחרי שירות וקבעי תור אונליין באשקלון.',
  },
  '/booking': {
    title: `קביעת תור אונליין | ${SITE_NAME}`,
    description: 'קביעת תור לסטודיו ציפורניים וגבות באשקלון — בחירת שירות, תאריך ושעה.',
  },
  '/contact': {
    title: `צור קשר | ${SITE_NAME} — ${SITE_LOCALITY}`,
    description: `טלפון, וואטסאפ וכתובת: ${SITE_LOCALITY}. נשמח לענות ולתאם תור.`,
  },
  '/gift-scratch': {
    title: `כרטיס מתנה | ${SITE_NAME}`,
    description: 'מתנת גירוד אחרי שלושה תורים — גלי איזו הטבה קיבלת.',
  },
  '/website-for-business': {
    title: `אתר לעסק | פיתוח אתרים`,
    description: 'פיתוח ועיצוב אתרים לעסקים קטנים — יצירת קשר.',
  },
  '/admin': {
    title: `ניהול | ${SITE_NAME}`,
    description: 'דף ניהול פנימי.',
    noIndex: true,
  },
}

export function seoForPath(pathname: string): PageSeoMeta {
  return PAGE_SEO[pathname] ?? PAGE_SEO['/']
}
