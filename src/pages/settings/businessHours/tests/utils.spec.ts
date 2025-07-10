import { DEFAULT_BUSINESS_HOURS_SCHEDULE } from '../constants'
import {
    convertToAmPm,
    getCreateBusinessHoursFormDefaultValues,
} from '../utils'

describe('utils', () => {
    describe('convertToAmPm', () => {
        it.each([
            ['00:00', '12:00 AM'],
            ['01:00', '1:00 AM'],
            ['12:00', '12:00 PM'],
            ['13:00', '1:00 PM'],
            ['23:00', '11:00 PM'],
            ['24:00', '12:00 AM'],
            ['22:15', '10:15 PM'],
            ['10:15', '10:15 AM'],
        ])('should convert %s to %s', (input, expected) => {
            expect(convertToAmPm(input)).toBe(expected)
        })
    })

    describe('getCreateBusinessHoursFormDefaultValues', () => {
        it('returns default values with UTC timezone when no timezone is provided', () => {
            const result = getCreateBusinessHoursFormDefaultValues()

            expect(result).toEqual({
                name: '',
                business_hours_config: {
                    business_hours: [DEFAULT_BUSINESS_HOURS_SCHEDULE],
                    timezone: 'UTC',
                },
                assigned_integrations: {
                    assign_integrations: [],
                },
            })
        })

        it('returns default values with custom timezone when provided', () => {
            const customTimezone = 'America/New_York'
            const result =
                getCreateBusinessHoursFormDefaultValues(customTimezone)

            expect(result).toEqual({
                name: '',
                business_hours_config: {
                    business_hours: [DEFAULT_BUSINESS_HOURS_SCHEDULE],
                    timezone: customTimezone,
                },
                assigned_integrations: {
                    assign_integrations: [],
                },
            })
        })
    })
})
