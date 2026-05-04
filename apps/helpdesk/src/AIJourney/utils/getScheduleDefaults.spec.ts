import { getLocalTimeZone, toTime, toZoned } from '@internationalized/date'

import { getScheduleDefaults } from './getScheduleDefaults'

describe('getScheduleDefaults', () => {
    it('returns "later" defaults with empty date/time when no datetime is provided', () => {
        const result = getScheduleDefaults()

        expect(result).toEqual({
            scheduleType: 'later',
            scheduledDate: null,
            scheduledTime: null,
        })
    })

    it('returns "later" defaults with empty date/time when undefined is passed', () => {
        const result = getScheduleDefaults(undefined)

        expect(result).toEqual({
            scheduleType: 'later',
            scheduledDate: null,
            scheduledTime: null,
        })
    })

    it('returns "later" schedule type with parsed date and time for a valid datetime', () => {
        const result = getScheduleDefaults('2026-05-15T14:30:00')

        expect(result.scheduleType).toBe('later')
        expect(result.scheduledDate).not.toBeNull()
        expect(result.scheduledTime).not.toBeNull()
    })

    it('converts UTC datetime to local timezone', () => {
        const utcDatetime = '2026-06-01T10:00:00'
        const result = getScheduleDefaults(utcDatetime)

        expect(result.scheduledDate).not.toBeNull()
        expect(result.scheduledDate!.timeZone).toBe(getLocalTimeZone())
    })

    it('extracts time component from the parsed datetime', () => {
        const result = getScheduleDefaults('2026-06-01T10:00:00')

        expect(result.scheduledTime).not.toBeNull()
        expect(result.scheduledTime!.hour).toBeDefined()
        expect(result.scheduledTime!.minute).toBeDefined()
    })

    it('produces a round-trippable result', () => {
        const utcDatetime = '2026-07-20T15:45:00'
        const result = getScheduleDefaults(utcDatetime)

        const localZoned = result.scheduledDate!
        const utcZoned = toZoned(localZoned, 'UTC')

        expect(utcZoned.hour).toBe(15)
        expect(utcZoned.minute).toBe(45)
        expect(utcZoned.day).toBe(20)
        expect(utcZoned.month).toBe(7)

        const timeFromDate = toTime(result.scheduledDate!)
        expect(timeFromDate.hour).toBe(result.scheduledTime!.hour)
        expect(timeFromDate.minute).toBe(result.scheduledTime!.minute)
    })
})
