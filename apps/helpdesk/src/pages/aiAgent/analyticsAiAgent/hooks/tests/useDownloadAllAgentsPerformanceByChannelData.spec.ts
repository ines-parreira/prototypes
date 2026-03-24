import { renderHook, waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'

import { useDownloadAllAgentsPerformanceByChannelData } from '../useDownloadAllAgentsPerformanceByChannelData'

jest.mock('@repo/logging', () => ({ reportError: jest.fn() }))

jest.mock('../useAllAgentsPerformanceByChannelMetrics', () => ({
    fetchAllAgentsPerformanceByChannelMetrics: jest.fn(),
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

jest.mock(
    'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate',
    () => ({ useMoneySavedPerInteractionWithAutomate: jest.fn(() => 3.1) }),
)

const mockFetch = jest.requireMock('../useAllAgentsPerformanceByChannelMetrics')
const mockReportError = jest.requireMock('@repo/logging').reportError

const MOCK_FILE_NAME =
    'all-agents-channel-performance-2024-01-01_2024-01-31.csv'
const MOCK_CSV =
    'Channel,Overall automation rate,Automated interactions\r\nEmail,75%,1200'

describe('useDownloadAllAgentsPerformanceByChannelData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetch.fetchAllAgentsPerformanceByChannelMetrics.mockResolvedValue({
            fileName: MOCK_FILE_NAME,
            files: { [MOCK_FILE_NAME]: MOCK_CSV },
        })
    })

    it('starts with isLoading true', () => {
        const { result } = renderHook(() =>
            useDownloadAllAgentsPerformanceByChannelData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('returns empty files and fileName while loading', () => {
        const { result } = renderHook(() =>
            useDownloadAllAgentsPerformanceByChannelData(),
        )

        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })

    it('returns CSV data and sets isLoading false after fetch completes', async () => {
        const { result } = renderHook(() =>
            useDownloadAllAgentsPerformanceByChannelData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.fileName).toBe(MOCK_FILE_NAME)
        expect(result.current.files[MOCK_FILE_NAME]).toBe(MOCK_CSV)
    })

    it('sets isLoading to false and reports to Sentry when fetch fails', async () => {
        const error = new Error('Network error')
        mockFetch.fetchAllAgentsPerformanceByChannelMetrics.mockRejectedValue(
            error,
        )

        const { result } = renderHook(() =>
            useDownloadAllAgentsPerformanceByChannelData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(mockReportError).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CRM_REPORTING },
        })
    })

    it('calls fetchAllAgentsPerformanceByChannelMetrics with period-only filters, timezone, and costSavedPerInteraction', async () => {
        renderHook(() => useDownloadAllAgentsPerformanceByChannelData())

        await waitFor(() =>
            expect(
                mockFetch.fetchAllAgentsPerformanceByChannelMetrics,
            ).toHaveBeenCalledWith(
                {
                    period: {
                        start_datetime: '2024-01-01T00:00:00Z',
                        end_datetime: '2024-01-31T23:59:59Z',
                    },
                },
                'UTC',
                3.1,
            ),
        )
    })
})
