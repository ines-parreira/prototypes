import { assumeMock, renderHook } from '@repo/testing'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    fetchMessagesReceivedTimeSeries,
    fetchMessagesSentTimeSeries,
    fetchTicketsClosedTimeSeries,
    fetchTicketsCreatedTimeSeries,
    fetchTicketsRepliedTimeSeries,
} from 'domains/reporting/hooks/timeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { BusiestTimeOfDaysMetrics } from 'domains/reporting/pages/support-performance/busiest-times-of-days/types'
import {
    getAggregatedBusiestTimesOfDayData,
    hourFromHourIndex,
} from 'domains/reporting/pages/support-performance/busiest-times-of-days/utils'
import {
    BTOD_REPORT_FILENAME,
    createReport,
    fetchAggregatedBusiestTimesOfDayReportData,
    useAggregatedBusiestTimesOfDayReportData,
} from 'domains/reporting/services/busiestTimesOfDaysReportingService'
import * as files from 'utils/file'
import { createCsv } from 'utils/file'

jest.mock('utils/file')
jest.mock('domains/reporting/hooks/timeSeries')
const fetchTicketsClosedTimeSeriesMock = assumeMock(
    fetchTicketsClosedTimeSeries,
)
const fetchMessagesSentTimeSeriesMock = assumeMock(fetchMessagesSentTimeSeries)
const fetchMessagesReceivedTimeSeriesMock = assumeMock(
    fetchMessagesReceivedTimeSeries,
)
const fetchTicketsRepliedTimeSeriesMock = assumeMock(
    fetchTicketsRepliedTimeSeries,
)
const fetchTicketsCreatedTimeSeriesMock = assumeMock(
    fetchTicketsCreatedTimeSeries,
)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useNewStatsFiltersMock = assumeMock(useStatsFilters)

describe('busiestTimesOfDaysReportingService', () => {
    const timeZone = 'America/Los_Angeles'
    const period = {
        start_datetime: '2023-08-01',
        end_datetime: '2023-08-31',
    }
    const statsFilters = {
        period,
    }
    const fileName = getCsvFileNameWithDates(period, BTOD_REPORT_FILENAME)
    const expectedResultFromEmptyData = [
        [
            'HOUR',
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
            'SATURDAY',
            'SUNDAY',
        ],
        [hourFromHourIndex(0), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(1), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(2), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(3), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(4), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(5), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(6), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(7), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(8), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(9), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(10), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(11), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(12), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(13), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(14), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(15), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(16), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(17), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(18), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(19), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(20), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(21), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(22), 0, 0, 0, 0, 0, 0, 0],
        [hourFromHourIndex(23), 0, 0, 0, 0, 0, 0, 0],
    ]
    describe('createReport', () => {
        const { btodData } = getAggregatedBusiestTimesOfDayData([[]], timeZone)

        it('should render the report', () => {
            const createCsvMock = jest.spyOn(files, 'createCsv')

            createReport(btodData, period)

            expect(createCsvMock).toHaveBeenCalledWith(
                expectedResultFromEmptyData,
            )
        })
    })

    describe('useAggregatedBusiestTimesOfDayReportData', () => {
        beforeEach(() => {
            useNewStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: statsFilters,
                userTimezone: timeZone,
                granularity: ReportingGranularity.Day,
            })
        })

        it('should fetch and format report data', () => {
            const hook = jest.fn().mockReturnValue({
                data: [[]],
                isFetching: false,
            })
            const { result } = renderHook(() =>
                useAggregatedBusiestTimesOfDayReportData(hook),
            )

            expect(result.current).toEqual({
                files: {
                    [fileName]: createCsv(expectedResultFromEmptyData),
                },
                fileName,
                isLoading: false,
            })
        })
    })

    describe('fetchAggregatedBusiestTimesOfDayReportData', () => {
        beforeEach(() => {
            fetchTicketsClosedTimeSeriesMock.mockResolvedValue([[]])
            fetchMessagesSentTimeSeriesMock.mockResolvedValue([[]])
            fetchMessagesReceivedTimeSeriesMock.mockResolvedValue([[]])
            fetchTicketsRepliedTimeSeriesMock.mockResolvedValue([[]])
            fetchTicketsCreatedTimeSeriesMock.mockResolvedValue([[]])
        })

        it.each([
            BusiestTimeOfDaysMetrics.TicketsClosed,
            BusiestTimeOfDaysMetrics.TicketsCreated,
            BusiestTimeOfDaysMetrics.MessagesSent,
            BusiestTimeOfDaysMetrics.MessagesReceived,
            BusiestTimeOfDaysMetrics.TicketsReplied,
        ])('should fetch and format report data', async (btodMetric) => {
            const context = {
                selectedBTODMetric: btodMetric,
            }
            const report = await fetchAggregatedBusiestTimesOfDayReportData(
                statsFilters,
                timeZone,
                ReportingGranularity.Day,
                context,
            )

            expect(report).toEqual({
                files: {
                    [fileName]: createCsv(expectedResultFromEmptyData),
                },
                fileName,
                isLoading: false,
            })
        })

        it('should return empty on error', async () => {
            fetchTicketsClosedTimeSeriesMock.mockRejectedValue({})
            const context = {
                selectedBTODMetric: BusiestTimeOfDaysMetrics.TicketsClosed,
            }
            const report = await fetchAggregatedBusiestTimesOfDayReportData(
                statsFilters,
                timeZone,
                ReportingGranularity.Day,
                context,
            )

            expect(report).toEqual({
                files: {},
                fileName: '',
                isLoading: false,
                isError: true,
            })
        })
    })
})
