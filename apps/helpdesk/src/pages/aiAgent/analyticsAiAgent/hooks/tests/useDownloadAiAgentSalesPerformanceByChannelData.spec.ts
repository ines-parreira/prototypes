import { renderHook, waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'

import { useDownloadAiAgentSalesPerformanceByChannelData } from '../useDownloadAiAgentSalesPerformanceByChannelData'

jest.mock('@repo/logging', () => ({ reportError: jest.fn() }))

jest.mock('../useAiAgentSalesPerformanceByChannelMetrics', () => ({
    fetchAiAgentSalesPerformanceByChannelMetrics: jest.fn(),
}))

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters', () => {
    const stableReturn = {
        cleanStatsFilters: {
            period: {
                start_datetime: '2024-01-01T00:00:00Z',
                end_datetime: '2024-01-31T23:59:59Z',
            },
        },
        userTimezone: 'UTC',
    }
    return { useStatsFilters: jest.fn(() => stableReturn) }
})

const mockFetch = jest.requireMock(
    '../useAiAgentSalesPerformanceByChannelMetrics',
)
const mockReportError = jest.requireMock('@repo/logging').reportError

const MOCK_FILE_NAME =
    '2024-01-01_2024-01-31-ai_agent_sales_performance_by_channel_table.csv'
const MOCK_CSV = '"AI Agent Sales Performance By Channel"\r\n"email"'

describe('useDownloadAiAgentSalesPerformanceByChannelData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetch.fetchAiAgentSalesPerformanceByChannelMetrics.mockResolvedValue(
            {
                fileName: MOCK_FILE_NAME,
                files: { [MOCK_FILE_NAME]: MOCK_CSV },
            },
        )
    })

    it('starts with isLoading true', () => {
        const { result } = renderHook(() =>
            useDownloadAiAgentSalesPerformanceByChannelData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('returns empty files and fileName while loading', () => {
        const { result } = renderHook(() =>
            useDownloadAiAgentSalesPerformanceByChannelData(),
        )

        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })

    it('returns CSV data and sets isLoading false after fetch completes', async () => {
        const { result } = renderHook(() =>
            useDownloadAiAgentSalesPerformanceByChannelData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.fileName).toBe(MOCK_FILE_NAME)
        expect(result.current.files[MOCK_FILE_NAME]).toBe(MOCK_CSV)
    })

    it('sets isLoading to false and reports to Sentry when fetch fails', async () => {
        const error = new Error('Network error')
        mockFetch.fetchAiAgentSalesPerformanceByChannelMetrics.mockRejectedValue(
            error,
        )

        const { result } = renderHook(() =>
            useDownloadAiAgentSalesPerformanceByChannelData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(mockReportError).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CRM_REPORTING },
        })
    })

    it('calls fetchAiAgentSalesPerformanceByChannelMetrics with period-only filters and timezone', async () => {
        renderHook(() => useDownloadAiAgentSalesPerformanceByChannelData())

        await waitFor(() =>
            expect(
                mockFetch.fetchAiAgentSalesPerformanceByChannelMetrics,
            ).toHaveBeenCalledWith(
                {
                    period: {
                        start_datetime: '2024-01-01T00:00:00Z',
                        end_datetime: '2024-01-31T23:59:59Z',
                    },
                },
                'UTC',
            ),
        )
    })
})
