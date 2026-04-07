import { DateFormatType, TimeFormatType } from '@repo/utils'
import { describe, expect, it } from 'vitest'

import { formatOrderDate } from '../formatOrderDate'

describe('formatOrderDate', () => {
    const now = new Date('2024-06-15T12:00:00Z')

    describe('when less than 60 minutes ago', () => {
        it.each([
            ['2024-06-15T11:59:00Z', '1m ago'],
            ['2024-06-15T11:30:00Z', '30m ago'],
            ['2024-06-15T11:01:00Z', '59m ago'],
            ['2024-06-15T12:00:00Z', '0m ago'],
        ])(
            'should return minutes format for %s',
            (createdDatetime, expected) => {
                expect(
                    formatOrderDate(
                        createdDatetime,
                        undefined,
                        undefined,
                        undefined,
                        now,
                    ),
                ).toBe(expected)
            },
        )
    })

    describe('when less than 24 hours ago', () => {
        it.each([
            ['2024-06-15T11:00:00Z', '1hr ago'],
            ['2024-06-15T06:00:00Z', '6hr ago'],
            ['2024-06-14T13:00:00Z', '23hr ago'],
        ])('should return hours format for %s', (createdDatetime, expected) => {
            expect(
                formatOrderDate(
                    createdDatetime,
                    undefined,
                    undefined,
                    undefined,
                    now,
                ),
            ).toBe(expected)
        })
    })

    describe('when less than 7 days ago', () => {
        it.each([
            ['2024-06-14T12:00:00Z', '1 day ago'],
            ['2024-06-13T12:00:00Z', '2 days ago'],
            ['2024-06-09T12:00:00Z', '6 days ago'],
        ])('should return days format for %s', (createdDatetime, expected) => {
            expect(
                formatOrderDate(
                    createdDatetime,
                    undefined,
                    undefined,
                    undefined,
                    now,
                ),
            ).toBe(expected)
        })
    })

    describe('when 7 or more days ago', () => {
        it('should return compact date with timezone when preferences and timezone are provided', () => {
            expect(
                formatOrderDate(
                    '2024-06-08T12:00:00Z',
                    DateFormatType.en_US,
                    TimeFormatType.TwentyFourHour,
                    'America/New_York',
                    now,
                ),
            ).toBe('06/08/2024')
        })

        it('should return compact date in en_GB format with timezone', () => {
            expect(
                formatOrderDate(
                    '2024-06-08T12:00:00Z',
                    DateFormatType.en_GB,
                    TimeFormatType.TwentyFourHour,
                    'Europe/London',
                    now,
                ),
            ).toBe('08/06/2024')
        })

        it('should return short date with year (month name) when preferences are provided but no timezone', () => {
            expect(
                formatOrderDate(
                    '2024-06-08T12:00:00Z',
                    DateFormatType.en_US,
                    TimeFormatType.TwentyFourHour,
                    undefined,
                    now,
                ),
            ).toBe('Jun 8, 2024')
        })

        it('should return short date with year in en_GB format without timezone', () => {
            expect(
                formatOrderDate(
                    '2024-06-08T12:00:00Z',
                    DateFormatType.en_GB,
                    TimeFormatType.TwentyFourHour,
                    undefined,
                    now,
                ),
            ).toBe('8 Jun, 2024')
        })

        it('should return month-name fallback when no preferences are provided', () => {
            expect(
                formatOrderDate(
                    '2024-06-08T12:00:00Z',
                    undefined,
                    undefined,
                    undefined,
                    now,
                ),
            ).toBe('Jun 8, 2024')
            expect(
                formatOrderDate(
                    '2024-01-01T00:00:00Z',
                    undefined,
                    undefined,
                    undefined,
                    now,
                ),
            ).toBe('Jan 1, 2024')
            expect(
                formatOrderDate(
                    '2023-12-25T10:00:00Z',
                    undefined,
                    undefined,
                    undefined,
                    now,
                ),
            ).toBe('Dec 25, 2023')
        })
    })

    it('should use current date when now parameter is not provided', () => {
        const recentDate = new Date(Date.now() - 5 * 60 * 1000).toISOString()
        const result = formatOrderDate(recentDate)
        expect(result).toMatch(/^\d+m ago$/)
    })
})
