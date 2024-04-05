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
    weekDayLabel,
} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import * as timeSeriesHooks from 'hooks/reporting/timeSeries'

describe('getAggregatedBusiestTimesOfDayData', () => {
    it('should aggregateDataFromCube', () => {
        const monday2pm = {
            dateTime: '2024-03-17T14:00:00.000',
            value: 23,
            label: TicketMeasure.TicketCount,
        }
        const tuesday2am = {
            dateTime: '2024-03-18T02:00:00.000',
            value: 23,
            label: TicketMeasure.TicketCount,
        }
        const wednesday1am = {
            dateTime: '2024-03-19T01:00:00.000',
            value: 33,
            label: TicketMeasure.TicketCount,
        }
        const wednesdayWeekLater1am = {
            dateTime: '2024-03-26T01:00:00.000',
            value: 23,
            label: TicketMeasure.TicketCount,
        }
        const thursdayBeforeMidnight = {
            dateTime: '2024-03-20T23:00:00.000',
            value: 10,
            label: TicketMeasure.TicketCount,
        }
        const friday11am = {
            dateTime: '2024-03-21T11:00:00.000',
            value: 25,
            label: TicketMeasure.TicketCount,
        }
        const saturday12pm = {
            dateTime: '2024-03-22T12:00:00.000',
            value: 35,
            label: TicketMeasure.TicketCount,
        }
        const sundayBefore4pm = {
            dateTime: '2024-03-23T16:00:00.000',
            value: 78,
            label: TicketMeasure.TicketCount,
        }

        const data = {
            data: [
                [
                    monday2pm,
                    {
                        dateTime: '2024-03-18T00:00:00.000',
                        value: 17,
                        label: TicketMeasure.TicketCount,
                    },
                    {
                        dateTime: '2024-03-18T01:00:00.000',
                        value: 30,
                        label: TicketMeasure.TicketCount,
                    },
                    tuesday2am,
                    wednesday1am,
                    wednesdayWeekLater1am,
                    thursdayBeforeMidnight,
                    friday11am,
                    saturday12pm,
                    sundayBefore4pm,
                ],
            ],
        }

        const aggregatedData = getAggregatedBusiestTimesOfDayData(data.data)

        expect(Object.keys(aggregatedData.btodData).length).toEqual(24)
        Object.keys(aggregatedData.btodData).forEach((hour) =>
            expect(
                Object.keys(aggregatedData.btodData[Number(hour)]).length
            ).toEqual(Object.keys(DayOfWeek).length)
        )
        expect(
            getAggregatedBusiestTimesOfDayData(data.data).btodData[2]
        ).toEqual(
            expect.objectContaining({
                [DayOfWeek.TUESDAY]: tuesday2am.value,
            })
        )
        expect(
            getAggregatedBusiestTimesOfDayData(data.data).btodData[1]
        ).toEqual(
            expect.objectContaining({
                [DayOfWeek.WEDNESDAY]:
                    wednesday1am.value + wednesdayWeekLater1am.value,
            })
        )
        expect(
            getAggregatedBusiestTimesOfDayData(data.data).btodData[23]
        ).toEqual(
            expect.objectContaining({
                [DayOfWeek.THURSDAY]: thursdayBeforeMidnight.value,
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
