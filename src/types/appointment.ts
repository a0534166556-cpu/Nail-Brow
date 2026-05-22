export type Appointment = {
  id: string
  name: string
  phone: string
  service: string
  date: string
  time: string
  notes: string
  /** אימייל אופציונלי — תודה אחרי תור ראשון, מייל כרטיס גירוד אחרי תור שלישי מצטבר (חסר בתורים ישנים) */
  email?: string
  createdAt: string
}

/** תשובה מ-POST /api/appointments — כולל דגל אחרי שלושה תורים מצטברים עם אותו טלפון */
export type CreateAppointmentResult = Appointment & {
  giftCardUnlocked?: boolean
}
