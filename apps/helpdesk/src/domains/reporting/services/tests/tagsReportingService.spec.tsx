import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { TagSelection } from 'domains/reporting/hooks/tags/useTagResultsSelection'
import { useTagsReportContext } from 'domains/reporting/hooks/ticket-insights/useTagsReportContext'
import {
    fetchTagsTicketCountTimeSeries,
    fetchTotalTaggedTicketCountTimeSeries,
    useTagsTicketCountTimeSeries,
    useTotalTaggedTicketCountTimeSeries,
} from 'domains/reporting/hooks/timeSeries'
import type {
    TimeSeriesDataItem,
    TimeSeriesPerDimension,
} from 'domains/reporting/hooks/useTimeSeries'
import {
    TagFilterInstanceId,
    TicketTimeReference,
} from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { getTagName } from 'domains/reporting/pages/ticket-insights/tags/helpers'
import { formatDates } from 'domains/reporting/pages/utils'
import {
    fetchTagsReportData,
    TAGS_REPORT_FILE_NAME,
    useDownloadTagsReportData,
    useTagsReportData,
} from 'domains/reporting/services/tagsReportingService'
import type { TagsTableOrder } from 'domains/reporting/state/ui/stats/tagsReportSlice'
import { tags } from 'fixtures/tag'
import { OrderDirection } from 'models/api/types'
import { createCsv, saveZippedFiles } from 'utils/file'

jest.mock('domains/reporting/hooks/timeSeries')
const fetchTagsTicketCountTimeSeriesMock = assumeMock(
    fetchTagsTicketCountTimeSeries,
)
const useTagsTicketCountTimeSeriesMock = assumeMock(
    useTagsTicketCountTimeSeries,
)
const fetchTotalTaggedTicketCountTimeSeriesMock = assumeMock(
    fetchTotalTaggedTicketCountTimeSeries,
)
const useTotalTaggedTicketCountTimeSeriesMock = assumeMock(
    useTotalTaggedTicketCountTimeSeries,
)

jest.mock('domains/reporting/hooks/ticket-insights/useTagsReportContext')
const useTagsReportContextMock = assumeMock(useTagsReportContext)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('@repo/logging')
jest.mock('utils/file', () => ({
    ...jest.requireActual('utils/file'),
    saveZippedFiles: jest.fn(),
}))

describe('TagsReportingService', () => {
    const tag = tags[0]
    const tagsTableOrder: TagsTableOrder = {
        column: 'tag',
        direction: OrderDirection.Desc,
    }

    const deletedTagId = '789'
    const timezone = 'UTC'
    const granularity = ReportingGranularity.Day

    const period = {
        start_datetime: '2023-06-07T00:00:00.000Z',
        end_datetime: '2023-06-09T23:59:00.000Z',
    }

    const fileName = getCsvFileNameWithDates(period, TAGS_REPORT_FILE_NAME)

    const timeColumns = [
        formatDates(granularity, '2023-06-07'),
        formatDates(granularity, '2023-06-08'),
        formatDates(granularity, '2023-06-09'),
    ]

    const columns = ['tag', 'total']

    const columnsWithPercentageAndDelta = [...columns, 'percentage', 'delta']

    const expectedData = [
        [...columns, ...timeColumns],
        ['billing', 123, 100, 23, 0],
        [getTagName({ id: deletedTagId }), 213, 200, 13, 0],
    ]

    const expectedDataWithPercentageAndDelta = [
        [...columnsWithPercentageAndDelta, ...timeColumns],
        ['billing', 123, '37%', '0%', 100, 23, 0],
        [getTagName({ id: deletedTagId }), 213, '63%', '0%', 200, 13, 0],
    ]

    useStatsFiltersMock.mockReturnValue({
        cleanStatsFilters: { period },
        userTimezone: timezone,
        granularity,
    })

    const currentTagsTicketCountTimeSeries: TimeSeriesPerDimension = {
        [tag.id]: [
            [
                { value: 100, dateTime: '2023-06-07' },
                { value: 23, dateTime: '2023-06-08' },
                { value: 0, dateTime: '2023-06-09' },
            ],
        ],
        [deletedTagId]: [
            [
                { value: 200, dateTime: '2023-06-07' },
                { value: 13, dateTime: '2023-06-08' },
                { value: 0, dateTime: '2023-06-09' },
            ],
        ],
    }

    const totalTaggedTicketCountTimeSeries: TimeSeriesDataItem[][] = [
        [
            { value: 300, dateTime: '2023-06-07' },
            { value: 36, dateTime: '2023-06-08' },
            { value: 0, dateTime: '2023-06-09' },
        ],
    ]

    fetchTagsTicketCountTimeSeriesMock.mockResolvedValue(
        currentTagsTicketCountTimeSeries,
    )

    fetchTotalTaggedTicketCountTimeSeriesMock.mockResolvedValue(
        totalTaggedTicketCountTimeSeries as any,
    )

    const context = {
        tags: tags.reduce((acc, tag) => ({ ...acc, [tag.id]: tag }), {}),
        tagsTableOrder,
        isExtendedReportingEnabled: false,
        tagResultsSelection: TagSelection.includeTags,
        tagTicketTimeReference: TicketTimeReference.TaggedAt,
    }

    const statsFiltersWithTags = {
        period,
        tags: [
            {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [tag.id],
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }

    const expectedFilteredData = [
        [...columns, ...timeColumns],
        ['billing', 123, 100, 23, 0],
    ]

    beforeEach(() => {
        useTagsTicketCountTimeSeriesMock.mockReturnValue({
            data: currentTagsTicketCountTimeSeries,
            isLoading: false,
        } as any)

        useTotalTaggedTicketCountTimeSeriesMock.mockReturnValue({
            data: totalTaggedTicketCountTimeSeries,
            isLoading: false,
        } as any)

        useTagsReportContextMock.mockReturnValue(context)
    })

    describe('useTagsReportData()', () => {
        it('should fetch and format Tags Report data', () => {
            const { result } = renderHook(() => useTagsReportData())

            expect(result.current).toEqual({
                files: {
                    [fileName]: createCsv(expectedData),
                },
                fileName,
                isLoading: false,
            })
        })

        it('should include percentage and delta columns when feature flag is enabled', () => {
            useTagsReportContextMock.mockReturnValue({
                ...context,
                isExtendedReportingEnabled: true,
            })

            const { result } = renderHook(() => useTagsReportData())

            expect(result.current).toEqual({
                files: {
                    [fileName]: createCsv(expectedDataWithPercentageAndDelta),
                },
                fileName,
                isLoading: false,
            })
        })

        it('should use default values when no data is available', () => {
            useTagsReportContextMock.mockReturnValue({
                ...context,
                isExtendedReportingEnabled: false,
            })
            useTagsTicketCountTimeSeriesMock.mockReturnValue({
                data: null,
                isLoading: false,
            } as any)

            useTotalTaggedTicketCountTimeSeriesMock.mockReturnValue({
                data: null,
                isLoading: false,
            } as any)

            const { result } = renderHook(() => useTagsReportData())

            expect(result.current).toEqual({
                files: {
                    [fileName]: createCsv([[...columns, ...timeColumns]]),
                },
                fileName,
                isLoading: false,
            })
        })

        it('should return isLoading true when currentTagsTicketCountTimeSeries is loading', () => {
            useTagsTicketCountTimeSeriesMock.mockReturnValueOnce({
                data: currentTagsTicketCountTimeSeries,
                isLoading: true,
            } as any)

            useTagsTicketCountTimeSeriesMock.mockReturnValueOnce({
                data: currentTagsTicketCountTimeSeries,
                isLoading: false,
            } as any)

            useTotalTaggedTicketCountTimeSeriesMock.mockReturnValue({
                data: totalTaggedTicketCountTimeSeries,
                isLoading: false,
            } as any)

            const { result } = renderHook(() => useTagsReportData())
            expect(result.current.isLoading).toBe(true)
        })

        it('should return isLoading true when previousTagsTicketCountTimeSeries is loading', () => {
            useTagsTicketCountTimeSeriesMock.mockReturnValueOnce({
                data: currentTagsTicketCountTimeSeries,
                isLoading: false,
            } as any)

            useTagsTicketCountTimeSeriesMock.mockReturnValueOnce({
                data: currentTagsTicketCountTimeSeries,
                isLoading: true,
            } as any)

            useTotalTaggedTicketCountTimeSeriesMock.mockReturnValue({
                data: totalTaggedTicketCountTimeSeries,
                isLoading: false,
            } as any)

            const { result } = renderHook(() => useTagsReportData())
            expect(result.current.isLoading).toBe(true)
        })

        it('should return isLoading true when totalTaggedTicketCountTimeSeries is loading', () => {
            useTagsTicketCountTimeSeriesMock.mockReturnValue({
                data: currentTagsTicketCountTimeSeries,
                isLoading: false,
            } as any)

            useTotalTaggedTicketCountTimeSeriesMock.mockReturnValue({
                data: totalTaggedTicketCountTimeSeries,
                isLoading: true,
            } as any)

            const { result } = renderHook(() => useTagsReportData())
            expect(result.current.isLoading).toBe(true)
        })

        it('should filter time series with selected tags', () => {
            useTagsReportContextMock.mockReturnValue({
                ...context,
                tagResultsSelection: TagSelection.excludeTags,
            })

            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: statsFiltersWithTags,
                userTimezone: timezone,
                granularity,
            })

            const { result } = renderHook(() => useTagsReportData())

            expect(result.current).toEqual({
                files: {
                    [fileName]: createCsv(expectedFilteredData),
                },
                fileName,
                isLoading: false,
            })
        })
    })

    describe('fetchTicketCountPerTag', () => {
        it('should fetch and format the report', async () => {
            const result = await fetchTagsReportData(
                { period },
                timezone,
                granularity,
                context,
            )

            expect(result).toEqual({
                files: {
                    [fileName]: createCsv(expectedData),
                },
                fileName,
                isLoading: false,
            })
        })

        it('should filter result if TagSelection equals excludeTags', async () => {
            const result = await fetchTagsReportData(
                statsFiltersWithTags,
                timezone,
                granularity,
                { ...context, tagResultsSelection: TagSelection.excludeTags },
            )

            expect(result).toEqual({
                files: {
                    [fileName]: createCsv(expectedFilteredData),
                },
                fileName,
                isLoading: false,
            })
        })
    })

    describe('useDownloadTagsReportData', () => {
        it('should return loading state and download function', () => {
            const { result } = renderHook(() => useDownloadTagsReportData())

            expect(result.current).toEqual({
                isLoading: false,
                download: expect.any(Function),
            })
        })

        it('should handle download with correct report data', async () => {
            const { result } = renderHook(() => useDownloadTagsReportData())

            await result.current.download()

            expect(saveZippedFiles).toHaveBeenCalledWith(
                { [fileName]: createCsv(expectedData) },
                fileName,
            )
        })

        it('should log event when download is called', async () => {
            const { result } = renderHook(() => useDownloadTagsReportData())

            await result.current.download()

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.StatDownloadClicked,
                { name: 'all-metrics' },
            )
        })
    })
})
