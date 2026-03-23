import { renderHook, waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useDownloadArticleRecommendationData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadArticleRecommendationData'

jest.mock('utils/errors', () => ({ reportError: jest.fn() }))

jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useArticleRecommendationMetrics',
    () => ({
        fetchArticleRecommendationMetrics: jest.fn(),
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
    }
    return { useStatsFilters: jest.fn(() => stableReturn) }
})

const mockFetch = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useArticleRecommendationMetrics',
)
const mockReportError = jest.requireMock('utils/errors').reportError

const MOCK_FILE_NAME = 'article_recommendation_table_2024-01-01_2024-01-31.csv'
const MOCK_CSV =
    'Article Recommendation,Automation rate,Automated interactions,Handover interactions\r\nHow to return,75%,150,50'

describe('useDownloadArticleRecommendationData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetch.fetchArticleRecommendationMetrics.mockResolvedValue({
            fileName: MOCK_FILE_NAME,
            files: { [MOCK_FILE_NAME]: MOCK_CSV },
        })
    })

    it('should start with isLoading true', () => {
        const { result } = renderHook(() =>
            useDownloadArticleRecommendationData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return CSV data after fetch completes', async () => {
        const { result } = renderHook(() =>
            useDownloadArticleRecommendationData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.fileName).toBe(MOCK_FILE_NAME)
        expect(result.current.files[MOCK_FILE_NAME]).toBe(MOCK_CSV)
    })

    it('should set isLoading to false and report to Sentry when fetch fails', async () => {
        const error = new Error('Network error')
        mockFetch.fetchArticleRecommendationMetrics.mockRejectedValue(error)

        const { result } = renderHook(() =>
            useDownloadArticleRecommendationData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(mockReportError).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CRM_REPORTING },
        })
    })

    it('should call fetchArticleRecommendationMetrics with period-only filters', async () => {
        renderHook(() => useDownloadArticleRecommendationData())

        await waitFor(() =>
            expect(
                mockFetch.fetchArticleRecommendationMetrics,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    period: {
                        start_datetime: '2024-01-01T00:00:00Z',
                        end_datetime: '2024-01-31T23:59:59Z',
                    },
                }),
            ),
        )
    })
})
