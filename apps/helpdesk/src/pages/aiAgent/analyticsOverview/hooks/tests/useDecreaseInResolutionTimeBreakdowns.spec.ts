import { assumeMock, renderHook } from '@repo/testing'

import {
    createMetricPerDimensionHooks,
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import {
    overallDecreaseInResolutionTimePerFeatureQueryV2Factory,
    overallDecreaseInResolutionTimePerFlowsQueryV2Factory,
    overallDecreaseInResolutionTimePerOrderManagementTypeQueryV2Factory,
} from 'domains/reporting/models/scopes/overallDecreaseInResolutionTime'
import {
    fetchDecreaseInResolutionTimePerFeature,
    fetchDecreaseInResolutionTimePerFlows,
    fetchDecreaseInResolutionTimePerOrderManagementType,
    useDecreaseInResolutionTimePerFeature,
    useDecreaseInResolutionTimePerFlows,
    useDecreaseInResolutionTimePerOrderManagementType,
} from '../useDecreaseInResolutionTimeBreakdowns'

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
    'domains/reporting/models/scopes/overallDecreaseInResolutionTime',
    () => ({
        overallDecreaseInResolutionTimePerFeatureQueryV2Factory: jest.fn(),
        overallDecreaseInResolutionTimePerFlowsQueryV2Factory: jest.fn(),
        overallDecreaseInResolutionTimePerOrderManagementTypeQueryV2Factory:
            jest.fn(),
    }),
)

assumeMock(createMetricPerDimensionHooks)
const mockUseStatsMetricPerDimension = assumeMock(useStatsMetricPerDimension)
const mockFetchStatsMetricPerDimension = assumeMock(
    fetchStatsMetricPerDimension,
)
const mockPerFeatureFactory = assumeMock(
    overallDecreaseInResolutionTimePerFeatureQueryV2Factory,
)
const mockPerFlowsFactory = assumeMock(
    overallDecreaseInResolutionTimePerFlowsQueryV2Factory,
)
const mockPerOrderManagementTypeFactory = assumeMock(
    overallDecreaseInResolutionTimePerOrderManagementTypeQueryV2Factory,
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

describe('decreaseInResolutionTimePerFeature', () => {
    beforeEach(() => {
        mockPerFeatureFactory.mockReturnValue(MOCK_QUERY)
        mockUseStatsMetricPerDimension.mockReturnValue(MOCK_RESULT)
        mockFetchStatsMetricPerDimension.mockResolvedValue(MOCK_RESULT)
    })

    it('calls the factory with filters, timezone, and automationFeatureType dimension', () => {
        renderHook(() =>
            useDecreaseInResolutionTimePerFeature(MOCK_FILTERS, MOCK_TIMEZONE),
        )

        expect(mockPerFeatureFactory).toHaveBeenCalledWith({
            filters: MOCK_FILTERS,
            timezone: MOCK_TIMEZONE,
            dimensions: ['automationFeatureType'],
        })
    })

    it('passes the built query to useStatsMetricPerDimension', () => {
        renderHook(() =>
            useDecreaseInResolutionTimePerFeature(MOCK_FILTERS, MOCK_TIMEZONE),
        )

        expect(mockUseStatsMetricPerDimension).toHaveBeenCalledWith(MOCK_QUERY)
    })

    it('passes the built query to fetchStatsMetricPerDimension', async () => {
        await fetchDecreaseInResolutionTimePerFeature(
            MOCK_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(mockFetchStatsMetricPerDimension).toHaveBeenCalledWith(
            MOCK_QUERY,
        )
    })
})

describe('decreaseInResolutionTimePerFlows', () => {
    beforeEach(() => {
        mockPerFlowsFactory.mockReturnValue(MOCK_QUERY)
        mockUseStatsMetricPerDimension.mockReturnValue(MOCK_RESULT)
        mockFetchStatsMetricPerDimension.mockResolvedValue(MOCK_RESULT)
    })

    it('calls the factory with filters, timezone, and flowId dimension', () => {
        renderHook(() =>
            useDecreaseInResolutionTimePerFlows(MOCK_FILTERS, MOCK_TIMEZONE),
        )

        expect(mockPerFlowsFactory).toHaveBeenCalledWith({
            filters: MOCK_FILTERS,
            timezone: MOCK_TIMEZONE,
            dimensions: ['flowId'],
        })
    })

    it('passes the built query to useStatsMetricPerDimension', () => {
        renderHook(() =>
            useDecreaseInResolutionTimePerFlows(MOCK_FILTERS, MOCK_TIMEZONE),
        )

        expect(mockUseStatsMetricPerDimension).toHaveBeenCalledWith(MOCK_QUERY)
    })

    it('passes the built query to fetchStatsMetricPerDimension', async () => {
        await fetchDecreaseInResolutionTimePerFlows(MOCK_FILTERS, MOCK_TIMEZONE)

        expect(mockFetchStatsMetricPerDimension).toHaveBeenCalledWith(
            MOCK_QUERY,
        )
    })
})

describe('decreaseInResolutionTimePerOrderManagementType', () => {
    beforeEach(() => {
        mockPerOrderManagementTypeFactory.mockReturnValue(MOCK_QUERY)
        mockUseStatsMetricPerDimension.mockReturnValue(MOCK_RESULT)
        mockFetchStatsMetricPerDimension.mockResolvedValue(MOCK_RESULT)
    })

    it('calls the factory with filters, timezone, and orderManagementType dimension', () => {
        renderHook(() =>
            useDecreaseInResolutionTimePerOrderManagementType(
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
            useDecreaseInResolutionTimePerOrderManagementType(
                MOCK_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(mockUseStatsMetricPerDimension).toHaveBeenCalledWith(MOCK_QUERY)
    })

    it('passes the built query to fetchStatsMetricPerDimension', async () => {
        await fetchDecreaseInResolutionTimePerOrderManagementType(
            MOCK_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(mockFetchStatsMetricPerDimension).toHaveBeenCalledWith(
            MOCK_QUERY,
        )
    })
})
