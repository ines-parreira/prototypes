import { assumeMock, renderHook } from '@repo/testing'

import {
    useSupportInteractionsPerIntent,
    useSupportInteractionsTotal,
} from 'domains/reporting/hooks/ai-agent-insights/supportInteractionsMetrics'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    supportInteractionsPerIntentQueryFactory,
    supportInteractionsTotalQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-agent-insights/supportInteractionsMetrics'

jest.mock('domains/reporting/hooks/useMetric')
jest.mock('domains/reporting/hooks/useMetricPerDimension')
jest.mock(
    'domains/reporting/models/queryFactories/ai-agent-insights/supportInteractionsMetrics',
)

const useMetricMock = assumeMock(useMetric)
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const supportInteractionsTotalQueryFactoryMock = assumeMock(
    supportInteractionsTotalQueryFactory,
)
const supportInteractionsPerIntentQueryFactoryMock = assumeMock(
    supportInteractionsPerIntentQueryFactory,
)

describe('supportInteractionsMetrics hooks', () => {
    const mockFilters = {
        period: {
            start_datetime: '2021-01-01T00:00:00Z',
            end_datetime: '2021-01-31T00:00:00Z',
        },
    }
    const mockTimezone = 'UTC'
    const mockOutcomeCustomFieldId = 123
    const mockIntentCustomFieldId = 456

    const mockQuery = {
        measures: ['testMeasure'],
        dimensions: [],
        filters: [],
        metricName: 'test-metric',
    } as any

    beforeEach(() => {
        jest.clearAllMocks()
        supportInteractionsTotalQueryFactoryMock.mockReturnValue(mockQuery)
        supportInteractionsPerIntentQueryFactoryMock.mockReturnValue(mockQuery)
    })

    describe('useSupportInteractionsTotal', () => {
        const mockResponse = {
            isFetching: false,
            isError: false,
            data: { value: 100 },
        } as any

        beforeEach(() => {
            useMetricMock.mockReturnValue(mockResponse)
        })

        it('should call supportInteractionsTotalQueryFactory with correct parameters', () => {
            renderHook(() =>
                useSupportInteractionsTotal(
                    mockFilters,
                    mockTimezone,
                    mockOutcomeCustomFieldId,
                    mockIntentCustomFieldId,
                ),
            )

            expect(
                supportInteractionsTotalQueryFactoryMock,
            ).toHaveBeenCalledWith(
                mockFilters,
                mockTimezone,
                mockOutcomeCustomFieldId,
                mockIntentCustomFieldId,
            )
        })

        it('should call useMetric with the query from factory', () => {
            renderHook(() =>
                useSupportInteractionsTotal(
                    mockFilters,
                    mockTimezone,
                    mockOutcomeCustomFieldId,
                    mockIntentCustomFieldId,
                ),
            )

            expect(useMetricMock).toHaveBeenCalledWith(mockQuery)
        })

        it('should return the result from useMetric', () => {
            const { result } = renderHook(() =>
                useSupportInteractionsTotal(
                    mockFilters,
                    mockTimezone,
                    mockOutcomeCustomFieldId,
                    mockIntentCustomFieldId,
                ),
            )

            expect(result.current).toBe(mockResponse)
        })

        it('should handle loading state', () => {
            const loadingResponse = {
                isFetching: true,
                isError: false,
                data: undefined,
            } as any

            useMetricMock.mockReturnValue(loadingResponse)

            const { result } = renderHook(() =>
                useSupportInteractionsTotal(
                    mockFilters,
                    mockTimezone,
                    mockOutcomeCustomFieldId,
                    mockIntentCustomFieldId,
                ),
            )

            expect(result.current.isFetching).toBe(true)
            expect(result.current.data).toBeUndefined()
        })

        it('should handle error state', () => {
            const errorResponse = {
                isFetching: false,
                isError: true,
                data: undefined,
            } as any

            useMetricMock.mockReturnValue(errorResponse)

            const { result } = renderHook(() =>
                useSupportInteractionsTotal(
                    mockFilters,
                    mockTimezone,
                    mockOutcomeCustomFieldId,
                    mockIntentCustomFieldId,
                ),
            )

            expect(result.current.isError).toBe(true)
        })

        it('should pass different filters correctly', () => {
            const differentFilters = {
                period: {
                    start_datetime: '2022-06-01T00:00:00Z',
                    end_datetime: '2022-06-30T00:00:00Z',
                },
            }

            renderHook(() =>
                useSupportInteractionsTotal(
                    differentFilters,
                    'America/New_York',
                    999,
                    888,
                ),
            )

            expect(
                supportInteractionsTotalQueryFactoryMock,
            ).toHaveBeenCalledWith(
                differentFilters,
                'America/New_York',
                999,
                888,
            )
        })
    })

    describe('useSupportInteractionsPerIntent', () => {
        const mockPerDimensionResponse = {
            isFetching: false,
            isError: false,
            data: {
                value: 50,
                allData: [{ dimension: 'Intent1', value: 50 }],
                allValues: [{ dimension: 'Intent1', value: 50 }],
            },
        } as any

        beforeEach(() => {
            useMetricPerDimensionMock.mockReturnValue(mockPerDimensionResponse)
        })

        it('should call supportInteractionsPerIntentQueryFactory with correct parameters', () => {
            renderHook(() =>
                useSupportInteractionsPerIntent(
                    mockFilters,
                    mockTimezone,
                    mockOutcomeCustomFieldId,
                    mockIntentCustomFieldId,
                ),
            )

            expect(
                supportInteractionsPerIntentQueryFactoryMock,
            ).toHaveBeenCalledWith(
                mockFilters,
                mockTimezone,
                mockOutcomeCustomFieldId,
                mockIntentCustomFieldId,
            )
        })

        it('should call useMetricPerDimension with the query from factory', () => {
            renderHook(() =>
                useSupportInteractionsPerIntent(
                    mockFilters,
                    mockTimezone,
                    mockOutcomeCustomFieldId,
                    mockIntentCustomFieldId,
                ),
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(mockQuery)
        })

        it('should return the result from useMetricPerDimension', () => {
            const { result } = renderHook(() =>
                useSupportInteractionsPerIntent(
                    mockFilters,
                    mockTimezone,
                    mockOutcomeCustomFieldId,
                    mockIntentCustomFieldId,
                ),
            )

            expect(result.current).toBe(mockPerDimensionResponse)
        })

        it('should handle loading state', () => {
            const loadingResponse = {
                isFetching: true,
                isError: false,
                data: undefined,
            } as any

            useMetricPerDimensionMock.mockReturnValue(loadingResponse)

            const { result } = renderHook(() =>
                useSupportInteractionsPerIntent(
                    mockFilters,
                    mockTimezone,
                    mockOutcomeCustomFieldId,
                    mockIntentCustomFieldId,
                ),
            )

            expect(result.current.isFetching).toBe(true)
            expect(result.current.data).toBeUndefined()
        })

        it('should handle error state', () => {
            const errorResponse = {
                isFetching: false,
                isError: true,
                data: undefined,
            } as any

            useMetricPerDimensionMock.mockReturnValue(errorResponse)

            const { result } = renderHook(() =>
                useSupportInteractionsPerIntent(
                    mockFilters,
                    mockTimezone,
                    mockOutcomeCustomFieldId,
                    mockIntentCustomFieldId,
                ),
            )

            expect(result.current.isError).toBe(true)
        })

        it('should pass different filters correctly', () => {
            const differentFilters = {
                period: {
                    start_datetime: '2022-06-01T00:00:00Z',
                    end_datetime: '2022-06-30T00:00:00Z',
                },
            }

            renderHook(() =>
                useSupportInteractionsPerIntent(
                    differentFilters,
                    'America/New_York',
                    999,
                    888,
                ),
            )

            expect(
                supportInteractionsPerIntentQueryFactoryMock,
            ).toHaveBeenCalledWith(
                differentFilters,
                'America/New_York',
                999,
                888,
            )
        })
    })
})
