import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'
import { vi } from 'vitest'

import { getLastSeenTooltipText } from '#ticket-messages/components/MessageBubble/components/MessageHeader/useMessageAvatarTooltip'

const FIXED_NOW = new Date('2024-01-15T12:00:00.000Z').getTime()
const format =
    DateTimeFormatMapper[DateTimeFormatType.RELATIVE_DATE_AND_TIME_EN_US_AM_PM]

beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(FIXED_NOW)
})

afterEach(() => {
    vi.restoreAllMocks()
})

function isoSecondsAgo(seconds: number): string {
    return new Date(FIXED_NOW - seconds * 1000).toISOString()
}

describe('getLastSeenTooltipText', () => {
    describe('Active now', () => {
        it('returns "Active now" when timestamp is just now', () => {
            expect(getLastSeenTooltipText(isoSecondsAgo(0), format, null)).toBe(
                'Active now',
            )
        })

        it('returns "Active now" at the last second of the active threshold', () => {
            expect(
                getLastSeenTooltipText(isoSecondsAgo(124), format, null),
            ).toBe('Active now')
        })
    })

    describe('minutes', () => {
        it('returns minutes label just past the active threshold', () => {
            expect(
                getLastSeenTooltipText(isoSecondsAgo(125), format, null),
            ).toBe('Last seen: 2 minutes ago')
        })

        it('returns correct floor when not a whole number of minutes', () => {
            expect(
                getLastSeenTooltipText(
                    isoSecondsAgo(5 * 60 + 59),
                    format,
                    null,
                ),
            ).toBe('Last seen: 5 minutes ago')
        })

        it('returns minutes label just before the 59-minute boundary', () => {
            expect(
                getLastSeenTooltipText(
                    isoSecondsAgo(58 * 60 + 59),
                    format,
                    null,
                ),
            ).toBe('Last seen: 58 minutes ago')
        })
    })

    describe('today', () => {
        it('returns "Today at ..." at exactly 59 minutes', () => {
            // FIXED_NOW is 12:00:00 UTC; 59 min ago = 11:01:00 UTC
            expect(
                getLastSeenTooltipText(isoSecondsAgo(59 * 60), format, null),
            ).toBe('Last seen: Today at 11:01 AM')
        })

        it('returns "Today at ..." for earlier the same day', () => {
            // 2 hours ago = 10:00:00 UTC
            expect(
                getLastSeenTooltipText(
                    isoSecondsAgo(2 * 60 * 60),
                    format,
                    null,
                ),
            ).toBe('Last seen: Today at 10:00 AM')
        })
    })

    describe('yesterday', () => {
        it('returns "Yesterday at ..." for 23 hours ago', () => {
            // 23 hours ago = 2024-01-14T13:00:00Z (different calendar day)
            expect(
                getLastSeenTooltipText(
                    isoSecondsAgo(23 * 60 * 60),
                    format,
                    null,
                ),
            ).toBe('Last seen: Yesterday at 1:00 PM')
        })

        it('returns "Yesterday at ..." for exactly 24 hours ago', () => {
            // 2024-01-14T12:00:00Z
            expect(
                getLastSeenTooltipText(
                    isoSecondsAgo(24 * 60 * 60),
                    format,
                    null,
                ),
            ).toBe('Last seen: Yesterday at 12:00 PM')
        })
    })

    describe('day name', () => {
        it('returns day name for 2 days ago', () => {
            // 2024-01-13 is Saturday
            expect(
                getLastSeenTooltipText(
                    isoSecondsAgo(2 * 24 * 60 * 60),
                    format,
                    null,
                ),
            ).toBe('Last seen: Saturday')
        })

        it('returns day name for 6 days ago', () => {
            // 2024-01-09 is Tuesday
            expect(
                getLastSeenTooltipText(
                    isoSecondsAgo(6 * 24 * 60 * 60),
                    format,
                    null,
                ),
            ).toBe('Last seen: Tuesday')
        })
    })

    describe('date', () => {
        it('returns date for 7 days ago', () => {
            // 2024-01-08
            expect(
                getLastSeenTooltipText(
                    isoSecondsAgo(7 * 24 * 60 * 60),
                    format,
                    null,
                ),
            ).toBe('Last seen: 01/08/2024')
        })

        it('returns date for much older timestamps', () => {
            expect(
                getLastSeenTooltipText(
                    '2021-09-28T12:00:00.000Z',
                    format,
                    null,
                ),
            ).toBe('Last seen: 09/28/2021')
        })
    })
})
