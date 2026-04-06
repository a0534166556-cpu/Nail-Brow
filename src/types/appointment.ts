export type Appointment = {
  id: string
  name: string
  phone: string
  service: string
  date: string
  time: string
  notes: string
  /** אימייל אופציונלי לאישור בדוא״ל (חסר בתורים ישנים) */
  email?: string
  createdAt: string
}

/** תשובה מ-POST /api/appointments — כולל דגל אחרי תור שני עם אותו טלפון */
export type CreateAppointmentResult = Appointment & {
  giftCardUnlocked?: boolean
}
