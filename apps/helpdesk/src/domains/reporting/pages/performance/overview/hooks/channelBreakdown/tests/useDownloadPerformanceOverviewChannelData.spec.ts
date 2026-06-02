import { reportError } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { useDownloadPerformanceOverviewChannelData } from 'domains/reporting/pages/performance/overview/hooks/channelBreakdown/useDownloadPerformanceOverviewChannelData'

jest.mock(
    'domains/reporting/pages/performance/overview/hooks/channelBreakdown/usePerformanceOverviewChannelMetrics',
    () => ({
        fetchPerformanceOverviewChannelMetrics: jest.fn(),
    }),
)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')

jest.mock('@repo/logging')
const reportErrorMock = assumeMock(reportError)

const mockFetch = jest.requireMock(
    'domains/reporting/pages/performance/overview/hooks/channelBreakdown/usePerformanceOverviewChannelMetrics',
)
const mockUseStatsFilters = assumeMock(useStatsFilters)

const MOCK_FILE_NAME =
    '2024-01-01_2024-01-31-performance-overview_by-channel.csv'
const MOCK_CSV = 'Channel,Average CSAT\r\nEmail,4.5'
const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}

describe('useDownloadPerformanceOverviewChannelData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: MOCK_STATS_FILTERS,
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        mockFetch.fetchPerformanceOverviewChannelMetrics.mockResolvedValue({
            fileName: MOCK_FILE_NAME,
            files: { [MOCK_FILE_NAME]: MOCK_CSV },
        })
    })

    it('starts with isLoading true and empty result', () => {
        const { result } = renderHook(() =>
            useDownloadPerformanceOverviewChannelData(),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })

    it('returns CSV data and sets isLoading false after fetch completes', async () => {
        const { result } = renderHook(() =>
            useDownloadPerformanceOverviewChannelData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.fileName).toBe(MOCK_FILE_NAME)
        expect(result.current.files[MOCK_FILE_NAME]).toBe(MOCK_CSV)
    })

    it('calls fetchPerformanceOverviewChannelMetrics with cleanStatsFilters and timezone', async () => {
        renderHook(() => useDownloadPerformanceOverviewChannelData())

        await waitFor(() =>
            expect(
                mockFetch.fetchPerformanceOverviewChannelMetrics,
            ).toHaveBeenCalledWith(MOCK_STATS_FILTERS, 'UTC'),
        )
    })

    it('reports the error and stops loading when the fetch rejects', async () => {
        const error = new Error('fetch failed')
        mockFetch.fetchPerformanceOverviewChannelMetrics.mockRejectedValue(
            error,
        )

        const { result } = renderHook(() =>
            useDownloadPerformanceOverviewChannelData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(reportErrorMock).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
        })
        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })
})
