import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useDownloadPerformanceBreakdownV2Data } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownV2Data'

jest.mock('@repo/logging', () => ({ reportError: jest.fn() }))

jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeatureV2',
    () => ({
        fetchPerformanceMetricsPerFeatureV2: jest.fn(),
    }),
)

jest.mock('pages/automate/automate-metrics/constants', () => ({
    AGENT_COST_PER_TICKET: 3.1,
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

jest.mock(
    'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate',
    () => ({ useMoneySavedPerInteractionWithAutomate: jest.fn(() => 3.1) }),
)

const mockFetch = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeatureV2',
)
const mockReportError = jest.requireMock('@repo/logging').reportError

const MOCK_FILE_NAME = 'all_features_table-2024-01-01_2024-01-31.csv'
const MOCK_CSV =
    'All features,Overall automation rate,Automated interactions\r\nAI Agent,18%,2700'

describe('useDownloadPerformanceBreakdownV2Data', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetch.fetchPerformanceMetricsPerFeatureV2.mockResolvedValue({
            fileName: MOCK_FILE_NAME,
            files: { [MOCK_FILE_NAME]: MOCK_CSV },
        })
    })

    it('should start with isLoading true', () => {
        const { result } = renderHook(() =>
            useDownloadPerformanceBreakdownV2Data(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return CSV data after fetch completes', async () => {
        const { result } = renderHook(() =>
            useDownloadPerformanceBreakdownV2Data(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.fileName).toBe(MOCK_FILE_NAME)
        expect(result.current.files[MOCK_FILE_NAME]).toBe(MOCK_CSV)
    })

    it('should set isLoading to false and report to Sentry when fetch fails', async () => {
        const error = new Error('Network error')
        mockFetch.fetchPerformanceMetricsPerFeatureV2.mockRejectedValue(error)

        const { result } = renderHook(() =>
            useDownloadPerformanceBreakdownV2Data(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(mockReportError).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
        })
    })

    it('should call fetchPerformanceMetricsPerFeatureV2 with period-only filters, timezone, and costSavedPerInteraction', async () => {
        renderHook(() => useDownloadPerformanceBreakdownV2Data())

        await waitFor(() =>
            expect(
                mockFetch.fetchPerformanceMetricsPerFeatureV2,
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
