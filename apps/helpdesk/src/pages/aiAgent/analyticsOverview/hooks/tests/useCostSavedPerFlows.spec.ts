import { renderHook } from '@testing-library/react'

import {
    fetchCostSavedPerFlows,
    useCostSavedPerFlows,
} from '../useCostSavedPerFlows'

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useStatsMetricPerDimension: jest.fn(),
    fetchStatsMetricPerDimension: jest.fn(),
    mapMetricValues: jest.fn((metric, transform) => ({
        ...metric,
        data: metric.data
            ? {
                  ...metric.data,
                  value: transform(metric.data.value),
                  allValues: (metric.data.allValues ?? []).map(
                      (v: {
                          dimension: string
                          value: number | null
                          decile: null
                      }) => ({
                          ...v,
                          value: transform(v.value),
                      }),
                  ),
              }
            : null,
    })),
}))
jest.mock(
    'domains/reporting/models/scopes/overallAutomatedInteractions',
    () => ({
        automatedInteractionsPerFlowsQueryFactoryV2: jest.fn(),
    }),
)
jest.mock(
    'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate',
    () => ({ useMoneySavedPerInteractionWithAutomate: jest.fn() }),
)
jest.mock('pages/automate/automate-metrics/constants', () => ({
    AGENT_COST_PER_TICKET: 3.1,
}))

const mockUseStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).useStatsMetricPerDimension as jest.Mock

const mockFetchStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).fetchStatsMetricPerDimension as jest.Mock

const mockUseMoneySaved = jest.requireMock(
    'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate',
).useMoneySavedPerInteractionWithAutomate as jest.Mock

const mockQueryFactory = jest.requireMock(
    'domains/reporting/models/scopes/overallAutomatedInteractions',
).automatedInteractionsPerFlowsQueryFactoryV2 as jest.Mock

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'
const MOCK_QUERY = { metricName: 'ai-agent-automated-interactions-per-flows' }
const COST_PER_INTERACTION = 3.1

const rawAllValues = [
    { dimension: 'flow-seed-10', value: 1200, decile: null },
    { dimension: 'flow-seed-25', value: 800, decile: null },
    { dimension: 'flow-seed-6', value: 500, decile: null },
    { dimension: 'flow-seed-9', value: 300, decile: null },
]

describe('useCostSavedPerFlows', () => {
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
    })

    it('calls the query factory with filters and timezone', () => {
        renderHook(() =>
            useCostSavedPerFlows(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('multiplies each entity value by costSavedPerInteraction', () => {
        const { result } = renderHook(() =>
            useCostSavedPerFlows(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        const allValues = result.current.data?.allValues ?? []
        expect(
            allValues.find((v) => v.dimension === 'flow-seed-10')?.value,
        ).toBe(1200 * COST_PER_INTERACTION)
        expect(
            allValues.find((v) => v.dimension === 'flow-seed-25')?.value,
        ).toBe(800 * COST_PER_INTERACTION)
        expect(
            allValues.find((v) => v.dimension === 'flow-seed-6')?.value,
        ).toBe(500 * COST_PER_INTERACTION)
        expect(
            allValues.find((v) => v.dimension === 'flow-seed-9')?.value,
        ).toBe(300 * COST_PER_INTERACTION)
    })

    it('returns null for null values without multiplying', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: [
                    { dimension: 'flow-seed-10', value: null, decile: null },
                ],
            },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() =>
            useCostSavedPerFlows(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(
            result.current.data?.allValues?.find(
                (v) => v.dimension === 'flow-seed-10',
            )?.value,
        ).toBeNull()
    })

    it('returns isFetching true when data is loading', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() =>
            useCostSavedPerFlows(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
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
            useCostSavedPerFlows(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchCostSavedPerFlows', () => {
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
    })

    it('calls the query factory with filters and timezone', async () => {
        await fetchCostSavedPerFlows(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            COST_PER_INTERACTION,
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('multiplies each entity value by the provided cost per interaction', async () => {
        const result = await fetchCostSavedPerFlows(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            COST_PER_INTERACTION,
        )

        const allValues = result.data?.allValues ?? []
        expect(
            allValues.find((v) => v.dimension === 'flow-seed-10')?.value,
        ).toBe(1200 * COST_PER_INTERACTION)
        expect(
            allValues.find((v) => v.dimension === 'flow-seed-25')?.value,
        ).toBe(800 * COST_PER_INTERACTION)
    })

    it('uses AGENT_COST_PER_TICKET as default cost per interaction', async () => {
        const result = await fetchCostSavedPerFlows(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        const allValues = result.data?.allValues ?? []
        expect(
            allValues.find((v) => v.dimension === 'flow-seed-10')?.value,
        ).toBe(1200 * 3.1)
    })
})
