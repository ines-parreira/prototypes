import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'

import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'

import {
    fetchCustomFieldsTicketCountTimeSeries,
    useCustomFieldsTicketCountTimeSeries,
} from 'hooks/reporting/timeSeries'
import {
    getPeriodDateTimes,
    TimeSeriesDataItem,
} from 'hooks/reporting/useTimeSeries'
import {OrderDirection} from 'models/api/types'
import {ReportingGranularity} from 'models/reporting/types'
import {BusiestTimeOfDaysMetrics} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {formatDates} from 'pages/stats/utils'
import {
    fetchCustomFieldsReportData,
    formatData,
    LEVEL_LABELS,
    TICKET_FIELDS_DOWNLOAD_FILE_NAME,
    useCustomFieldsReportData,
} from 'services/reporting/ticketFieldsReportingService'
import * as files from 'utils/file'
import {getFilterDateRange} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/timeSeries')
const useCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    useCustomFieldsTicketCountTimeSeries
)
const fetchCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    fetchCustomFieldsTicketCountTimeSeries
)
jest.mock('utils/file')

describe('ticketFieldsReportingService', () => {
    const dateSeries: Parameters<typeof formatData>[1] = ['2023-06-07']
    const data: Parameters<typeof formatData>[0] = {
        'Level1::Level2': [
            [
                {
                    dateTime: dateSeries[0],
                    value: 10,
                },
            ],
        ],
    }

    const period = {
        start_datetime: '2023-06-07',
        end_datetime: '2023-06-14',
    }
    const granularity = ReportingGranularity.Day
    const statsFilters = {
        period,
    }
    const customFieldsOrder = {
        direction: OrderDirection.Desc,
        column: 'label' as const,
    }
    const timeSeriesData: Record<string, TimeSeriesDataItem[][]> = {
        'Level1::Level2': [
            [
                {
                    dateTime: '2021-02-03T00:00:00.000Z',
                    value: 10,
                },
            ],
        ],
    }
    const dateTimes = getPeriodDateTimes(
        getFilterDateRange(statsFilters.period),
        granularity
    ).map((item) => formatDates(granularity, item))
    const formattedReport = [
        [...LEVEL_LABELS, ...dateTimes],
        ['Level1', 'Level2', '', '', '', String(10)],
    ]

    beforeEach(() => {
        useCustomFieldsTicketCountTimeSeriesMock.mockReturnValue({
            data: timeSeriesData,
            isLoading: false,
        } as UseQueryResult<Record<string, TimeSeriesDataItem[][]>>)
        fetchCustomFieldsTicketCountTimeSeriesMock.mockResolvedValue(
            timeSeriesData
        )
    })

    describe('formatData', () => {
        it('should format data', () => {
            expect(
                formatData(data, dateTimes, customFieldsOrder.direction)
            ).toEqual(formattedReport)
        })
    })

    describe('useCustomFieldsReportData', () => {
        const userTimezone = 'UTC'
        const selectedCustomFieldId = 2
        const fileName = getCsvFileNameWithDates(
            statsFilters.period,
            TICKET_FIELDS_DOWNLOAD_FILE_NAME
        )

        it('should call createCsv with a report', () => {
            const createCsvSpy = jest.spyOn(files, 'createCsv')

            const {result} = renderHook(() =>
                useCustomFieldsReportData(
                    statsFilters,
                    userTimezone,
                    granularity,
                    customFieldsOrder,
                    String(selectedCustomFieldId)
                )
            )

            expect(createCsvSpy).toHaveBeenCalledWith(formattedReport)
            expect(result.current).toEqual({
                files: {
                    [fileName]: files.createCsv(formattedReport),
                },
                fileName,
                isLoading: false,
            })
        })
        it('should return a report', () => {
            const {result} = renderHook(() =>
                useCustomFieldsReportData(
                    statsFilters,
                    userTimezone,
                    granularity,
                    customFieldsOrder,
                    String(selectedCustomFieldId)
                )
            )

            expect(result.current).toEqual({
                files: {},
                fileName,
                isLoading: false,
            })
        })
    })

    describe('fetchCustomFieldsReportData', () => {
        const userTimezone = 'UTC'
        const selectedCustomFieldId = 2
        const fileName = getCsvFileNameWithDates(
            statsFilters.period,
            TICKET_FIELDS_DOWNLOAD_FILE_NAME
        )

        it('should call createCsv with a report', async () => {
            const createCsvSpy = jest.spyOn(files, 'createCsv')

            const result = await fetchCustomFieldsReportData(
                statsFilters,
                userTimezone,
                granularity,
                {
                    agents: [],
                    channelColumnsOrder: [],
                    channels: [],
                    columnsOrder: [],
                    selectedBTODMetric: BusiestTimeOfDaysMetrics.TicketsCreated,
                    customFieldsOrder,
                    selectedCustomFieldId: String(selectedCustomFieldId),
                }
            )

            expect(createCsvSpy).toHaveBeenCalledWith(formattedReport)
            expect(result).toEqual({
                files: {
                    [fileName]: files.createCsv(formattedReport),
                },
                fileName,
                isLoading: false,
            })
        })

        it('should return a report', async () => {
            const result = await fetchCustomFieldsReportData(
                statsFilters,
                userTimezone,
                granularity,
                {
                    agents: [],
                    channelColumnsOrder: [],
                    channels: [],
                    columnsOrder: [],
                    selectedBTODMetric: BusiestTimeOfDaysMetrics.TicketsCreated,
                    customFieldsOrder,
                    selectedCustomFieldId: String(selectedCustomFieldId),
                }
            )

            expect(result).toEqual({
                files: {},
                fileName,
                isLoading: false,
            })
        })

        it('should return empty report when Custom Field not selected', async () => {
            const result = await fetchCustomFieldsReportData(
                statsFilters,
                userTimezone,
                granularity,
                {
                    agents: [],
                    channelColumnsOrder: [],
                    channels: [],
                    columnsOrder: [],
                    selectedBTODMetric: BusiestTimeOfDaysMetrics.TicketsCreated,
                    customFieldsOrder,
                    selectedCustomFieldId: null,
                }
            )

            expect(result).toEqual({
                files: {},
                fileName,
                isLoading: false,
            })
        })

        it('should return empty report on error', async () => {
            fetchCustomFieldsTicketCountTimeSeriesMock.mockRejectedValue({})

            const result = await fetchCustomFieldsReportData(
                statsFilters,
                userTimezone,
                granularity,
                {
                    agents: [],
                    channelColumnsOrder: [],
                    channels: [],
                    columnsOrder: [],
                    selectedBTODMetric: BusiestTimeOfDaysMetrics.TicketsCreated,
                    customFieldsOrder,
                    selectedCustomFieldId: String(selectedCustomFieldId),
                }
            )

            expect(result).toEqual({
                files: {},
                fileName,
                isLoading: false,
            })
        })
    })
})
