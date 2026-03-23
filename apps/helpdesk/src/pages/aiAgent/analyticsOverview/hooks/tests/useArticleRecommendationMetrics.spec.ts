import { renderHook } from '@testing-library/react'

import {
    fetchArticleRecommendationMetrics,
    useArticleRecommendationMetrics,
} from '../useArticleRecommendationMetrics'

jest.mock(
    'domains/reporting/hooks/support-performance/useStatsFilters',
    () => ({
        useStatsFilters: jest.fn(),
    }),
)

jest.mock('domains/reporting/models/articleRecommendations', () => ({
    useArticleRecommendations: jest.fn(),
    fetchArticleRecommendations: jest.fn(),
}))

jest.mock('domains/reporting/hooks/common/utils', () => ({
    getCsvFileNameWithDates: jest.fn(),
}))

jest.mock('@repo/reporting', () => ({
    formatMetricValue: jest.fn((v: number) => String(v ?? '')),
}))

jest.mock('utils/file', () => ({
    createCsv: jest.fn(),
}))

const mockUseStatsFilters = jest.requireMock(
    'domains/reporting/hooks/support-performance/useStatsFilters',
).useStatsFilters as jest.Mock

const mockUseArticleRecommendations = jest.requireMock(
    'domains/reporting/models/articleRecommendations',
).useArticleRecommendations as jest.Mock

const mockFetchArticleRecommendations = jest.requireMock(
    'domains/reporting/models/articleRecommendations',
).fetchArticleRecommendations as jest.Mock

const mockGetCsvFileNameWithDates = jest.requireMock(
    'domains/reporting/hooks/common/utils',
).getCsvFileNameWithDates as jest.Mock

const mockCreateCsv = jest.requireMock('utils/file').createCsv as jest.Mock

const MOCK_PERIOD = {
    start_datetime: '2024-01-01T00:00:00Z',
    end_datetime: '2024-01-31T23:59:59Z',
}

const MOCK_STATS_FILTERS = {
    period: MOCK_PERIOD,
}

const mockApiItems = [
    {
        article_id: 'art-1',
        article_title: 'How to return an item',
        article_url: 'https://example.com/return',
        total_count: 200,
        automation_rate: 75,
        successful_count: 150,
        helpful_count: 120,
        drop_off_count: 30,
        handover_count: 50,
    },
    {
        article_id: 'art-2',
        article_title: 'Track your order',
        article_url: 'https://example.com/track',
        total_count: 150,
        automation_rate: 60,
        successful_count: 90,
        helpful_count: 80,
        drop_off_count: 10,
        handover_count: 60,
    },
]

const expectedRows = [
    {
        entity: 'https://example.com/return',
        automationRate: 75,
        automatedInteractions: 150,
        handoverInteractions: 50,
    },
    {
        entity: 'https://example.com/track',
        automationRate: 60,
        automatedInteractions: 90,
        handoverInteractions: 60,
    },
]

describe('useArticleRecommendationMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: MOCK_STATS_FILTERS,
        })
        mockUseArticleRecommendations.mockReturnValue({
            data: { data: { data: mockApiItems } },
            isLoading: false,
            isError: false,
        })
    })

    it('returns transformed rows from API response', () => {
        const { result } = renderHook(() => useArticleRecommendationMetrics())

        expect(result.current.data).toEqual(expectedRows)
    })

    it('maps article_url to entity, article_title to displayNames', () => {
        const { result } = renderHook(() => useArticleRecommendationMetrics())

        expect(result.current.displayNames).toEqual({
            'https://example.com/return': 'How to return an item',
            'https://example.com/track': 'Track your order',
        })
    })

    it('maps API fields to row fields correctly', () => {
        const { result } = renderHook(() => useArticleRecommendationMetrics())

        expect(result.current.data[0].automationRate).toBe(75)
        expect(result.current.data[0].automatedInteractions).toBe(150)
        expect(result.current.data[0].handoverInteractions).toBe(50)
    })

    it('returns isLoading true when query is fetching', () => {
        mockUseArticleRecommendations.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        })

        const { result } = renderHook(() => useArticleRecommendationMetrics())

        expect(result.current.isLoading).toBe(true)
    })

    it('returns isError true when query fails', () => {
        mockUseArticleRecommendations.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        })

        const { result } = renderHook(() => useArticleRecommendationMetrics())

        expect(result.current.isError).toBe(true)
    })

    it('maps isLoading to all loadingStates', () => {
        mockUseArticleRecommendations.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        })

        const { result } = renderHook(() => useArticleRecommendationMetrics())

        expect(result.current.loadingStates.automationRate).toBe(true)
        expect(result.current.loadingStates.automatedInteractions).toBe(true)
        expect(result.current.loadingStates.handoverInteractions).toBe(true)
    })

    it('returns empty data and displayNames when response is empty', () => {
        mockUseArticleRecommendations.mockReturnValue({
            data: { data: { data: [] } },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useArticleRecommendationMetrics())

        expect(result.current.data).toEqual([])
        expect(result.current.displayNames).toEqual({})
    })

    it('passes period start/end datetime to useArticleRecommendations', () => {
        renderHook(() => useArticleRecommendationMetrics())

        expect(mockUseArticleRecommendations).toHaveBeenCalledWith(
            expect.objectContaining({
                start_datetime: MOCK_PERIOD.start_datetime,
                end_datetime: MOCK_PERIOD.end_datetime,
            }),
        )
    })

    it('passes store_integration_id when storeIntegrations filter is set', () => {
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                ...MOCK_STATS_FILTERS,
                storeIntegrations: { operator: 'and', values: [42] },
            },
        })

        renderHook(() => useArticleRecommendationMetrics())

        expect(mockUseArticleRecommendations).toHaveBeenCalledWith(
            expect.objectContaining({ store_integration_id: 42 }),
        )
    })

    it('passes channel when channels filter is set', () => {
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                ...MOCK_STATS_FILTERS,
                channels: { operator: 'and', values: ['email'] },
            },
        })

        renderHook(() => useArticleRecommendationMetrics())

        expect(mockUseArticleRecommendations).toHaveBeenCalledWith(
            expect.objectContaining({ channel: 'email' }),
        )
    })

    it('omits store_integration_id and channel when filters are not set', () => {
        renderHook(() => useArticleRecommendationMetrics())

        const params = mockUseArticleRecommendations.mock.calls[0][0]
        expect(params).not.toHaveProperty('store_integration_id')
        expect(params).not.toHaveProperty('channel')
    })
})

describe('fetchArticleRecommendationMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchArticleRecommendations.mockResolvedValue({
            data: { data: mockApiItems },
        })
        mockGetCsvFileNameWithDates.mockReturnValue(
            '2024-01-01_2024-01-31_article_recommendation_table',
        )
        mockCreateCsv.mockReturnValue('csv-content')
    })

    it('returns CSV content when API returns data', async () => {
        const result =
            await fetchArticleRecommendationMetrics(MOCK_STATS_FILTERS)

        expect(result.files[result.fileName]).toBe('csv-content')
    })

    it('returns empty file content when API returns no items', async () => {
        mockFetchArticleRecommendations.mockResolvedValue({
            data: { data: [] },
        })

        const result =
            await fetchArticleRecommendationMetrics(MOCK_STATS_FILTERS)

        expect(result.files[result.fileName]).toBe('')
    })

    it('returns fileName from getCsvFileNameWithDates', async () => {
        const result =
            await fetchArticleRecommendationMetrics(MOCK_STATS_FILTERS)

        expect(result.fileName).toBe(
            '2024-01-01_2024-01-31_article_recommendation_table',
        )
    })

    it('uses article title as display name in CSV rows', async () => {
        await fetchArticleRecommendationMetrics(MOCK_STATS_FILTERS)

        const csvCallArgs = mockCreateCsv.mock.calls[0][0]
        expect(csvCallArgs[1][0]).toBe('How to return an item')
    })

    it('passes period start/end datetime to fetchArticleRecommendations', async () => {
        await fetchArticleRecommendationMetrics(MOCK_STATS_FILTERS)

        expect(mockFetchArticleRecommendations).toHaveBeenCalledWith(
            expect.objectContaining({
                start_datetime: MOCK_PERIOD.start_datetime,
                end_datetime: MOCK_PERIOD.end_datetime,
            }),
        )
    })
})
