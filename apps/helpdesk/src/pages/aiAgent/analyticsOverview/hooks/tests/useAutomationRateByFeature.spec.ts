import { renderHook } from '@repo/testing'

import {
    fetchAutomationRateByFeatureData,
    useAutomationRateByFeature,
} from '../useAutomationRateByFeature'

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useStatsMetricPerDimension: jest.fn(),
    fetchStatsMetricPerDimension: jest.fn(),
}))
jest.mock('domains/reporting/models/scopes/overallAutomationRate', () => {
    const actual = jest.requireActual(
        'domains/reporting/models/scopes/overallAutomationRate',
    )
    return {
        ...actual,
        automationRatePerFeatureQueryFactoryV2: jest.fn(),
    }
})

const mockUseAiAgentStatsFilters = jest.requireMock(
    'pages/aiAgent/hooks/useAiAgentStatsFilters',
).useAiAgentStatsFilters as jest.Mock
const mockUseStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).useStatsMetricPerDimension as jest.Mock
const mockFetchStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).fetchStatsMetricPerDimension as jest.Mock
const mockAutomationRatePerFeatureQueryFactoryV2 = jest.requireMock(
    'domains/reporting/models/scopes/overallAutomationRate',
).automationRatePerFeatureQueryFactoryV2 as jest.Mock

const defaultAllValues = [
    { dimension: 'ai-agent', value: 30, decile: null },
    { dimension: 'flow', value: 20, decile: null },
    { dimension: 'order-management', value: 10, decile: null },
    { dimension: 'article-recommendation', value: 15, decile: null },
]

describe('useAutomationRateByFeature', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: {},
            userTimezone: 'UTC',
        })
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: defaultAllValues,
            },
            isFetching: false,
            isError: false,
        })
    })

    it('should return chart data with correct feature names', () => {
        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data?.map((item) => item.name)).toEqual([
            'AI Agent',
            'Flows',
            'Order Management',
            'Article Recommendation',
        ])
    })

    it('should preserve values from the response', () => {
        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toEqual([
            { name: 'AI Agent', value: 30 },
            { name: 'Flows', value: 20 },
            { name: 'Order Management', value: 10 },
            { name: 'Article Recommendation', value: 15 },
        ])
    })

    it('should filter out unknown dimensions', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: [
                    ...defaultAllValues,
                    { dimension: 'unknown-feature', value: 99, decile: null },
                ],
            },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toHaveLength(4)
        expect(result.current.data?.map((item) => item.name)).not.toContain(
            'unknown-feature',
        )
    })

    it('should return isLoading true when response is fetching', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isError true when response has error', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: false,
            isError: true,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.isError).toBe(true)
    })

    it('should return empty data when response data is null', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toEqual([])
    })

    it('should handle null values in dimension data', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: [
                    { dimension: 'ai-agent', value: null, decile: null },
                ],
            },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toEqual([{ name: 'AI Agent', value: null }])
    })

    it('should return isLoading false and isError false when all data is available', () => {
        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })
})

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'
const MOCK_QUERY = { metricName: 'automation-rate-per-feature' }

const fetchAllValues = [
    { dimension: 'ai-agent', value: 18 },
    { dimension: 'flow', value: 7 },
    { dimension: 'article-recommendation', value: 4 },
    { dimension: 'order-management', value: 3 },
]

describe('fetchAutomationRateByFeatureData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockAutomationRatePerFeatureQueryFactoryV2.mockReturnValue(MOCK_QUERY)
        mockFetchStatsMetricPerDimension.mockResolvedValue({
            data: { allValues: fetchAllValues },
        })
    })

    it('calls the query factory with filters and timezone', async () => {
        await fetchAutomationRateByFeatureData(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(mockAutomationRatePerFeatureQueryFactoryV2).toHaveBeenCalledWith(
            {
                filters: MOCK_STATS_FILTERS,
                timezone: MOCK_TIMEZONE,
            },
        )
    })

    it('passes the query result and dimension key to fetchStatsMetricPerDimension', async () => {
        await fetchAutomationRateByFeatureData(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(mockFetchStatsMetricPerDimension).toHaveBeenCalledWith(
            MOCK_QUERY,
            'automationFeatureType',
        )
    })

    it('returns the result from fetchStatsMetricPerDimension', async () => {
        const result = await fetchAutomationRateByFeatureData(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result?.data?.allValues).toEqual(fetchAllValues)
    })
})
