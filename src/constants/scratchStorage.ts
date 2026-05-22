/** נפתח אחרי תשובת שרת עם giftCardUnlocked (שלושה תורים מצטברים עם אותו טלפון) */
export const SCRATCH_ELIGIBLE_KEY = 'nailStudioScratchEligible'

/** נשמר אחרי גילוי הפרס */
export const SCRATCH_PRIZE_KEY = 'nailStudioScratchPrize'

export type StoredScratchPrize = {
  label: string
  revealedAt: string
  /** true = גירוד אמיתי; false = חשיפה בלי גירוד (ניתן לגרוד שוב) */
  scratched?: boolean
}

export function markScratchEligible(): void {
  try {
    localStorage.setItem(SCRATCH_ELIGIBLE_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
}
