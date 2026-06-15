import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchStatsMetricPerDimension,
    mapMetricValues,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { dynamicOverallAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import {
    fetchCostSavedPerStore,
    useCostSavedPerStore,
} from '../useCostSavedPerStore'

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension')
jest.mock('domains/reporting/models/scopes/overallAutomatedInteractions')
jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')
jest.mock('pages/automate/automate-metrics/constants', () => ({
    AGENT_COST_PER_TICKET: 3.1,
}))

const mockUseStatsMetricPerDimension = assumeMock(useStatsMetricPerDimension)
const mockFetchStatsMetricPerDimension = assumeMock(
    fetchStatsMetricPerDimension,
)
const mockMapMetricValues = assumeMock(mapMetricValues)
const mockUseMoneySaved = assumeMock(useMoneySavedPerInteractionWithAutomate)
const mockQueryFactory = assumeMock(
    dynamicOverallAutomatedInteractionsQueryFactoryV2,
)

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'
const MOCK_QUERY = {
    metricName: 'ai-agent-dynamic-automated-interactions',
    dimensions: ['storeIntegrationId'],
} as any
const COST_PER_INTERACTION = 3.1

const rawAllValues = [
    { dimension: '1', value: 1200, decile: null },
    { dimension: '2', value: 800, decile: null },
]

describe('useCostSavedPerStore', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockQueryFactory.mockReturnValue(MOCK_QUERY)
        mockUseMoneySaved.mockReturnValue(COST_PER_INTERACTION)
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: rawAllValues,
            },
            isFetching: false,
            isError: false,
        })
        mockMapMetricValues.mockImplementation((metric, transform) => ({
            ...metric,
            data: metric.data
                ? {
                      ...metric.data,
                      value: transform(metric.data.value),
                      allValues: (metric.data.allValues ?? []).map(
                          (v: {
                              dimension: string | number
                              value: number | null
                              decile: number | null
                          }) => ({
                              ...v,
                              value: transform(v.value),
                          }),
                      ),
                  }
                : null,
        }))
    })

    it('calls the query factory with filters, timezone, and storeIntegrationId dimension', () => {
        renderHook(() =>
            useCostSavedPerStore(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
            dimensions: ['storeIntegrationId'],
        })
    })

    it('multiplies each entity value by costSavedPerInteraction', () => {
        const { result } = renderHook(() =>
            useCostSavedPerStore(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        const allValues = result.current.data?.allValues ?? []
        expect(allValues.find((v) => v.dimension === '1')?.value).toBe(
            1200 * COST_PER_INTERACTION,
        )
        expect(allValues.find((v) => v.dimension === '2')?.value).toBe(
            800 * COST_PER_INTERACTION,
        )
    })

    it('returns null for null values without multiplying', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: [{ dimension: '1', value: null, decile: null }],
            },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() =>
            useCostSavedPerStore(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(
            result.current.data?.allValues?.find((v) => v.dimension === '1')
                ?.value,
        ).toBeNull()
    })

    it('returns isFetching true when data is loading', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() =>
            useCostSavedPerStore(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('returns isError true when the request fails', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: false,
            isError: true,
        })

        const { result } = renderHook(() =>
            useCostSavedPerStore(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchCostSavedPerStore', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockQueryFactory.mockReturnValue(MOCK_QUERY)
        mockFetchStatsMetricPerDimension.mockResolvedValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: rawAllValues,
            },
            isFetching: false,
            isError: false,
        })
        mockMapMetricValues.mockImplementation((metric, transform) => ({
            ...metric,
            data: metric.data
                ? {
                      ...metric.data,
                      value: transform(metric.data.value),
                      allValues: (metric.data.allValues ?? []).map(
                          (v: {
                              dimension: string | number
                              value: number | null
                              decile: number | null
                          }) => ({
                              ...v,
                              value: transform(v.value),
                          }),
                      ),
                  }
                : null,
        }))
    })

    it('calls the query factory with filters, timezone, and storeIntegrationId dimension', async () => {
        await fetchCostSavedPerStore(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            COST_PER_INTERACTION,
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
            dimensions: ['storeIntegrationId'],
        })
    })

    it('multiplies each entity value by the provided cost per interaction', async () => {
        const result = await fetchCostSavedPerStore(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            COST_PER_INTERACTION,
        )

        const allValues = result.data?.allValues ?? []
        expect(allValues.find((v) => v.dimension === '1')?.value).toBe(
            1200 * COST_PER_INTERACTION,
        )
        expect(allValues.find((v) => v.dimension === '2')?.value).toBe(
            800 * COST_PER_INTERACTION,
        )
    })

    it('uses AGENT_COST_PER_TICKET as default cost per interaction', async () => {
        const result = await fetchCostSavedPerStore(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        const allValues = result.data?.allValues ?? []
        expect(allValues.find((v) => v.dimension === '1')?.value).toBe(
            1200 * 3.1,
        )
    })
})
