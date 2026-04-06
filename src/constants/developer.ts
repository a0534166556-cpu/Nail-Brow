/**
 * טקסט וקישור בפוטר לפרסום שירותי פיתוח אתרים.
 * ברירת מחדל: דף נפרד עם פרטי מפתח האתר (לא דף צור קשר של הסטודיו).
 */
const urlFromEnv = import.meta.env.VITE_DEVELOPER_URL?.trim()

/** אם מוגדר — פותח בחלון חדש. אחרת — דף פנימי `/website-for-business` */
export const DEVELOPER_EXTERNAL_URL: string | null = urlFromEnv || null

export const DEVELOPER_SITE_LABEL =
  import.meta.env.VITE_DEVELOPER_LABEL?.trim() ||
  'צריכים גם אתר לעסק שלך? צור קשר — פיתוח ועיצוב אתרים'

/** דף יצירת קשר לשירותי בניית אתר (מספר מפתח), לא הסטודיו */
export const DEVELOPER_CONTACT_PATH = '/website-for-business' as const
