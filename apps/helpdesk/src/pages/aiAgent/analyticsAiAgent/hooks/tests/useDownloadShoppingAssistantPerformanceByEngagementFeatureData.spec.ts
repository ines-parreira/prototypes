import { renderHook, waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'

import { useDownloadShoppingAssistantPerformanceByEngagementFeatureData } from '../useDownloadShoppingAssistantPerformanceByEngagementFeatureData'

jest.mock('@repo/logging', () => ({ reportError: jest.fn() }))

jest.mock(
    '../useShoppingAssistantPerformanceByEngagementFeatureMetrics',
    () => ({
        fetchShoppingAssistantPerformanceByEngagementFeatureMetrics: jest.fn(),
    }),
)

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
    '../useShoppingAssistantPerformanceByEngagementFeatureMetrics',
)
const mockReportError = jest.requireMock('@repo/logging').reportError

const MOCK_FILE_NAME =
    'shopping-assistant-performance-by-engagement-feature-2024-01-01_2024-01-31.csv'
const MOCK_CSV = 'Engagement feature,Automated interactions\r\nSearch Bar,1200'

describe('useDownloadShoppingAssistantPerformanceByEngagementFeatureData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetch.fetchShoppingAssistantPerformanceByEngagementFeatureMetrics.mockResolvedValue(
            {
                fileName: MOCK_FILE_NAME,
                files: { [MOCK_FILE_NAME]: MOCK_CSV },
            },
        )
    })

    it('starts with isLoading true', () => {
        const { result } = renderHook(() =>
            useDownloadShoppingAssistantPerformanceByEngagementFeatureData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('returns empty files and fileName while loading', () => {
        const { result } = renderHook(() =>
            useDownloadShoppingAssistantPerformanceByEngagementFeatureData(),
        )

        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })

    it('returns CSV data and sets isLoading false after fetch completes', async () => {
        const { result } = renderHook(() =>
            useDownloadShoppingAssistantPerformanceByEngagementFeatureData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.fileName).toBe(MOCK_FILE_NAME)
        expect(result.current.files[MOCK_FILE_NAME]).toBe(MOCK_CSV)
    })

    it('sets isLoading to false and reports to Sentry when fetch fails', async () => {
        const error = new Error('Network error')
        mockFetch.fetchShoppingAssistantPerformanceByEngagementFeatureMetrics.mockRejectedValue(
            error,
        )

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantPerformanceByEngagementFeatureData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(mockReportError).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
        })
    })

    it('calls fetchShoppingAssistantPerformanceByEngagementFeatureMetrics with period-only filters and timezone', async () => {
        renderHook(() =>
            useDownloadShoppingAssistantPerformanceByEngagementFeatureData(),
        )

        await waitFor(() =>
            expect(
                mockFetch.fetchShoppingAssistantPerformanceByEngagementFeatureMetrics,
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
