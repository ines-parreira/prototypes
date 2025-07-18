import {
    BusinessHoursConfig,
    BusinessHoursTimeframe,
} from '@gorgias/helpdesk-types'

import { TimeFormatType } from 'constants/datetime'
import useAppSelector from 'hooks/useAppSelector'
import { renderHook } from 'utils/testing/renderHook'

import { useBusinessHours } from '../useBusinessHours'

jest.mock('hooks/useAppSelector')

const useAppSelectorMock = useAppSelector as jest.Mock

describe('useBusinessHours', () => {
    const sampleBusinessHoursTimeframe: BusinessHoursTimeframe = {
        days: '1,2,3,4,5',
        from_time: '09:00',
        to_time: '17:00',
    }
    const sampleBusinessHoursConfig: BusinessHoursConfig = {
        business_hours: [sampleBusinessHoursTimeframe],
        timezone: 'Europe/Rome',
    }

    describe('getBusinessHoursConfigLabel', () => {
        beforeEach(() => {
            useAppSelectorMock.mockReturnValue(TimeFormatType.TwentyFourHour)
        })

        it('should return "24/7" when business hours timeframes are empty', () => {
            const { result } = renderHook(() => useBusinessHours())

            const emptyConfig: BusinessHoursConfig = {
                business_hours: [],
                timezone: 'Europe/Rome',
            }

            const label =
                result.current.getBusinessHoursConfigLabel(emptyConfig)

            expect(label).toBe('24/7')
        })

        it('should format single business hours timeframe with 24-hour format', () => {
            useAppSelectorMock.mockReturnValue(TimeFormatType.TwentyFourHour)

            const { result } = renderHook(() => useBusinessHours())

            const label = result.current.getBusinessHoursConfigLabel(
                sampleBusinessHoursConfig,
            )

            expect(label).toBe('Mon-Fri, 09:00-17:00')
        })

        it('should format single business hours timeframe with 24-hour format', () => {
            useAppSelectorMock.mockReturnValue(TimeFormatType.AmPm)

            const { result } = renderHook(() => useBusinessHours())

            const label = result.current.getBusinessHoursConfigLabel(
                sampleBusinessHoursConfig,
            )

            expect(label).toBe('Mon-Fri, 9:00 AM-5:00 PM')
        })

        it.each([
            { days: '1', daysLabel: 'Monday' },
            { days: '2', daysLabel: 'Tuesday' },
            { days: '3', daysLabel: 'Wednesday' },
            { days: '4', daysLabel: 'Thursday' },
            { days: '5', daysLabel: 'Friday' },
            { days: '6', daysLabel: 'Saturday' },
            { days: '7', daysLabel: 'Sunday' },
            { days: '1,2,3,4,5', daysLabel: 'Mon-Fri' },
            { days: '6,7', daysLabel: 'Weekend' },
            { days: '1,2,3,4,5,6,7', daysLabel: 'Everyday' },
        ])('should return correct days labels', ({ days, daysLabel }) => {
            const { result } = renderHook(() => useBusinessHours())

            const label = result.current.getBusinessHoursConfigLabel({
                business_hours: [
                    { days: days, from_time: '09:00', to_time: '17:00' },
                ],
                timezone: 'Europe/Rome',
            })

            expect(label).toBe(`${daysLabel}, 09:00-17:00`)
        })

        it('should return only time range when days is not found', () => {
            const { result } = renderHook(() => useBusinessHours())

            const label = result.current.getBusinessHoursConfigLabel({
                business_hours: [
                    {
                        days: '999', // Invalid day
                        from_time: '09:00',
                        to_time: '17:00',
                    },
                ],
                timezone: 'Europe/Rome',
            })

            expect(label).toBe('09:00-17:00')
        })

        it('should handle multiple timeframes', () => {
            const { result } = renderHook(() => useBusinessHours())

            const label = result.current.getBusinessHoursConfigLabel({
                business_hours: [
                    {
                        days: '1,2,3,4,5',
                        from_time: '09:00',
                        to_time: '17:00',
                    },
                    {
                        days: '6,7',
                        from_time: '11:00',
                        to_time: '16:00',
                    },
                ],
                timezone: 'Europe/Rome',
            })

            expect(label).toBe('Mon-Fri, 09:00-17:00 | Weekend, 11:00-16:00')
        })

        it('should show timezone as well', () => {
            useAppSelectorMock.mockReturnValue(TimeFormatType.TwentyFourHour)

            const { result } = renderHook(() => useBusinessHours())

            const label = result.current.getBusinessHoursConfigLabel(
                sampleBusinessHoursConfig,
                true,
            )

            expect(label).toBe('Mon-Fri, 09:00-17:00, Europe/Rome')
        })
    })
})
