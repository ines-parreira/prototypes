import {renderHook} from '@testing-library/react-hooks'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {ReportingGranularity} from 'models/reporting/types'
import {
    BusiestTimeOfDaysMetrics,
    DayOfWeek,
} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {
    getAggregatedBusiestTimesOfDayData,
    getMetricQuery,
    getWorkingHours,
    weekDayLabel,
} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import * as timeSeriesHooks from 'hooks/reporting/timeSeries'
import {
    AccountSettingBusinessHours,
    AccountSettingType,
} from 'state/currentAccount/types'

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
            timeZone
        )

        expect(Object.keys(aggregatedData.btodData).length).toEqual(24)
        Object.keys(aggregatedData.btodData).forEach((hour) =>
            expect(
                Object.keys(aggregatedData.btodData[Number(hour)]).length
            ).toEqual(Object.keys(DayOfWeek).length)
        )
        expect(aggregatedData.btodData[0]).toEqual(
            expect.objectContaining({
                [DayOfWeek.MONDAY]: mondayAfterMidnight.value,
            })
        )
        expect(aggregatedData.btodData[2]).toEqual(
            expect.objectContaining({
                [DayOfWeek.MONDAY]: monday2am.value,
            })
        )
        expect(aggregatedData.btodData[1]).toEqual(
            expect.objectContaining({
                [DayOfWeek.TUESDAY]:
                    tuesday1am.value + tuesdayWeekLater1am.value,
            })
        )
        expect(aggregatedData.btodData[23]).toEqual(
            expect.objectContaining({
                [DayOfWeek.WEDNESDAY]: wednesdayBeforeMidnight.value,
            })
        )
    })

    it('should return hook for each metric', () => {
        const useMessagesSentTimeSeriesSpy = jest.spyOn(
            timeSeriesHooks,
            'useMessagesSentTimeSeries'
        )
        const useTicketsRepliedTimeSeriesSpy = jest.spyOn(
            timeSeriesHooks,
            'useTicketsRepliedTimeSeries'
        )
        const useTicketsClosedTimeSeriesSpy = jest.spyOn(
            timeSeriesHooks,
            'useTicketsClosedTimeSeries'
        )
        const useTicketsCreatedTimeSeriesSpy = jest.spyOn(
            timeSeriesHooks,
            'useTicketsCreatedTimeSeries'
        )
        const filters = {
            period: {
                end_datetime: 'string',
                start_datetime: 'string',
            },
        }

        Object.values(BusiestTimeOfDaysMetrics).forEach((metric) => {
            const query = getMetricQuery(metric)
            renderHook(() => query(filters, 'UTC', ReportingGranularity.Day))
        })

        expect(useMessagesSentTimeSeriesSpy).toHaveBeenCalled()
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

describe('getWorkingHours', () => {
    it('should translate business hours to table mapping of working hours', () => {
        const workingHours: AccountSettingBusinessHours = {
            id: 456,
            type: AccountSettingType.BusinessHours,
            data: {
                timezone: 'US/Pacific',
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

        const hours = getWorkingHours(workingHours)

        expect(hours).toEqual(
            expect.objectContaining({
                '2': expect.objectContaining({
                    [DayOfWeek.WEDNESDAY]: 1,
                }),
            })
        )
        expect(hours).toEqual(
            expect.objectContaining({
                '3': expect.objectContaining({
                    [DayOfWeek.WEDNESDAY]: 0,
                }),
            })
        )
        expect(hours).toEqual(
            expect.objectContaining({
                '22': expect.objectContaining({
                    [DayOfWeek.SUNDAY]: 1,
                }),
            })
        )
        expect(hours).toEqual(
            expect.objectContaining({
                '23': expect.objectContaining({
                    [DayOfWeek.SUNDAY]: 1,
                }),
            })
        )
    })
})
