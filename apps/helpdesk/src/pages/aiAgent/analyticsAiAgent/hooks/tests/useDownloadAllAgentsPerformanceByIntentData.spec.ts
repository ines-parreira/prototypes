import { renderHook, waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'

import { useDownloadAllAgentsPerformanceByIntentData } from '../useDownloadAllAgentsPerformanceByIntentData'

jest.mock('@repo/logging', () => ({ reportError: jest.fn() }))

jest.mock('../useAllAgentsPerformanceByIntentMetrics', () => ({
    fetchAllAgentsPerformanceByIntentMetrics: jest.fn(),
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

const mockFetch = jest.requireMock('../useAllAgentsPerformanceByIntentMetrics')
const mockReportError = jest.requireMock('@repo/logging').reportError

const MOCK_FILE_NAME = 'all-agents-intent-performance-2024-01-01_2024-01-31.csv'
const MOCK_CSV =
    'Intent L1,Intent L2,Automated interactions,Handover interactions\r\nBilling,Refund,120,30'

describe('useDownloadAllAgentsPerformanceByIntentData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetch.fetchAllAgentsPerformanceByIntentMetrics.mockResolvedValue({
            fileName: MOCK_FILE_NAME,
            files: { [MOCK_FILE_NAME]: MOCK_CSV },
        })
    })

    it('starts with isLoading true', () => {
        const { result } = renderHook(() =>
            useDownloadAllAgentsPerformanceByIntentData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('returns empty files and fileName while loading', () => {
        const { result } = renderHook(() =>
            useDownloadAllAgentsPerformanceByIntentData(),
        )

        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })

    it('returns CSV data and sets isLoading false after fetch completes', async () => {
        const { result } = renderHook(() =>
            useDownloadAllAgentsPerformanceByIntentData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.fileName).toBe(MOCK_FILE_NAME)
        expect(result.current.files[MOCK_FILE_NAME]).toBe(MOCK_CSV)
    })

    it('sets isLoading to false and reports to Sentry when fetch fails', async () => {
        const error = new Error('Network error')
        mockFetch.fetchAllAgentsPerformanceByIntentMetrics.mockRejectedValue(
            error,
        )

        const { result } = renderHook(() =>
            useDownloadAllAgentsPerformanceByIntentData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(mockReportError).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CRM_REPORTING },
        })
    })

    it('calls fetchAllAgentsPerformanceByIntentMetrics with period-only filters, timezone, and costSavedPerInteraction', async () => {
        renderHook(() => useDownloadAllAgentsPerformanceByIntentData())

        await waitFor(() =>
            expect(
                mockFetch.fetchAllAgentsPerformanceByIntentMetrics,
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
