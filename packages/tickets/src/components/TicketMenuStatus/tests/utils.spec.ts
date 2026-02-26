import { CalendarDate } from '@internationalized/date'
import moment from 'moment'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Ticket } from '@gorgias/helpdesk-types'

import {
    disableDatesBeforeToday,
    getClosedDateTitle,
    getRemainingSnoozeTime,
    getSnoozeTooltipTitle,
    getTicketStatus,
    TicketStatus,
} from '../utils'

const FIXED_NOW = new Date(2026, 0, 15, 12, 0, 0)

describe('getTicketStatus', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })
    it.each([
        {
            snooze_datetime: moment().add(1, 'hour').toISOString(),
            status: 'open',
            expected: TicketStatus.Snoozed,
            description: 'future snooze_datetime',
        },
        {
            snooze_datetime: moment().subtract(1, 'hour').toISOString(),
            status: 'closed',
            expected: 'closed',
            description: 'past snooze_datetime',
        },
        {
            snooze_datetime: null,
            status: 'closed',
            expected: 'closed',
            description: 'null snooze_datetime',
        },
        {
            snooze_datetime: null,
            status: undefined,
            expected: TicketStatus.Open,
            description: 'no status',
        },
    ])(
        'should return $expected when ticket has $description',
        ({ snooze_datetime, status, expected }) => {
            const ticket = { snooze_datetime, status } as Ticket
            expect(getTicketStatus(ticket)).toBe(expected)
        },
    )
})

describe('getRemainingSnoozeTime', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should return empty string when snoozeDateTime is null', () => {
        expect(getRemainingSnoozeTime(null)).toBe('')
    })

    it('should return "Not snoozed" when snooze time is in the past', () => {
        expect(
            getRemainingSnoozeTime(moment().subtract(1, 'hour').toISOString()),
        ).toBe('Not snoozed')
    })

    it.each([
        {
            minutes: 30,
            hours: 0,
            days: 0,
            expected: '30m',
            description: 'minutes only',
        },
        {
            minutes: 15,
            hours: 5,
            days: 0,
            expected: '5hr 15m',
            description: 'hours and minutes (plural)',
        },
        {
            minutes: 30,
            hours: 1,
            days: 0,
            expected: '1hr 30m',
            description: 'hours and minutes (singular)',
        },
        {
            minutes: 0,
            hours: 3,
            days: 2,
            expected: '2d 3hr',
            description: 'days and hours (plural)',
        },
        {
            minutes: 0,
            hours: 2,
            days: 1,
            expected: '1d 2hr',
            description: 'days and hours (singular day)',
        },
        {
            minutes: 0,
            hours: 1,
            days: 1,
            expected: '1d 1hr',
            description: 'days and hours (both singular)',
        },
    ])(
        'should return "$expected" for $description',
        ({ minutes, hours, days, expected }) => {
            const date = moment()
                .add(days, 'days')
                .add(hours, 'hours')
                .add(minutes, 'minutes')
                .toISOString()
            expect(getRemainingSnoozeTime(date)).toBe(expected)
        },
    )
})

describe('getSnoozeTooltipTitle', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(FIXED_NOW)
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should return empty string when snoozeDateTime is null', () => {
        expect(getSnoozeTooltipTitle(null)).toBe('')
    })

    it('should return "Not snoozed" when snooze time is in the past', () => {
        expect(
            getSnoozeTooltipTitle(moment().subtract(1, 'hour').toISOString()),
        ).toBe('Not snoozed')
    })

    it.each([
        {
            getDate: () => moment().add(2, 'hours'),
            pattern: /^Snoozed until today at \d{1,2}:\d{2}(AM|PM)$/,
            description: 'today',
        },
        {
            getDate: () => moment().add(1, 'day'),
            pattern: /^Snoozed until tomorrow at \d{1,2}:\d{2}(AM|PM)$/,
            description: 'tomorrow',
        },
        {
            getDate: () => moment().add(3, 'days'),
            pattern:
                /^Snoozed until [A-Za-z]{3} \d{1,2} at \d{1,2}:\d{2}(AM|PM)$/,
            description: 'future date',
        },
    ])(
        'should return correct format when snoozed until $description',
        ({ getDate, pattern }) => {
            expect(getSnoozeTooltipTitle(getDate().toISOString())).toMatch(
                pattern,
            )
        },
    )
})

describe('getClosedDateTitle', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(FIXED_NOW)
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should return empty string when closedDateTime is null', () => {
        expect(getClosedDateTitle(null)).toBe('')
    })

    it.each([
        {
            getDate: () => moment().subtract(2, 'hours'),
            pattern: /^Closed today at \d{1,2}:\d{2}(AM|PM)$/,
            description: 'today',
        },
        {
            getDate: () => moment().subtract(1, 'day'),
            pattern: /^Closed yesterday at \d{1,2}:\d{2}(AM|PM)$/,
            description: 'yesterday',
        },
        {
            getDate: () => moment().subtract(3, 'days'),
            pattern: /^Closed 3 days ago at \d{1,2}:\d{2}(AM|PM)$/,
            description: 'within 7 days (plural)',
        },
        {
            getDate: () => moment().subtract(10, 'days'),
            pattern: /^Closed on [A-Za-z]{3} \d{1,2} at \d{1,2}:\d{2}(AM|PM)$/,
            description: 'more than 7 days ago',
        },
    ])(
        'should return correct format when closed $description',
        ({ getDate, pattern }) => {
            expect(getClosedDateTitle(getDate().toISOString())).toMatch(pattern)
        },
    )
})

describe('disableDatesBeforeToday', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it.each([
        { offset: -1, expected: true, description: 'yesterday' },
        { offset: 0, expected: false, description: 'today' },
        { offset: 1, expected: false, description: 'tomorrow' },
    ])('should return $expected for $description', ({ offset, expected }) => {
        const date = moment().add(offset, 'day')
        const calendarDate = new CalendarDate(
            date.year(),
            date.month() + 1,
            date.date(),
        )
        expect(disableDatesBeforeToday(calendarDate)).toBe(expected)
    })
})
