import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { getPeriodDateTimes } from 'domains/reporting/hooks/helpers'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    fetchCustomFieldsTicketCountTimeSeries,
    useCustomFieldsTicketCountTimeSeries,
} from 'domains/reporting/hooks/timeSeries'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { TicketTimeReference } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { formatDates } from 'domains/reporting/pages/utils'
import {
    fetchCustomFieldsReportData,
    formatData,
    LEVEL_LABELS,
    TICKET_FIELDS_DOWNLOAD_FILE_NAME,
    useCustomFieldsReportData,
} from 'domains/reporting/services/ticketFieldsReportingService'
import { getFilterDateRange } from 'domains/reporting/utils/reporting'
import useAppSelector from 'hooks/useAppSelector'
import { OrderDirection } from 'models/api/types'
import * as files from 'utils/file'
import { saveZippedFiles } from 'utils/file'

jest.mock('domains/reporting/hooks/timeSeries')
const useCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    useCustomFieldsTicketCountTimeSeries,
)
const fetchCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    fetchCustomFieldsTicketCountTimeSeries,
)
jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)
jest.mock('utils/file')
jest.mock('@repo/logging')

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
        granularity,
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
            timeSeriesData,
        )
    })

    describe('formatData', () => {
        it('should format data', () => {
            expect(
                formatData(data, dateTimes, customFieldsOrder.direction),
            ).toEqual(formattedReport)
        })
    })

    describe('useCustomFieldsReportData', () => {
        const userTimezone = 'UTC'
        const selectedCustomFieldId = 2
        const fileName = getCsvFileNameWithDates(
            statsFilters.period,
            TICKET_FIELDS_DOWNLOAD_FILE_NAME,
        )

        beforeEach(() => {
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: statsFilters,
                userTimezone,
                granularity,
            })
            useAppSelectorMock.mockReturnValue({
                customFieldsOrder,
            })
        })

        it('should call createCsv with a download action & loading state', () => {
            const createCsvSpy = jest.spyOn(files, 'createCsv')

            const { result } = renderHook(() =>
                useCustomFieldsReportData(selectedCustomFieldId),
            )

            expect(createCsvSpy).toHaveBeenCalledWith(formattedReport)
            expect(result.current).toEqual({
                isLoading: false,
                download: expect.any(Function),
            })
        })

        it('should return a download action that triggers a logEvent & saveZippedFiles', async () => {
            const { result } = renderHook(() =>
                useCustomFieldsReportData(selectedCustomFieldId),
            )

            await result.current.download()

            expect(saveZippedFiles).toHaveBeenCalledWith(
                { [fileName]: files.createCsv(formattedReport) },
                fileName,
            )

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.StatDownloadClicked,
                { name: 'all-metrics' },
            )
        })
    })

    describe('fetchCustomFieldsReportData', () => {
        const userTimezone = 'UTC'
        const selectedCustomFieldId = 2
        const fileName = getCsvFileNameWithDates(
            statsFilters.period,
            TICKET_FIELDS_DOWNLOAD_FILE_NAME,
        )

        it('should call createCsv with a report', async () => {
            const createCsvSpy = jest.spyOn(files, 'createCsv')

            const result = await fetchCustomFieldsReportData(
                statsFilters,
                userTimezone,
                granularity,
                {
                    customFieldsOrder,
                    selectedCustomFieldId: selectedCustomFieldId,
                    ticketFieldsTicketTimeReference:
                        TicketTimeReference.CreatedAt,
                },
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
                    customFieldsOrder,
                    selectedCustomFieldId: selectedCustomFieldId,
                    ticketFieldsTicketTimeReference:
                        TicketTimeReference.CreatedAt,
                },
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
                    customFieldsOrder,
                    selectedCustomFieldId: null,
                    ticketFieldsTicketTimeReference:
                        TicketTimeReference.CreatedAt,
                },
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
                    customFieldsOrder,
                    selectedCustomFieldId: selectedCustomFieldId,
                    ticketFieldsTicketTimeReference:
                        TicketTimeReference.CreatedAt,
                },
            )

            expect(result).toEqual({
                files: {},
                fileName,
                isLoading: false,
            })
        })
    })
})
