import { renderHook, waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useDownloadPerformanceBreakdownData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownData'

jest.mock('@repo/logging', () => ({ reportError: jest.fn() }))

jest.mock('../fetchPerformanceBreakdownData', () => ({
    fetchPerformanceMetricsPerFeature: jest.fn(),
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
        granularity: 'day',
    }
    return { useStatsFilters: jest.fn(() => stableReturn) }
})

jest.mock('domains/reporting/hooks/automate/useAIAgentUserId', () => ({
    useAIAgentUserId: jest.fn(() => undefined),
}))

jest.mock(
    'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate',
    () => ({ useMoneySavedPerInteractionWithAutomate: jest.fn(() => 3.1) }),
)

const mockFetch = jest.requireMock('../fetchPerformanceBreakdownData')
const mockReportError = jest.requireMock('@repo/logging').reportError

const MOCK_FILE_NAME = 'performance-breakdown-2024-01-01_2024-01-31.csv'
const MOCK_CSV =
    'Feature,Overall automation rate,Automated interactions\r\nAI Agent,18%,2700'

describe('useDownloadPerformanceBreakdownData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetch.fetchPerformanceMetricsPerFeature.mockResolvedValue({
            fileName: MOCK_FILE_NAME,
            files: { [MOCK_FILE_NAME]: MOCK_CSV },
        })
    })

    it('should start with isLoading true', () => {
        const { result } = renderHook(() =>
            useDownloadPerformanceBreakdownData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return CSV data after fetch completes', async () => {
        const { result } = renderHook(() =>
            useDownloadPerformanceBreakdownData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.fileName).toBe(MOCK_FILE_NAME)
        expect(result.current.files[MOCK_FILE_NAME]).toBe(MOCK_CSV)
    })

    it('should set isLoading to false and report to Sentry when fetch fails', async () => {
        const error = new Error('Network error')
        mockFetch.fetchPerformanceMetricsPerFeature.mockRejectedValue(error)

        const { result } = renderHook(() =>
            useDownloadPerformanceBreakdownData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(mockReportError).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CRM_REPORTING },
        })
    })

    it('should call fetchPerformanceMetricsPerFeature with period-only filters, timezone, aiAgentUserId, and costSavedPerInteraction', async () => {
        renderHook(() => useDownloadPerformanceBreakdownData())

        await waitFor(() =>
            expect(
                mockFetch.fetchPerformanceMetricsPerFeature,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    period: {
                        start_datetime: '2024-01-01T00:00:00Z',
                        end_datetime: '2024-01-31T23:59:59Z',
                    },
                }),
                'UTC',
                undefined,
                3.1,
            ),
        )
    })
})
