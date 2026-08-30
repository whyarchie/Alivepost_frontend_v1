export interface ConditionWindowSource {
  startDate: string | Date
  endDate?: string | Date | null
}

export interface PaidConditionWindow {
  start: string
  end: string
}

// The backend bills and validates condition windows as inclusive UTC calendar
// days. Keep the browser on that same representation so native date inputs do
// not shift a boundary when the user's local timezone differs from UTC.
export function toUtcDateKey(value: string | Date | null | undefined): string | null {
  if (!value) return null

  const date = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(date.getTime())) return null

  return date.toISOString().slice(0, 10)
}

export function getPaidConditionWindow(
  condition: ConditionWindowSource | null | undefined,
): PaidConditionWindow | null {
  if (!condition) return null

  const start = toUtcDateKey(condition.startDate)
  if (!start) return null

  // Legacy open-ended conditions were billed for one day by the backend.
  const end = toUtcDateKey(condition.endDate) ?? start
  if (end < start) return null

  return { start, end }
}

export function isDateInsidePaidWindow(
  value: string | Date,
  window: PaidConditionWindow,
) {
  const date = toUtcDateKey(value)
  return date !== null && date >= window.start && date <= window.end
}

export function addUtcCalendarDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  if (!Number.isFinite(date.getTime()) || !Number.isInteger(days)) return null

  date.setUTCDate(date.getUTCDate() + days)
  return toUtcDateKey(date)
}

export function utcCalendarDaysBetween(startKey: string, endKey: string) {
  const start = new Date(`${startKey}T00:00:00.000Z`)
  const end = new Date(`${endKey}T00:00:00.000Z`)
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
    return null
  }

  return Math.round((end.getTime() - start.getTime()) / 86_400_000)
}

export function clampDateToPaidWindow(
  value: string,
  window: PaidConditionWindow,
) {
  if (value < window.start) return window.start
  if (value > window.end) return window.end
  return value
}
