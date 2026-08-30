import { describe, expect, test } from "bun:test"

import {
  addUtcCalendarDays,
  clampDateToPaidWindow,
  getPaidConditionWindow,
  isDateInsidePaidWindow,
  utcCalendarDaysBetween,
} from "./condition-window"

describe("paid condition window", () => {
  test("uses the start day as the paid end for a legacy open-ended condition", () => {
    expect(
      getPaidConditionWindow({
        startDate: "2026-08-01T00:00:00.000Z",
        endDate: null,
      }),
    ).toEqual({ start: "2026-08-01", end: "2026-08-01" })
  })

  test("treats the first and final paid days as inclusive", () => {
    const window = { start: "2026-08-01", end: "2026-08-15" }

    expect(isDateInsidePaidWindow("2026-08-01", window)).toBe(true)
    expect(isDateInsidePaidWindow("2026-08-15T23:59:59.999Z", window)).toBe(true)
    expect(isDateInsidePaidWindow("2026-08-16", window)).toBe(false)
  })

  test("performs calendar arithmetic without local timezone drift", () => {
    expect(addUtcCalendarDays("2026-08-31", 1)).toBe("2026-09-01")
    expect(utcCalendarDaysBetween("2026-08-15", "2026-08-20")).toBe(5)
    expect(
      clampDateToPaidWindow("2026-08-25", {
        start: "2026-08-01",
        end: "2026-08-15",
      }),
    ).toBe("2026-08-15")
  })
})
