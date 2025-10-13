import {
    mockBusinessHoursConfig,
    mockBusinessHoursCreate,
    mockBusinessHoursUpdate,
} from '@gorgias/helpdesk-mocks'
import { BusinessHoursDetails } from '@gorgias/helpdesk-types'

import { DEFAULT_BUSINESS_HOURS_SCHEDULE } from '../constants'
import {
    convertToAmPm,
    getCreateBusinessHoursFormDefaultValues,
    getCreateCustomBusinessHoursPayloadFromValues,
    getEditCustomBusinessHoursDefaultValues,
    getIntegrationsChangeSummary,
    getUpdateBusinessHoursPayloadFromValues,
    is24_7Schedule,
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

    describe('getEditCustomBusinessHoursDefaultValues', () => {
        it('returns correct default values when assigned_integrations is an array', () => {
            const initialData = {
                assigned_integrations: [1, 2, 3],
            }

            const result = getEditCustomBusinessHoursDefaultValues(
                initialData as BusinessHoursDetails,
            )

            expect(result).toEqual({
                // saves original state in previous_assigned_integrations
                previous_assigned_integrations: [1, 2, 3],
                assigned_integrations: {
                    // populates assign_integrations with the original state
                    assign_integrations: [1, 2, 3],
                    unassign_integrations: [],
                },
                temporary_assigned_integrations: [],
            })
        })

        it('returns correct default values when assigned_integrations is not defined', () => {
            const initialData = {
                assigned_integrations: undefined,
            }

            const result = getEditCustomBusinessHoursDefaultValues(
                initialData as BusinessHoursDetails,
            )

            expect(result).toEqual({
                previous_assigned_integrations: [],
                assigned_integrations: {
                    assign_integrations: [],
                    unassign_integrations: [],
                },
                temporary_assigned_integrations: [],
            })
        })
    })

    describe('getIntegrationsChangeSummary', () => {
        it('returns correct summary when there are no new integrations', () => {
            const result = getIntegrationsChangeSummary([1, 2, 3], [1, 2, 3])

            expect(result).toEqual({
                newIntegrations: [],
                removedIntegrations: [],
            })
        })

        it('returns correct summary when there are added and removed integrations', () => {
            const result = getIntegrationsChangeSummary([1, 2, 3, 4], [1, 2, 5])

            expect(result).toEqual({
                newIntegrations: [5],
                removedIntegrations: [3, 4],
            })
        })
    })

    describe('getUpdateBusinessHoursPayloadFromValues', () => {
        it('removes temporary_assigned_integrations and previous_assigned_integrations and populates assign_integrations and unassign_integrations correctly', () => {
            const mockedBusinessHoursUpdate = mockBusinessHoursUpdate()

            const result = getUpdateBusinessHoursPayloadFromValues({
                ...mockedBusinessHoursUpdate,
                assigned_integrations: {
                    assign_integrations: [1, 2, 3],
                    unassign_integrations: [4, 5, 6],
                },
                previous_assigned_integrations: [3, 4, 5, 6],
                temporary_assigned_integrations: [1],
                overrideConfirmation: true,
            })

            expect(result).toEqual({
                ...mockedBusinessHoursUpdate,
                assigned_integrations: {
                    assign_integrations: [1, 2],
                    unassign_integrations: [4, 5, 6],
                },
            })
        })
    })

    describe('getCreateCustomBusinessHoursPayloadFromValues', () => {
        it('removes overrideConfirmation from the payload', () => {
            const mockedBusinessHoursCreate = mockBusinessHoursCreate()
            const result = getCreateCustomBusinessHoursPayloadFromValues({
                ...mockedBusinessHoursCreate,
                assigned_integrations: {
                    assign_integrations: [1, 2, 3],
                },
                overrideConfirmation: true,
            })

            expect(result).toEqual({
                ...mockedBusinessHoursCreate,
                assigned_integrations: {
                    assign_integrations: [1, 2, 3],
                },
            })
        })
    })

    describe('is24_7Schedule', () => {
        it('returns true for a 24/7 schedule', () => {
            const schedule = mockBusinessHoursConfig({
                business_hours: [
                    {
                        days: '1,2,3,4,5,6,7',
                        from_time: '00:00',
                        to_time: '00:00',
                    },
                ],
            })
            expect(is24_7Schedule(schedule)).toBe(true)
        })

        it('returns false for a non-24/7 schedule', () => {
            const schedule = mockBusinessHoursConfig({
                business_hours: [
                    {
                        days: '1,2,3,4,5',
                        from_time: '00:00',
                        to_time: '00:00',
                    },
                ],
            })
            expect(is24_7Schedule(schedule)).toBe(false)
        })

        it('returns false for an empty schedule', () => {
            const schedule = mockBusinessHoursConfig({
                business_hours: [],
            })
            expect(is24_7Schedule(schedule)).toBe(false)
        })
    })
})
