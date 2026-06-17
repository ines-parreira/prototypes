import { assumeMock, renderHook } from '@repo/testing'

import {
    createMetricPerDimensionHooks,
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import {
    overallDecreaseInFirstResponseTimePerFeatureQueryV2Factory,
    overallDecreaseInFirstResponseTimePerFlowsQueryV2Factory,
    overallDecreaseInFirstResponseTimePerOrderManagementTypeQueryV2Factory,
} from 'domains/reporting/models/scopes/overallDecreaseInFirstResponseTime'
import {
    fetchDecreaseInFirstResponseTimePerFeature,
    fetchDecreaseInFirstResponseTimePerFlows,
    fetchDecreaseInFirstResponseTimePerOrderManagementType,
    useDecreaseInFirstResponseTimePerFeature,
    useDecreaseInFirstResponseTimePerFlows,
    useDecreaseInFirstResponseTimePerOrderManagementType,
} from '../useDecreaseInFirstResponseTimeBreakdowns'

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => {
    const mockUse = jest.fn()
    const mockFetch = jest.fn()
    return {
        useStatsMetricPerDimension: mockUse,
        fetchStatsMetricPerDimension: mockFetch,
        createMetricPerDimensionHooks: jest.fn(
            (factory: (ctx: unknown) => unknown, dimensions: string[]) => ({
                use: (filters: unknown, timezone: string) =>
                    mockUse(factory({ filters, timezone, dimensions })),
                fetch: (filters: unknown, timezone: string) =>
                    mockFetch(factory({ filters, timezone, dimensions })),
            }),
        ),
    }
})

jest.mock(
    'domains/reporting/models/scopes/overallDecreaseInFirstResponseTime',
    () => ({
        overallDecreaseInFirstResponseTimePerFeatureQueryV2Factory: jest.fn(),
        overallDecreaseInFirstResponseTimePerFlowsQueryV2Factory: jest.fn(),
        overallDecreaseInFirstResponseTimePerOrderManagementTypeQueryV2Factory:
            jest.fn(),
    }),
)

assumeMock(createMetricPerDimensionHooks)
const mockUseStatsMetricPerDimension = assumeMock(useStatsMetricPerDimension)
const mockFetchStatsMetricPerDimension = assumeMock(
    fetchStatsMetricPerDimension,
)
const mockPerFeatureFactory = assumeMock(
    overallDecreaseInFirstResponseTimePerFeatureQueryV2Factory,
)
const mockPerFlowsFactory = assumeMock(
    overallDecreaseInFirstResponseTimePerFlowsQueryV2Factory,
)
const mockPerOrderManagementTypeFactory = assumeMock(
    overallDecreaseInFirstResponseTimePerOrderManagementTypeQueryV2Factory,
)

const MOCK_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'
const MOCK_QUERY = {
    metricName: 'test-metric',
    dimensions: ['automationFeatureType'],
} as any
const MOCK_RESULT = {
    data: {
        value: null,
        decile: null,
        allData: [],
        allValues: [{ dimension: 'ai-agent', value: 3600, decile: null }],
    },
    isFetching: false,
    isError: false,
}

describe('decreaseInFirstResponseTimePerFeature', () => {
    beforeEach(() => {
        mockPerFeatureFactory.mockReturnValue(MOCK_QUERY)
        mockUseStatsMetricPerDimension.mockReturnValue(MOCK_RESULT)
        mockFetchStatsMetricPerDimension.mockResolvedValue(MOCK_RESULT)
    })

    it('calls the factory with filters, timezone, and automationFeatureType dimension', () => {
        renderHook(() =>
            useDecreaseInFirstResponseTimePerFeature(
                MOCK_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(mockPerFeatureFactory).toHaveBeenCalledWith({
            filters: MOCK_FILTERS,
            timezone: MOCK_TIMEZONE,
            dimensions: ['automationFeatureType'],
        })
    })

    it('passes the built query to useStatsMetricPerDimension', () => {
        renderHook(() =>
            useDecreaseInFirstResponseTimePerFeature(
                MOCK_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(mockUseStatsMetricPerDimension).toHaveBeenCalledWith(MOCK_QUERY)
    })

    it('passes the built query to fetchStatsMetricPerDimension', async () => {
        await fetchDecreaseInFirstResponseTimePerFeature(
            MOCK_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(mockFetchStatsMetricPerDimension).toHaveBeenCalledWith(
            MOCK_QUERY,
        )
    })
})

describe('decreaseInFirstResponseTimePerFlows', () => {
    beforeEach(() => {
        mockPerFlowsFactory.mockReturnValue(MOCK_QUERY)
        mockUseStatsMetricPerDimension.mockReturnValue(MOCK_RESULT)
        mockFetchStatsMetricPerDimension.mockResolvedValue(MOCK_RESULT)
    })

    it('calls the factory with filters, timezone, and flowId dimension', () => {
        renderHook(() =>
            useDecreaseInFirstResponseTimePerFlows(MOCK_FILTERS, MOCK_TIMEZONE),
        )

        expect(mockPerFlowsFactory).toHaveBeenCalledWith({
            filters: MOCK_FILTERS,
            timezone: MOCK_TIMEZONE,
            dimensions: ['flowId'],
        })
    })

    it('passes the built query to useStatsMetricPerDimension', () => {
        renderHook(() =>
            useDecreaseInFirstResponseTimePerFlows(MOCK_FILTERS, MOCK_TIMEZONE),
        )

        expect(mockUseStatsMetricPerDimension).toHaveBeenCalledWith(MOCK_QUERY)
    })

    it('passes the built query to fetchStatsMetricPerDimension', async () => {
        await fetchDecreaseInFirstResponseTimePerFlows(
            MOCK_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(mockFetchStatsMetricPerDimension).toHaveBeenCalledWith(
            MOCK_QUERY,
        )
    })
})

describe('decreaseInFirstResponseTimePerOrderManagementType', () => {
    beforeEach(() => {
        mockPerOrderManagementTypeFactory.mockReturnValue(MOCK_QUERY)
        mockUseStatsMetricPerDimension.mockReturnValue(MOCK_RESULT)
        mockFetchStatsMetricPerDimension.mockResolvedValue(MOCK_RESULT)
    })

    it('calls the factory with filters, timezone, and orderManagementType dimension', () => {
        renderHook(() =>
            useDecreaseInFirstResponseTimePerOrderManagementType(
                MOCK_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(mockPerOrderManagementTypeFactory).toHaveBeenCalledWith({
            filters: MOCK_FILTERS,
            timezone: MOCK_TIMEZONE,
            dimensions: ['orderManagementType'],
        })
    })

    it('passes the built query to useStatsMetricPerDimension', () => {
        renderHook(() =>
            useDecreaseInFirstResponseTimePerOrderManagementType(
                MOCK_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(mockUseStatsMetricPerDimension).toHaveBeenCalledWith(MOCK_QUERY)
    })

    it('passes the built query to fetchStatsMetricPerDimension', async () => {
        await fetchDecreaseInFirstResponseTimePerOrderManagementType(
            MOCK_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(mockFetchStatsMetricPerDimension).toHaveBeenCalledWith(
            MOCK_QUERY,
        )
    })
})
