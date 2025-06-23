import { QueryClientProvider } from '@tanstack/react-query'

import * as timeSeriesHooks from 'hooks/reporting/timeSeries'
import { TicketMeasure } from 'models/reporting/cubes/TicketCube'
import { ReportingGranularity } from 'models/reporting/types'
import {
    BusiestTimeOfDaysMetrics,
    DayOfWeek,
} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {
    businessHourToNewTimeZone,
    changeBusinessHoursTimeZone,
    getAggregatedBusiestTimesOfDayData,
    getMetricQuery,
    getWorkingHours,
    getWorkingHoursInTimeZone,
    weekDayLabel,
} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import {
    AccountSettingBusinessHours,
    AccountSettingType,
} from 'state/currentAccount/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

const queryClient = mockQueryClient()

describe('getAggregatedBusiestTimesOfDayData', () => {
    it('should aggregateDataFromCube', () => {
        const sunday2pm = {
            dateTime: '2024-03-17T14:00:00.000',
            value: 23,
            label: TicketMeasure.TicketCount,
        }
        const mondayAfterMidnight = {
            dateTime: '2024-03-18T00:00:00.000',
            value: 78,
            label: TicketMeasure.TicketCount,
        }
        const monday2am = {
            dateTime: '2024-03-18T02:00:00.000',
            value: 23,
            label: TicketMeasure.TicketCount,
        }
        const tuesday1am = {
            dateTime: '2024-03-19T01:00:00.000',
            value: 33,
            label: TicketMeasure.TicketCount,
        }
        const tuesdayWeekLater1am = {
            dateTime: '2024-03-26T01:00:00.000',
            value: 23,
            label: TicketMeasure.TicketCount,
        }
        const wednesdayBeforeMidnight = {
            dateTime: '2024-03-20T23:00:00.000',
            value: 10,
            label: TicketMeasure.TicketCount,
        }
        const thursday11am = {
            dateTime: '2024-03-21T11:00:00.000',
            value: 25,
            label: TicketMeasure.TicketCount,
        }
        const friday12pm = {
            dateTime: '2024-03-22T12:00:00.000',
            value: 35,
            label: TicketMeasure.TicketCount,
        }
        const saturdayBefore4pm = {
            dateTime: '2024-03-23T16:00:00.000',
            value: 78,
            label: TicketMeasure.TicketCount,
        }

        const data = {
            data: [
                [
                    sunday2pm,
                    mondayAfterMidnight,
                    {
                        dateTime: '2024-03-18T01:00:00.000',
                        value: 30,
                        label: TicketMeasure.TicketCount,
                    },
                    monday2am,
                    tuesday1am,
                    tuesdayWeekLater1am,
                    wednesdayBeforeMidnight,
                    thursday11am,
                    friday12pm,
                    saturdayBefore4pm,
                ],
            ],
        }
        const timeZone = 'America/Los_Angeles'

        const aggregatedData = getAggregatedBusiestTimesOfDayData(
            data.data,
            timeZone,
        )

        expect(Object.keys(aggregatedData.btodData).length).toEqual(24)
        Object.keys(aggregatedData.btodData).forEach((hour) =>
            expect(
                Object.keys(aggregatedData.btodData[Number(hour)]).length,
            ).toEqual(Object.keys(DayOfWeek).length),
        )
        expect(aggregatedData.btodData[0]).toEqual(
            expect.objectContaining({
                [DayOfWeek.MONDAY]: mondayAfterMidnight.value,
            }),
        )
        expect(aggregatedData.btodData[2]).toEqual(
            expect.objectContaining({
                [DayOfWeek.MONDAY]: monday2am.value,
            }),
        )
        expect(aggregatedData.btodData[1]).toEqual(
            expect.objectContaining({
                [DayOfWeek.TUESDAY]:
                    tuesday1am.value + tuesdayWeekLater1am.value,
            }),
        )
        expect(aggregatedData.btodData[23]).toEqual(
            expect.objectContaining({
                [DayOfWeek.WEDNESDAY]: wednesdayBeforeMidnight.value,
            }),
        )
    })

    it('should return hook for each metric', () => {
        const useMessagesSentTimeSeriesSpy = jest.spyOn(
            timeSeriesHooks,
            'useMessagesSentTimeSeries',
        )
        const useMessagesReceivedTimeSeriesSpy = jest.spyOn(
            timeSeriesHooks,
            'useMessagesReceivedTimeSeries',
        )
        const useTicketsRepliedTimeSeriesSpy = jest.spyOn(
            timeSeriesHooks,
            'useTicketsRepliedTimeSeries',
        )
        const useTicketsClosedTimeSeriesSpy = jest.spyOn(
            timeSeriesHooks,
            'useTicketsClosedTimeSeries',
        )
        const useTicketsCreatedTimeSeriesSpy = jest.spyOn(
            timeSeriesHooks,
            'useTicketsCreatedTimeSeries',
        )
        const filters = {
            period: {
                end_datetime: 'string',
                start_datetime: 'string',
            },
        }

        Object.values(BusiestTimeOfDaysMetrics).forEach((metric) => {
            const query = getMetricQuery(metric)
            renderHook(() => query(filters, 'UTC', ReportingGranularity.Day), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })
        })

        expect(useMessagesSentTimeSeriesSpy).toHaveBeenCalled()
        expect(useMessagesReceivedTimeSeriesSpy).toHaveBeenCalled()
        expect(useTicketsRepliedTimeSeriesSpy).toHaveBeenCalled()
        expect(useTicketsClosedTimeSeriesSpy).toHaveBeenCalled()
        expect(useTicketsCreatedTimeSeriesSpy).toHaveBeenCalled()
    })
})

describe('weekdayLabel', () => {
    it('should return null when not a weekday', () => {
        expect(weekDayLabel(15)).toBeNull()
    })
})

const workingHours: AccountSettingBusinessHours = {
    id: 456,
    type: AccountSettingType.BusinessHours,
    data: {
        timezone: 'America/Phoenix',
        business_hours: [
            {
                days: '1,2,3,4,5',
                to_time: '03:00',
                from_time: '00:00',
            },
            {
                days: '1,2,3,4,5',
                to_time: '08:00',
                from_time: '04:00',
            },
            {
                days: '1,2,3,4,5',
                to_time: '19:00',
                from_time: '09:00',
            },
            {
                days: '1,2,3,4,5',
                to_time: '23:59',
                from_time: '20:00',
            },
            {
                days: '6,7',
                to_time: '23:59',
                from_time: '00:00',
            },
        ],
    },
}

describe('getWorkingHours', () => {
    it('should translate business hours to table mapping of working hours', () => {
        const hours = getWorkingHours(workingHours)

        expect(hours).toEqual(
            expect.objectContaining({
                '2': expect.objectContaining({
                    [DayOfWeek.WEDNESDAY]: 1,
                }),
            }),
        )
        expect(hours).toEqual(
            expect.objectContaining({
                '3': expect.objectContaining({
                    [DayOfWeek.WEDNESDAY]: 0,
                }),
            }),
        )
        expect(hours).toEqual(
            expect.objectContaining({
                '22': expect.objectContaining({
                    [DayOfWeek.SUNDAY]: 1,
                }),
            }),
        )
        expect(hours).toEqual(
            expect.objectContaining({
                '23': expect.objectContaining({
                    [DayOfWeek.SUNDAY]: 1,
                }),
            }),
        )
    })
})

describe('getWorkingHoursInTimeZone', () => {
    it('should return working hours after changing their time zone', () => {
        const newTimeZone = 'CET'
        const newWorkingHours = getWorkingHoursInTimeZone(
            workingHours,
            newTimeZone,
        )

        expect(newWorkingHours).toEqual(
            getWorkingHours({
                id: workingHours.id,
                type: workingHours.type,
                data: {
                    timezone: newTimeZone,
                    business_hours: changeBusinessHoursTimeZone(
                        workingHours.data.business_hours,
                        workingHours.data.timezone,
                        newTimeZone,
                    ),
                },
            }),
        )
    })
})

describe('changeBusinessHoursTimeZone', () => {
    it('should return Business Hours in different time zone', () => {
        const newTimeZone = 'Africa/Johannesburg'
        const newBusinessHours = changeBusinessHoursTimeZone(
            workingHours.data.business_hours,
            workingHours.data.timezone,
            newTimeZone,
        )

        expect(newBusinessHours).toEqual([
            {
                days: '1,2,3,4,5',
                from_time: '09:00',
                to_time: '12:00',
            },
            {
                days: '1,2,3,4,5',
                from_time: '13:00',
                to_time: '17:00',
            },
            {
                days: '1,2,3,4,5',
                from_time: '18:00',
                to_time: '23:59',
            },
            {
                days: '2,3,4,5,6',
                from_time: '00:00',
                to_time: '04:00',
            },
            {
                days: '2,3,4,5,6',
                from_time: '05:00',
                to_time: '08:59',
            },
            {
                days: '6,7',
                from_time: '09:00',
                to_time: '23:59',
            },
            {
                days: '7,1',
                from_time: '00:00',
                to_time: '08:59',
            },
        ])
    })
})

describe('businessHourToNewTimeZone', () => {
    const testCases: [
        {
            timeZone: string
            business_hour: {
                days: string
                from_time: string
                to_time: string
            }
        },
        {
            timeZone: string
            business_hours: {
                days: string
                from_time: string
                to_time: string
            }[]
        },
    ][] = [
        [
            {
                timeZone: 'US/Pacific',
                business_hour: {
                    days: '2',
                    from_time: '09:00',
                    to_time: '11:00',
                },
            },
            {
                timeZone: 'Australia/Sydney',
                business_hours: [
                    {
                        days: '3',
                        from_time: '02:00',
                        to_time: '04:00',
                    },
                ],
            },
        ],
        [
            {
                timeZone: 'US/Pacific',
                business_hour: {
                    days: '2',
                    from_time: '09:00',
                    to_time: '23:59',
                },
            },
            {
                timeZone: 'CET',
                business_hours: [
                    {
                        days: '2',
                        from_time: '18:00',
                        to_time: '23:59',
                    },
                    {
                        days: '3',
                        from_time: '00:00',
                        to_time: '08:59',
                    },
                ],
            },
        ],
        [
            {
                timeZone: 'US/Pacific',
                business_hour: {
                    days: '2',
                    from_time: '12:00',
                    to_time: '23:59',
                },
            },
            {
                timeZone: 'CET',
                business_hours: [
                    {
                        days: '2',
                        from_time: '21:00',
                        to_time: '23:59',
                    },
                    {
                        days: '3',
                        from_time: '00:00',
                        to_time: '08:59',
                    },
                ],
            },
        ],
        [
            {
                timeZone: 'EST',
                business_hour: {
                    days: '1,2,3,4,5',
                    from_time: '07:00',
                    to_time: '21:30',
                },
            },
            {
                timeZone: 'Australia/Sydney',
                business_hours: [
                    {
                        days: '1,2,3,4,5',
                        from_time: '22:00',
                        to_time: '23:59',
                    },
                    {
                        days: '2,3,4,5,6',
                        from_time: '00:00',
                        to_time: '12:30',
                    },
                ],
            },
        ],
        [
            {
                timeZone: 'Australia/Sydney',
                business_hour: {
                    days: '1,2,3,4,5',
                    from_time: '07:00',
                    to_time: '21:30',
                },
            },
            {
                timeZone: 'EST',
                business_hours: [
                    {
                        days: '7,1,2,3,4',
                        from_time: '16:00',
                        to_time: '23:59',
                    },
                    {
                        days: '1,2,3,4,5',
                        from_time: '00:00',
                        to_time: '06:30',
                    },
                ],
            },
        ],
    ]

    it.each(testCases)(
        'should change the Business Hour to new time zone',
        (from, to) => {
            const onMonday = new Date('2019-05-13T12:34:56.000Z')

            global.Date.now = jest.fn(
                () => onMonday,
            ) as unknown as typeof Date.now
            expect(
                businessHourToNewTimeZone(
                    from.business_hour,
                    from.timeZone,
                    to.timeZone,
                ),
            ).toEqual(to.business_hours)
            const onSunday = new Date('2019-05-19T12:34:56.000Z')

            global.Date.now = jest.fn(
                () => onSunday,
            ) as unknown as typeof Date.now
            expect(
                businessHourToNewTimeZone(
                    from.business_hour,
                    from.timeZone,
                    to.timeZone,
                ),
            ).toEqual(to.business_hours)
        },
    )
})
