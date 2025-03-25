import { renderHook } from '@testing-library/react-hooks'

import { logEvent, SegmentEvent } from 'common/segment'
import { tags } from 'fixtures/tag'
import { getCsvFileNameWithDates } from 'hooks/reporting/common/utils'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useTagsReportContext } from 'hooks/reporting/ticket-insights/useTagsReportContext'
import {
    fetchTagsTicketCountTimeSeries,
    fetchTotalTaggedTicketCountTimeSeries,
    useTagsTicketCountTimeSeries,
    useTotalTaggedTicketCountTimeSeries,
} from 'hooks/reporting/timeSeries'
import {
    TimeSeriesDataItem,
    TimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'
import { OrderDirection } from 'models/api/types'
import { ReportingGranularity } from 'models/reporting/types'
import { getTagName } from 'pages/stats/ticket-insights/tags/helpers'
import { formatDates } from 'pages/stats/utils'
import {
    fetchTagsReportData,
    TAGS_REPORT_FILE_NAME,
    useDownloadTagsReportData,
    useTagsReportData,
} from 'services/reporting/tagsReportingService'
import { TagsTableOrder } from 'state/ui/stats/tagsReportSlice'
import { createCsv, saveZippedFiles } from 'utils/file'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/timeSeries')
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

jest.mock('hooks/reporting/ticket-insights/useTagsReportContext')
const useTagsReportContextMock = assumeMock(useTagsReportContext)

jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('common/segment')
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
    }

    beforeEach(() => {
        useTagsTicketCountTimeSeriesMock.mockReturnValue({
            data: currentTagsTicketCountTimeSeries,
            isLoading: false,
        } as any)

        useTotalTaggedTicketCountTimeSeriesMock.mockReturnValue({
            data: totalTaggedTicketCountTimeSeries,
            isLoading: false,
        } as any)
    })

    describe('useTagsReportData()', () => {
        useTagsReportContextMock.mockReturnValue(context)

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
