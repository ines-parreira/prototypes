import { DateFormatType, TimeFormatType } from '@repo/utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { formatExpirationTime } from '../formatExpirationTime'

describe('formatExpirationTime', () => {
    const mockNow = '2026-01-30T10:00:00Z'

    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(mockNow))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe.each([
        {
            range: 'less than 1 day away',
            expiresAt: '2026-01-30T14:30:00Z',
            expectations: {
                [DateFormatType.en_US]: {
                    [TimeFormatType.AmPm]: '2:30pm',
                    [TimeFormatType.TwentyFourHour]: '14:30',
                },
                [DateFormatType.en_GB]: {
                    [TimeFormatType.AmPm]: '2:30pm',
                    [TimeFormatType.TwentyFourHour]: '14:30',
                },
            },
        },
        {
            range: '1-7 days away',
            expiresAt: '2026-02-02T14:30:00Z',
            expectations: {
                [DateFormatType.en_US]: {
                    [TimeFormatType.AmPm]: 'Monday, 2:30pm',
                    [TimeFormatType.TwentyFourHour]: 'Monday, 14:30',
                },
                [DateFormatType.en_GB]: {
                    [TimeFormatType.AmPm]: 'Monday, 2:30pm',
                    [TimeFormatType.TwentyFourHour]: 'Monday, 14:30',
                },
            },
        },
        {
            range: 'more than 7 days away',
            expiresAt: '2026-02-09T14:30:00Z',
            expectations: {
                [DateFormatType.en_US]: {
                    [TimeFormatType.AmPm]: '02/09/26, 2:30pm',
                    [TimeFormatType.TwentyFourHour]: '02/09/26, 14:30',
                },
                [DateFormatType.en_GB]: {
                    [TimeFormatType.AmPm]: '09/02/26, 2:30pm',
                    [TimeFormatType.TwentyFourHour]: '09/02/26, 14:30',
                },
            },
        },
    ])('$range', ({ expiresAt, expectations }) => {
        describe.each(Object.entries(expectations))(
            'formats with %s date format',
            (dateCase, timeCases) => {
                it.each(Object.entries(timeCases))(
                    `formats with %s time format`,
                    (timeFormat, expectedValue) => {
                        const result = formatExpirationTime(
                            expiresAt,
                            dateCase as DateFormatType,
                            timeFormat as TimeFormatType,
                        )
                        expect(result).toBe(expectedValue)
                    },
                )
            },
        )
    })

    describe('edge cases', () => {
        it('handles expiration in less than 1 hour', () => {
            const expiresAt = '2026-01-30T10:30:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                TimeFormatType.AmPm,
            )
            expect(result).toBe('10:30am')
        })

        it('handles expiration exactly 1 day away', () => {
            const expiresAt = '2026-01-31T10:00:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                TimeFormatType.AmPm,
            )
            expect(result).toBe('Saturday, 10:00am')
        })

        it('handles expiration nearly 7 days away', () => {
            const expiresAt = '2026-02-06T09:59:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                TimeFormatType.AmPm,
            )
            expect(result).toBe('Friday, 9:59am')
        })

        it('handles expiration exactly 7 days away', () => {
            const expiresAt = '2026-02-06T10:00:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                TimeFormatType.AmPm,
            )
            expect(result).toBe('02/06/26, 10:00am')
        })

        it('handles expiration many weeks away', () => {
            const expiresAt = '2026-03-15T16:45:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                TimeFormatType.AmPm,
            )
            expect(result).toBe('03/15/26, 4:45pm')
        })

        it('correctly differentiates MM/DD vs DD/MM formats', () => {
            const expiresAt = '2026-03-05T14:30:00Z'

            const usResult = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                TimeFormatType.AmPm,
            )
            expect(usResult).toBe('03/05/26, 2:30pm')

            const gbResult = formatExpirationTime(
                expiresAt,
                DateFormatType.en_GB,
                TimeFormatType.AmPm,
            )
            expect(gbResult).toBe('05/03/26, 2:30pm')
        })
    })

    describe('default values', () => {
        it('defaults to en_US date format when not specified', () => {
            const expiresAt = '2026-02-09T14:30:00Z'
            const result = formatExpirationTime(
                expiresAt,
                undefined as any,
                TimeFormatType.AmPm,
            )
            expect(result).toBe('02/09/26, 2:30pm')
        })

        it('defaults to 12-hour time format when not specified', () => {
            const expiresAt = '2026-02-09T14:30:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                undefined as any,
            )
            expect(result).toBe('02/09/26, 2:30pm')
        })

        it('uses defaults when both parameters are omitted', () => {
            const expiresAt = '2026-02-09T14:30:00Z'
            const result = formatExpirationTime(expiresAt)
            expect(result).toBe('02/09/26, 2:30pm')
        })
    })

    describe('edge cases', () => {
        it('handles midnight expiration time', () => {
            const expiresAt = '2026-01-31T00:00:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                TimeFormatType.AmPm,
            )
            // Expires in 14 hours (less than 1 day), so shows time only
            expect(result).toBe('12:00am')
        })

        it('handles noon expiration time', () => {
            const expiresAt = '2026-01-31T12:00:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                TimeFormatType.AmPm,
            )
            expect(result).toBe('Saturday, 12:00pm')
        })

        it('handles year boundary crossing', () => {
            vi.setSystemTime(new Date('2026-12-30T10:00:00Z'))
            const expiresAt = '2027-01-08T14:30:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                TimeFormatType.AmPm,
            )
            expect(result).toBe('01/08/27, 2:30pm')
        })
    })

    describe('timezone conversion', () => {
        it('converts UTC to PST timezone', () => {
            const expiresAt = '2026-01-30T18:00:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                TimeFormatType.AmPm,
                'America/Los_Angeles',
            )
            // 18:00 UTC = 10:00 PST (8 hours earlier)
            // Current time is 10:00 UTC = 2:00 PST
            // So expiration is at 10:00 PST same day (within 24 hours)
            expect(result).toBe('10:00am')
        })

        it('converts UTC to JST timezone', () => {
            const expiresAt = '2026-01-30T14:30:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                TimeFormatType.TwentyFourHour,
                'Asia/Tokyo',
            )
            // 14:30 UTC = 23:30 JST (9 hours ahead)
            // Current time is 10:00 UTC = 19:00 JST
            // So expiration is at 23:30 JST same day (within 24 hours)
            expect(result).toBe('23:30')
        })

        it('handles timezone causing day boundary crossing', () => {
            // Current time: Jan 30 10:00 UTC = Jan 30 02:00 PST
            // Expiration: Jan 31 03:00 UTC = Jan 30 19:00 PST (same day in PST!)
            const expiresAt = '2026-01-31T03:00:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                TimeFormatType.AmPm,
                'America/Los_Angeles',
            )
            // In PST, this is still Jan 30 at 19:00 (within 24 hours from 02:00)
            expect(result).toBe('7:00pm')
        })

        it('handles timezone causing week boundary changes', () => {
            // Current time: Jan 30 (Friday) 10:00 UTC = Jan 30 19:00 JST
            // Expiration: Feb 5 (Thursday) 15:00 UTC = Feb 6 (Friday) 00:00 JST
            vi.setSystemTime(new Date('2026-01-30T10:00:00Z'))
            const expiresAt = '2026-02-05T15:00:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                TimeFormatType.TwentyFourHour,
                'Asia/Tokyo',
            )
            // In JST, this is Friday Feb 6 00:00 (within 7 days)
            expect(result).toBe('Friday, 0:00')
        })

        it('correctly formats date when timezone crosses to next day', () => {
            // Current time: Jan 30 10:00 UTC = Jan 30 19:00 JST
            // Expiration: Feb 8 10:00 UTC = Feb 8 19:00 JST
            const expiresAt = '2026-02-08T10:00:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                TimeFormatType.AmPm,
                'Asia/Tokyo',
            )
            // More than 7 days, show full date in JST
            expect(result).toBe('02/08/26, 7:00pm')
        })

        it('works without timezone (defaults to UTC)', () => {
            const expiresAt = '2026-01-30T14:30:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                TimeFormatType.AmPm,
            )
            // No timezone, so stays in UTC
            expect(result).toBe('2:30pm')
        })

        it('handles London timezone with DST consideration', () => {
            // Current time: Jan 30 10:00 UTC
            // Expiration: Jan 30 15:00 UTC = Jan 30 15:00 GMT (no DST in January)
            const expiresAt = '2026-01-30T15:00:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_GB,
                TimeFormatType.TwentyFourHour,
                'Europe/London',
            )
            // Same time in winter (GMT = UTC)
            expect(result).toBe('15:00')
        })

        it('handles Eastern timezone', () => {
            // Current time: Jan 30 10:00 UTC = Jan 30 05:00 EST
            // Expiration: Jan 30 20:00 UTC = Jan 30 15:00 EST
            const expiresAt = '2026-01-30T20:00:00Z'
            const result = formatExpirationTime(
                expiresAt,
                DateFormatType.en_US,
                TimeFormatType.AmPm,
                'America/New_York',
            )
            expect(result).toBe('3:00pm')
        })
    })
})
