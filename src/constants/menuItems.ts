export type MenuItem = {
  id: string
  title: string
  description?: string
  price?: number
  oldPrice?: number
  image: string
  /** ערך שנשלח בטופס קביעת תור */
  bookingLabel: string
  /** ללא קביעת תור (למשל הצגת הסטודיו) */
  skipBooking?: boolean
}

export type MenuSection = {
  id: string
  /** כותרת מקטע — null = בלי כותרת (למשל My place בראש) */
  title: string | null
  items: MenuItem[]
}

/** מקטעים לפי סדר תצוגה */
export const MENU_SECTIONS: MenuSection[] = [
  {
    id: 'studio',
    title: null,
    items: [
      {
        id: 'my-place',
        title: 'My place',
        description: 'הסטודיו שלנו — אווירה נעימה וציוד מקצועי',
        image:
          'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&w=200&h=200&fit=crop&q=80',
        bookingLabel: '',
        skipBooking: true,
      },
    ],
  },
  {
    id: 'nails',
    title: 'ציפורניים',
    items: [
      {
        id: 'manicure-gel-hands',
        title: 'מניקור ולק גל ידיים 💅',
        description: 'לק גל ידיים + מבנה אנטומי',
        price: 150,
        image:
          'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&w=200&h=200&fit=crop&q=80',
        bookingLabel: 'מניקור ולק גל ידיים — ₪150',
      },
      {
        id: 'gel-feet',
        title: 'לק גל רגליים',
        description: 'ציפורני רגליים בלק ג׳ל עמיד ומבריק',
        price: 130,
        image:
          'https://images.unsplash.com/photo-1519415387722-a1bff3f403ed?auto=format&w=200&h=200&fit=crop&q=80',
        bookingLabel: 'לק גל רגליים — ₪130',
      },
    ],
  },
  {
    id: 'browse-products',
    title: 'גבות, מוצרים וטיפולים',
    items: [
      {
        id: 'micro-brow-pen',
        title: 'טוש מיקרו לגבות 🥹',
        description: 'טוש מיקרו לגבות!',
        price: 70,
        oldPrice: 80,
        image:
          'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&w=200&h=200&fit=crop&q=80',
        bookingLabel: 'טוש מיקרו לגבות — ₪70',
      },
      {
        id: 'keratin-mascara',
        title: 'מסקרה קרטין 🌱',
        description: 'מסקרה קרטין!',
        price: 60,
        image:
          'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&w=200&h=200&fit=crop&q=80',
        bookingLabel: 'מסקרה קרטין — ₪60',
      },
      {
        id: 'micro-nano-blading',
        title: 'מיקרובליידינג + נאנובליידינג',
        description: 'מעניקה מסגרת לפנים, עיבוי הגבות ומראה טבעי',
        price: 900,
        image:
          'https://images.unsplash.com/photo-1595550912256-b24059bb08e8?auto=format&w=200&h=200&fit=crop&crop=faces&q=80',
        bookingLabel: 'מיקרובליידינג + נאנובליידינג — ₪900',
      },
      {
        id: 'brow-upper-lip',
        title: 'עיצוב גבות ושפם',
        description: 'עיצוב מדויק לגבות ולאזור השפם',
        price: 60,
        image:
          'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&w=200&h=200&fit=crop&q=80',
        bookingLabel: 'עיצוב גבות ושפם — ₪60',
      },
      {
        id: 'castor-oil',
        title: 'שמן קיק 🌱',
        description: 'הסוף לחורים בגבות!!',
        price: 20,
        image:
          'https://images.unsplash.com/photo-1556228578-0d85b1a2d548?auto=format&w=200&h=200&fit=crop&q=80',
        bookingLabel: 'שמן קיק — ₪20',
      },
    ],
  },
]

/** כל הפריטים בשטוח (תאימות לאחור) */
export const MENU_ITEMS: MenuItem[] = MENU_SECTIONS.flatMap((s) => s.items)

export function getBookingOptions(): string[] {
  const fromMenu = MENU_ITEMS.filter((i) => !i.skipBooking && i.bookingLabel).map((i) => i.bookingLabel)
  return [...fromMenu, 'אחר / שירות שלא ברשימה']
}
