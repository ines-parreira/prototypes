import { renderHook } from '@repo/testing'

import {
    fetchCostSavedPerFeature,
    useCostSavedPerFeature,
} from '../useCostSavedPerFeature'

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useStatsMetricPerDimension: jest.fn(),
    fetchStatsMetricPerDimension: jest.fn(),
    mapMetricValues: jest.fn(),
}))
jest.mock(
    'domains/reporting/models/scopes/overallAutomatedInteractions',
    () => ({
        automatedInteractionsPerFeatureQueryFactoryV2: jest.fn(),
    }),
)
jest.mock('pages/automate/automate-metrics/constants', () => ({
    AGENT_COST_PER_TICKET: 3.1,
}))
jest.mock(
    'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate',
    () => ({
        useMoneySavedPerInteractionWithAutomate: jest.fn(),
    }),
)

const mockUseStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).useStatsMetricPerDimension as jest.Mock

const mockFetchStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).fetchStatsMetricPerDimension as jest.Mock

const mockMapMetricValues = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).mapMetricValues as jest.Mock

const mockQueryFactory = jest.requireMock(
    'domains/reporting/models/scopes/overallAutomatedInteractions',
).automatedInteractionsPerFeatureQueryFactoryV2 as jest.Mock

const mockUseMoneySavedPerInteraction = jest.requireMock(
    'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate',
).useMoneySavedPerInteractionWithAutomate as jest.Mock

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'
const MOCK_QUERY = { metricName: 'automated-interactions-per-feature' }
const MOCK_COST_PER_INTERACTION = 3.1

const automatedInteractionsResult = {
    data: {
        value: null,
        decile: null,
        allData: [],
        allValues: [
            { dimension: 'ai-agent', value: 1200, decile: null },
            { dimension: 'flow', value: 800, decile: null },
        ],
    },
    isFetching: false,
    isError: false,
}

const costSavedResult = {
    data: {
        value: null,
        decile: null,
        allData: [],
        allValues: [
            { dimension: 'ai-agent', value: 3720, decile: null },
            { dimension: 'flow', value: 2480, decile: null },
        ],
    },
    isFetching: false,
    isError: false,
}

describe('useCostSavedPerFeature', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockQueryFactory.mockReturnValue(MOCK_QUERY)
        mockUseMoneySavedPerInteraction.mockReturnValue(
            MOCK_COST_PER_INTERACTION,
        )
        mockUseStatsMetricPerDimension.mockReturnValue(
            automatedInteractionsResult,
        )
        mockMapMetricValues.mockReturnValue(costSavedResult)
    })

    it('calls the query factory with filters and timezone', () => {
        renderHook(() =>
            useCostSavedPerFeature(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('passes the query to useStatsMetricPerDimension', () => {
        renderHook(() =>
            useCostSavedPerFeature(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(mockUseStatsMetricPerDimension).toHaveBeenCalledWith(MOCK_QUERY)
    })

    it('applies cost multiplier via mapMetricValues', () => {
        renderHook(() =>
            useCostSavedPerFeature(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(mockMapMetricValues).toHaveBeenCalledWith(
            automatedInteractionsResult,
            expect.any(Function),
        )

        const transform = mockMapMetricValues.mock.calls[0][1]
        expect(transform(100)).toBe(100 * MOCK_COST_PER_INTERACTION)
        expect(transform(null)).toBeNull()
    })

    it('returns the mapped cost saved result', () => {
        const { result } = renderHook(() =>
            useCostSavedPerFeature(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(result.current).toBe(costSavedResult)
    })
})

describe('fetchCostSavedPerFeature', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockQueryFactory.mockReturnValue(MOCK_QUERY)
        mockFetchStatsMetricPerDimension.mockResolvedValue(
            automatedInteractionsResult,
        )
        mockMapMetricValues.mockReturnValue(costSavedResult)
    })

    it('calls the query factory with filters and timezone', async () => {
        await fetchCostSavedPerFeature(MOCK_STATS_FILTERS, MOCK_TIMEZONE)

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('passes the query to fetchStatsMetricPerDimension', async () => {
        await fetchCostSavedPerFeature(MOCK_STATS_FILTERS, MOCK_TIMEZONE)

        expect(mockFetchStatsMetricPerDimension).toHaveBeenCalledWith(
            MOCK_QUERY,
        )
    })

    it('applies cost multiplier via mapMetricValues', async () => {
        const customCost = 5.0
        await fetchCostSavedPerFeature(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            customCost,
        )

        const transform = mockMapMetricValues.mock.calls[0][1]
        expect(transform(100)).toBe(100 * customCost)
        expect(transform(null)).toBeNull()
    })

    it('uses AGENT_COST_PER_TICKET as default cost', async () => {
        await fetchCostSavedPerFeature(MOCK_STATS_FILTERS, MOCK_TIMEZONE)

        const transform = mockMapMetricValues.mock.calls[0][1]
        expect(transform(100)).toBe(100 * MOCK_COST_PER_INTERACTION)
    })
})
