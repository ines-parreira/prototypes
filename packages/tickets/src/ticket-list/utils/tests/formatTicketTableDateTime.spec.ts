import { DateFormatType, TimeFormatType } from '@repo/utils'
import moment from 'moment'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { formatTicketTableDateTime } from '../formatTicketTableDateTime'

describe('formatTicketTableDateTime', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-03-16T12:00:00Z'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('returns null when datetime is missing', () => {
        expect(
            formatTicketTableDateTime(null, {
                dateFormat: DateFormatType.en_US,
                timeFormat: TimeFormatType.AmPm,
                timezone: undefined,
            }),
        ).toBeNull()
    })

    it('formats today with time in the cell and date time in the tooltip', () => {
        expect(
            formatTicketTableDateTime('2026-03-16T08:15:00Z', {
                dateFormat: DateFormatType.en_US,
                timeFormat: TimeFormatType.AmPm,
                timezone: undefined,
            }),
        ).toEqual({
            cellLabel: 'Today at 8:15am',
            tooltipLabel: '03/16/2026 8:15am',
        })
    })

    it('formats yesterday with time in the cell', () => {
        expect(
            formatTicketTableDateTime('2026-03-15T23:15:00Z', {
                dateFormat: DateFormatType.en_US,
                timeFormat: TimeFormatType.AmPm,
                timezone: undefined,
            }),
        ).toEqual({
            cellLabel: 'Yesterday at 11:15pm',
            tooltipLabel: '03/15/2026 11:15pm',
        })
    })

    it('formats tomorrow with time in the cell', () => {
        expect(
            formatTicketTableDateTime('2026-03-17T08:15:00Z', {
                dateFormat: DateFormatType.en_US,
                timeFormat: TimeFormatType.AmPm,
                timezone: undefined,
            }),
        ).toEqual({
            cellLabel: 'Tomorrow at 8:15am',
            tooltipLabel: '03/17/2026 8:15am',
        })
    })

    it('formats weekday names for datetimes within the week', () => {
        expect(
            formatTicketTableDateTime('2026-03-13T08:15:00Z', {
                dateFormat: DateFormatType.en_US,
                timeFormat: TimeFormatType.AmPm,
                timezone: undefined,
            }),
        ).toEqual({
            cellLabel: 'Friday',
            tooltipLabel: '03/13/2026 8:15am',
        })
    })

    it('formats full dates for datetimes outside the week', () => {
        expect(
            formatTicketTableDateTime('2026-03-01T08:15:00Z', {
                dateFormat: DateFormatType.en_GB,
                timeFormat: TimeFormatType.AmPm,
                timezone: undefined,
            }),
        ).toEqual({
            cellLabel: '01/03/2026',
            tooltipLabel: '01/03/2026 8:15am',
        })
    })

    it('applies timezone and 24 hour formatting', () => {
        expect(
            formatTicketTableDateTime(
                '2026-03-16T00:15:00Z',
                {
                    dateFormat: DateFormatType.en_GB,
                    timeFormat: TimeFormatType.TwentyFourHour,
                    timezone: 'America/Los_Angeles',
                },
                moment.utc('2026-03-16T12:00:00Z'),
            ),
        ).toEqual({
            cellLabel: 'Yesterday at 17:15',
            tooltipLabel: '15/03/2026 17:15',
        })
    })
})
