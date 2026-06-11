import { reportError } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { useDownloadPerformanceChannelsEmailSubChannelData } from 'domains/reporting/pages/performance/channels/email/hooks/subChannelBreakdown/useDownloadPerformanceChannelsEmailSubChannelData'

jest.mock(
    'domains/reporting/pages/performance/channels/email/hooks/subChannelBreakdown/usePerformanceChannelsEmailSubChannelMetrics',
    () => ({
        fetchPerformanceChannelsEmailSubChannelMetrics: jest.fn(),
    }),
)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')

jest.mock('@repo/logging')
const reportErrorMock = assumeMock(reportError)

const mockFetch = jest.requireMock(
    'domains/reporting/pages/performance/channels/email/hooks/subChannelBreakdown/usePerformanceChannelsEmailSubChannelMetrics',
)
const mockUseStatsFilters = assumeMock(useStatsFilters)

const MOCK_FILE_NAME =
    '2024-01-01_2024-01-31-performance-channels-email_by-sub-channel.csv'
const MOCK_CSV = 'Sub-channel,Average CSAT\r\nEmail,4.5'
const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}

describe('useDownloadPerformanceChannelsEmailSubChannelData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: MOCK_STATS_FILTERS,
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        mockFetch.fetchPerformanceChannelsEmailSubChannelMetrics.mockResolvedValue(
            {
                fileName: MOCK_FILE_NAME,
                files: { [MOCK_FILE_NAME]: MOCK_CSV },
            },
        )
    })

    it('starts with isLoading true and empty result', () => {
        const { result } = renderHook(() =>
            useDownloadPerformanceChannelsEmailSubChannelData(),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })

    it('returns CSV data and sets isLoading false after fetch completes', async () => {
        const { result } = renderHook(() =>
            useDownloadPerformanceChannelsEmailSubChannelData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.fileName).toBe(MOCK_FILE_NAME)
        expect(result.current.files[MOCK_FILE_NAME]).toBe(MOCK_CSV)
    })

    it('calls fetchPerformanceChannelsEmailSubChannelMetrics with cleanStatsFilters and timezone', async () => {
        renderHook(() => useDownloadPerformanceChannelsEmailSubChannelData())

        await waitFor(() =>
            expect(
                mockFetch.fetchPerformanceChannelsEmailSubChannelMetrics,
            ).toHaveBeenCalledWith(MOCK_STATS_FILTERS, 'UTC'),
        )
    })

    it('reports the error and stops loading when the fetch rejects', async () => {
        const error = new Error('fetch failed')
        mockFetch.fetchPerformanceChannelsEmailSubChannelMetrics.mockRejectedValue(
            error,
        )

        const { result } = renderHook(() =>
            useDownloadPerformanceChannelsEmailSubChannelData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(reportErrorMock).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
        })
        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })
})
