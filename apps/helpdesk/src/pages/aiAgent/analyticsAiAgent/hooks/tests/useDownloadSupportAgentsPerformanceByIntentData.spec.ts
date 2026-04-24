import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

import { useDownloadSupportAgentsPerformanceByIntentData } from '../useDownloadSupportAgentsPerformanceByIntentData'

jest.mock('@repo/logging', () => ({ reportError: jest.fn() }))

jest.mock('../useSupportAgentsPerformanceByIntentMetrics', () => ({
    fetchSupportAgentsPerformanceByIntentMetrics: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')

jest.mock(
    'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate',
    () => ({ useMoneySavedPerInteractionWithAutomate: jest.fn(() => 3.1) }),
)

const mockFetch = jest.requireMock(
    '../useSupportAgentsPerformanceByIntentMetrics',
)
const mockReportError = jest.requireMock('@repo/logging').reportError
const mockUseAiAgentStatsFilters = assumeMock(useAiAgentStatsFilters)

const MOCK_FILE_NAME =
    'support-agents-intent-performance-2024-01-01_2024-01-31.csv'
const MOCK_CSV =
    'Intent L1,Intent L2,Automated interactions\r\nBilling,Refund,1200'

describe('useDownloadSupportAgentsPerformanceByIntentData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        mockFetch.fetchSupportAgentsPerformanceByIntentMetrics.mockResolvedValue(
            {
                fileName: MOCK_FILE_NAME,
                files: { [MOCK_FILE_NAME]: MOCK_CSV },
            },
        )
    })

    it('starts with isLoading true', () => {
        const { result } = renderHook(() =>
            useDownloadSupportAgentsPerformanceByIntentData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('returns empty files and fileName while loading', () => {
        const { result } = renderHook(() =>
            useDownloadSupportAgentsPerformanceByIntentData(),
        )

        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })

    it('returns CSV data and sets isLoading false after fetch completes', async () => {
        const { result } = renderHook(() =>
            useDownloadSupportAgentsPerformanceByIntentData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.fileName).toBe(MOCK_FILE_NAME)
        expect(result.current.files[MOCK_FILE_NAME]).toBe(MOCK_CSV)
    })

    it('sets isLoading to false and reports to Sentry when fetch fails', async () => {
        const error = new Error('Network error')
        mockFetch.fetchSupportAgentsPerformanceByIntentMetrics.mockRejectedValue(
            error,
        )

        const { result } = renderHook(() =>
            useDownloadSupportAgentsPerformanceByIntentData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(mockReportError).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
        })
    })

    it('calls fetchSupportAgentsPerformanceByIntentMetrics with period-only filters, timezone, and costSavedPerInteraction', async () => {
        renderHook(() => useDownloadSupportAgentsPerformanceByIntentData())

        await waitFor(() =>
            expect(
                mockFetch.fetchSupportAgentsPerformanceByIntentMetrics,
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
