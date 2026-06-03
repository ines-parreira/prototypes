import { renderHook } from '@repo/testing'

import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    TicketInsightsTaskDimension,
    TicketInsightsTaskDimensionV2,
    TicketInsightsTaskMeasure,
    TicketInsightsTaskMeasureV2,
} from 'domains/reporting/models/cubes/TicketInsightsTaskCube'
import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'

import { useGuidanceReferencesTicketCounts } from '../useGuidanceReferencesTicketCounts'

jest.mock('domains/reporting/hooks/useMetricPerDimension', () => ({
    useMetricPerDimensionV2: jest.fn(),
}))

jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
    () => {
        const actual = jest.requireActual(
            'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
        )
        return {
            ...actual,
            getLast28DaysDateRange: jest.fn(),
        }
    },
)

const mockUseMetricPerDimensionV2 = useMetricPerDimensionV2 as jest.Mock
const mockGetLast28DaysDateRange = getLast28DaysDateRange as jest.Mock

const defaultMetricResult = {
    isFetching: false,
    isError: false,
    data: { allData: [] },
}

const defaultParams = {
    guidanceSourceIds: ['101', '102'],
    resourceSourceSetId: 7,
    shopIntegrationId: 42,
    timezone: 'Europe/Paris',
}

describe('useGuidanceReferencesTicketCounts', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockGetLast28DaysDateRange.mockReturnValue({
            start_datetime: '2024-01-01T00:00:00Z',
            end_datetime: '2024-01-28T23:59:59Z',
        })
        mockUseMetricPerDimensionV2.mockReturnValue(defaultMetricResult)
    })

    it('returns an empty map when there is no data', () => {
        const { result } = renderHook(() =>
            useGuidanceReferencesTicketCounts(defaultParams),
        )

        expect(result.current.countsBySourceId).toEqual({})
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('aggregates counts from V2 dimension and measure keys', () => {
        mockUseMetricPerDimensionV2.mockReturnValue({
            ...defaultMetricResult,
            data: {
                allData: [
                    {
                        [TicketInsightsTaskDimensionV2.ResourceSourceId]: '101',
                        [TicketInsightsTaskMeasureV2.TicketCount]: 12,
                    },
                    {
                        [TicketInsightsTaskDimensionV2.ResourceSourceId]: '102',
                        [TicketInsightsTaskMeasureV2.TicketCount]: 5,
                    },
                ],
            },
        })

        const { result } = renderHook(() =>
            useGuidanceReferencesTicketCounts(defaultParams),
        )

        expect(result.current.countsBySourceId).toEqual({
            '101': 12,
            '102': 5,
        })
    })

    it('falls back to V1 dimension and measure keys when V2 keys are missing', () => {
        mockUseMetricPerDimensionV2.mockReturnValue({
            ...defaultMetricResult,
            data: {
                allData: [
                    {
                        [TicketInsightsTaskDimension.ResourceSourceId]: '101',
                        [TicketInsightsTaskMeasure.TicketCount]: 7,
                    },
                ],
            },
        })

        const { result } = renderHook(() =>
            useGuidanceReferencesTicketCounts(defaultParams),
        )

        expect(result.current.countsBySourceId).toEqual({ '101': 7 })
    })

    it('skips records without a source id', () => {
        mockUseMetricPerDimensionV2.mockReturnValue({
            ...defaultMetricResult,
            data: {
                allData: [
                    {
                        [TicketInsightsTaskMeasureV2.TicketCount]: 9,
                    },
                    {
                        [TicketInsightsTaskDimensionV2.ResourceSourceId]: '101',
                        [TicketInsightsTaskMeasureV2.TicketCount]: 3,
                    },
                ],
            },
        })

        const { result } = renderHook(() =>
            useGuidanceReferencesTicketCounts(defaultParams),
        )

        expect(result.current.countsBySourceId).toEqual({ '101': 3 })
    })

    it('coerces non-numeric counts to zero', () => {
        mockUseMetricPerDimensionV2.mockReturnValue({
            ...defaultMetricResult,
            data: {
                allData: [
                    {
                        [TicketInsightsTaskDimensionV2.ResourceSourceId]: '101',
                        [TicketInsightsTaskMeasureV2.TicketCount]:
                            'not-a-number',
                    },
                ],
            },
        })

        const { result } = renderHook(() =>
            useGuidanceReferencesTicketCounts(defaultParams),
        )

        expect(result.current.countsBySourceId).toEqual({ '101': 0 })
    })

    it('reports loading state when the underlying query is fetching', () => {
        mockUseMetricPerDimensionV2.mockReturnValue({
            ...defaultMetricResult,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useGuidanceReferencesTicketCounts(defaultParams),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('reports error state when the underlying query errors', () => {
        mockUseMetricPerDimensionV2.mockReturnValue({
            ...defaultMetricResult,
            isError: true,
        })

        const { result } = renderHook(() =>
            useGuidanceReferencesTicketCounts(defaultParams),
        )

        expect(result.current.isError).toBe(true)
    })

    it('disables the query and reports not loading when no guidance source ids are provided', () => {
        mockUseMetricPerDimensionV2.mockReturnValue({
            ...defaultMetricResult,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useGuidanceReferencesTicketCounts({
                ...defaultParams,
                guidanceSourceIds: [],
            }),
        )

        expect(mockUseMetricPerDimensionV2).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            undefined,
            false,
        )
        expect(result.current.isLoading).toBe(false)
    })

    it('disables the query when resourceSourceSetId is zero', () => {
        renderHook(() =>
            useGuidanceReferencesTicketCounts({
                ...defaultParams,
                resourceSourceSetId: 0,
            }),
        )

        expect(mockUseMetricPerDimensionV2).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            undefined,
            false,
        )
    })

    it('disables the query when shopIntegrationId is zero', () => {
        renderHook(() =>
            useGuidanceReferencesTicketCounts({
                ...defaultParams,
                shopIntegrationId: 0,
            }),
        )

        expect(mockUseMetricPerDimensionV2).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            undefined,
            false,
        )
    })

    it('disables the query when enabled is false', () => {
        renderHook(() =>
            useGuidanceReferencesTicketCounts({
                ...defaultParams,
                enabled: false,
            }),
        )

        expect(mockUseMetricPerDimensionV2).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            undefined,
            false,
        )
    })

    it('enables the query when all inputs are valid', () => {
        renderHook(() => useGuidanceReferencesTicketCounts(defaultParams))

        expect(mockUseMetricPerDimensionV2).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            undefined,
            true,
        )
    })
})
