import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { appQueryClient } from 'api/queryClient'
import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    assembleEntityRows,
    fetchEntityMetrics,
    fetchStatsMetricPerDimension,
    filterEntitiesWithData,
    mapMetricValues,
    selectMeasurePerDimension,
    toEntityMap,
    useEntityMetrics,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { fetchPostStats, usePostStats } from 'domains/reporting/models/queries'
import type { BuiltQuery } from 'domains/reporting/models/scopes/scope'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'

jest.mock('domains/reporting/models/queries')

const fetchPostStatsMock = assumeMock(fetchPostStats)
const usePostStatsMock = assumeMock(usePostStats)

describe('useStatsMetricPerDimension', () => {
    const query: BuiltQuery = {
        scope: MetricScope.TicketsClosed,
        dimensions: ['channel'],
        measures: ['automatedInteractions'],
        filters: [],
        metricName: METRIC_NAMES.TEST_METRIC,
    }

    const mockApiData = {
        data: {
            data: [
                { channel: '1', automatedInteractions: '100' },
                { channel: '2', automatedInteractions: '200' },
                { channel: '3', automatedInteractions: '300' },
                { channel: '4', automatedInteractions: '50' },
            ],
        },
    }

    beforeEach(() => {
        jest.resetAllMocks()
        appQueryClient.clear()
    })

    describe('selectMeasurePerDimension', () => {
        it('should return null values when data is null', () => {
            const result = selectMeasurePerDimension(null, query, '1')

            expect(result).toEqual({
                value: null,
                decile: null,
                allData: [],
                allValues: [],
                dimensions: ['channel'],
                measures: ['automatedInteractions'],
            })
        })

        it('should return null values when data is undefined', () => {
            const result = selectMeasurePerDimension(undefined, query, '1')

            expect(result).toEqual({
                value: null,
                decile: null,
                allData: [],
                allValues: [],
                dimensions: ['channel'],
                measures: ['automatedInteractions'],
            })
        })

        it('should return null values when measures array is empty', () => {
            const emptyMeasuresQuery = { ...query, measures: [] as any }
            const result = selectMeasurePerDimension(
                mockApiData.data.data,
                emptyMeasuresQuery,
                '1',
            )

            expect(result).toEqual({
                value: null,
                decile: null,
                allData: mockApiData.data.data,
                allValues: [],
                dimensions: ['channel'],
                measures: [],
            })
        })

        it('should return null values when dimensions array is empty', () => {
            const emptyDimensionsQuery = { ...query, dimensions: [] as any }
            const result = selectMeasurePerDimension(
                mockApiData.data.data,
                emptyDimensionsQuery,
                '1',
            )

            expect(result).toEqual({
                value: null,
                decile: null,
                allData: mockApiData.data.data,
                allValues: [],
                dimensions: [],
                measures: ['automatedInteractions'],
            })
        })

        it('should extract value and decile for matching dimension', () => {
            const dataWithDeciles = [
                { channel: '1', automatedInteractions: '100', decile: '3' },
                { channel: '2', automatedInteractions: '200', decile: '6' },
                { channel: '3', automatedInteractions: '300', decile: '9' },
            ]

            const result = selectMeasurePerDimension(
                dataWithDeciles,
                query,
                '2',
            )

            expect(result?.value).toBe(200)
            expect(result?.decile).toBe(6)
            expect(result?.allData).toEqual(dataWithDeciles)
            expect(result?.dimensions).toEqual(['channel'])
            expect(result?.measures).toEqual(['automatedInteractions'])
        })

        it('should return null values when dimension ID does not match', () => {
            const dataWithDeciles = [
                { channel: '1', automatedInteractions: '100', decile: '3' },
                { channel: '2', automatedInteractions: '200', decile: '6' },
            ]

            const result = selectMeasurePerDimension(
                dataWithDeciles,
                query,
                '999',
            )

            expect(result?.value).toBe(null)
            expect(result?.decile).toBe(null)
            expect(result?.allData).toEqual(dataWithDeciles)
        })

        it('should handle numeric dimension IDs', () => {
            const dataWithDeciles = [
                { channel: 1, automatedInteractions: 100, decile: 5 },
                { channel: 2, automatedInteractions: 200, decile: 8 },
            ]

            const result = selectMeasurePerDimension(dataWithDeciles, query, 1)

            expect(result?.value).toBe(100)
            expect(result?.decile).toBe(5)
        })

        it('should match string and numeric dimension IDs correctly', () => {
            const dataWithDeciles = [
                { channel: '1', automatedInteractions: '150', decile: '4' },
            ]

            const result = selectMeasurePerDimension(dataWithDeciles, query, 1)

            expect(result?.value).toBe(150)
            expect(result?.decile).toBe(4)
        })

        it('should populate allValues array with all data points', () => {
            const dataWithDeciles = [
                { channel: '1', automatedInteractions: '100', decile: '3' },
                { channel: '2', automatedInteractions: '200', decile: '6' },
                { channel: '3', automatedInteractions: '300', decile: '9' },
            ]

            const result = selectMeasurePerDimension(
                dataWithDeciles,
                query,
                '2',
            )

            expect(result?.allValues).toEqual([
                { dimension: '1', value: 100, decile: 3 },
                { dimension: '2', value: 200, decile: 6 },
                { dimension: '3', value: 300, decile: 9 },
            ])
        })

        it('should handle null values in data correctly', () => {
            const dataWithNulls = [
                { channel: '1', automatedInteractions: null, decile: null },
                { channel: '2', automatedInteractions: '200', decile: '5' },
            ]

            const result = selectMeasurePerDimension(dataWithNulls, query, '1')

            expect(result?.value).toBe(null)
            expect(result?.decile).toBe(null)
        })

        it('should handle NaN values by converting to null', () => {
            const dataWithInvalidNumbers = [
                {
                    channel: '1',
                    automatedInteractions: 'invalid',
                    decile: 'not-a-number',
                },
            ]

            const result = selectMeasurePerDimension(
                dataWithInvalidNumbers,
                query,
                '1',
            )

            expect(result?.value).toBe(null)
            expect(result?.decile).toBe(null)
        })

        it('should handle missing dimension in data row', () => {
            const dataWithMissingDimension = [
                { automatedInteractions: '100', decile: '5' },
                { channel: '2', automatedInteractions: '200', decile: '7' },
            ] as any[]

            const result = selectMeasurePerDimension(
                dataWithMissingDimension,
                query,
                '2',
            )

            expect(result?.value).toBe(200)
            expect(result?.allValues).toEqual([
                { dimension: '', value: 100, decile: 5 },
                { dimension: '2', value: 200, decile: 7 },
            ])
        })

        it('should automatically concatenate multiple dimensions when query has more than one dimension', () => {
            const multiDimensionQuery: BuiltQuery = {
                scope: MetricScope.TicketsClosed,
                dimensions: ['agentId', 'statusName'],
                measures: ['totalDurationSeconds'],
                filters: [],
                metricName: METRIC_NAMES.TEST_METRIC,
            }

            const dataWithMultipleDimensions = [
                {
                    agentId: '1',
                    statusName: 'Available',
                    totalDurationSeconds: '3600',
                    decile: '5',
                },
                {
                    agentId: '1',
                    statusName: 'Away',
                    totalDurationSeconds: '1800',
                    decile: '3',
                },
                {
                    agentId: '2',
                    statusName: 'Available',
                    totalDurationSeconds: '7200',
                    decile: '8',
                },
            ]

            const result = selectMeasurePerDimension(
                dataWithMultipleDimensions,
                multiDimensionQuery,
                '1',
            )

            expect(result?.allValues).toEqual([
                { dimension: '1,Available', value: 3600, decile: 5 },
                { dimension: '1,Away', value: 1800, decile: 3 },
                { dimension: '2,Available', value: 7200, decile: 8 },
            ])
        })

        it('should use only first dimension when query has single dimension', () => {
            const singleDimensionQuery: BuiltQuery = {
                scope: MetricScope.TicketsClosed,
                dimensions: ['agentId'],
                measures: ['totalDurationSeconds'],
                filters: [],
                metricName: METRIC_NAMES.TEST_METRIC,
            }

            const dataWithSingleDimension = [
                {
                    agentId: '1',
                    totalDurationSeconds: '3600',
                    decile: '5',
                },
                {
                    agentId: '2',
                    totalDurationSeconds: '1800',
                    decile: '3',
                },
            ]

            const result = selectMeasurePerDimension(
                dataWithSingleDimension,
                singleDimensionQuery,
                '1',
            )

            expect(result?.allValues).toEqual([
                { dimension: '1', value: 3600, decile: 5 },
                { dimension: '2', value: 1800, decile: 3 },
            ])
        })

        it('should handle missing second dimension gracefully in multi-dimension queries', () => {
            const multiDimensionQuery: BuiltQuery = {
                scope: MetricScope.TicketsClosed,
                dimensions: ['agentId', 'statusName'],
                measures: ['totalDurationSeconds'],
                filters: [],
                metricName: METRIC_NAMES.TEST_METRIC,
            }

            const dataWithMissingSecondDimension = [
                {
                    agentId: '1',
                    statusName: 'Available',
                    totalDurationSeconds: '3600',
                    decile: '5',
                },
                {
                    agentId: '2',
                    statusName: null,
                    totalDurationSeconds: '1800',
                    decile: '3',
                },
            ] as any[]

            const result = selectMeasurePerDimension(
                dataWithMissingSecondDimension,
                multiDimensionQuery,
                '1',
            )

            expect(result?.allValues).toEqual([
                { dimension: '1,Available', value: 3600, decile: 5 },
                { dimension: '2', value: 1800, decile: 3 },
            ])
        })
    })

    describe('useStatsMetricPerDimension', () => {
        it('should call usePostStats with correct parameters', async () => {
            usePostStatsMock.mockReturnValue({
                data: {
                    value: 100,
                    decile: 5,
                    allData: [],
                    allValues: [],
                    dimensions: ['channel'],
                    measures: ['automatedInteractions'],
                },
                isFetching: false,
                isError: false,
            } as any)

            const { result } = renderHook(
                () => useStatsMetricPerDimension(query, '1', true),
                {
                    wrapper: mockQueryClientProvider().QueryClientProvider,
                },
            )

            await waitFor(() => {
                expect(usePostStatsMock).toHaveBeenCalledWith(
                    query,
                    expect.objectContaining({
                        select: expect.any(Function),
                        enabled: true,
                    }),
                )
                expect(result.current.data).toEqual({
                    value: 100,
                    decile: 5,
                    allData: [],
                    allValues: [],
                    dimensions: ['channel'],
                    measures: ['automatedInteractions'],
                })
            })
        })

        it('should handle undefined data by converting to null', async () => {
            usePostStatsMock.mockReturnValue({
                data: undefined,
                isFetching: false,
                isError: false,
            } as any)

            const { result } = renderHook(
                () => useStatsMetricPerDimension(query, '1'),
                {
                    wrapper: mockQueryClientProvider().QueryClientProvider,
                },
            )

            await waitFor(() => {
                expect(result.current.data).toBe(null)
            })
        })

        it('should work without dimensionId parameter', async () => {
            usePostStatsMock.mockReturnValue({
                data: {
                    value: null,
                    decile: null,
                    allData: mockApiData.data.data,
                    allValues: [],
                },
                isFetching: false,
                isError: false,
            } as any)

            const { result } = renderHook(
                () => useStatsMetricPerDimension(query),
                {
                    wrapper: mockQueryClientProvider().QueryClientProvider,
                },
            )

            await waitFor(() => {
                expect(usePostStatsMock).toHaveBeenCalled()
                expect(result.current.isFetching).toBe(false)
            })
        })

        it('should pass enabled parameter to usePostStats', async () => {
            usePostStatsMock.mockReturnValue({
                data: null,
                isFetching: false,
                isError: false,
            } as any)

            renderHook(() => useStatsMetricPerDimension(query, '1', false), {
                wrapper: mockQueryClientProvider().QueryClientProvider,
            })

            await waitFor(() => {
                expect(usePostStatsMock).toHaveBeenCalledWith(
                    query,
                    expect.objectContaining({
                        enabled: false,
                    }),
                )
            })
        })

        it('should transform data correctly using select function', async () => {
            let selectFunction: ((data: any) => any) | undefined

            usePostStatsMock.mockImplementation((_, options) => {
                selectFunction = options?.select
                return {
                    data: null,
                    isFetching: false,
                    isError: false,
                } as any
            })

            renderHook(() => useStatsMetricPerDimension(query, '2', true), {
                wrapper: mockQueryClientProvider().QueryClientProvider,
            })

            await waitFor(() => {
                expect(selectFunction).toBeDefined()
            })

            const mockData = {
                data: {
                    data: [
                        { channel: '1', automatedInteractions: '100' },
                        { channel: '2', automatedInteractions: '200' },
                        { channel: '3', automatedInteractions: '300' },
                    ],
                },
            }

            const transformedData = selectFunction!(mockData)

            expect(transformedData).toMatchObject({
                value: 200,
                allData: expect.arrayContaining([
                    expect.objectContaining({
                        channel: '1',
                        automatedInteractions: '100',
                        decile: expect.any(Number),
                    }),
                    expect.objectContaining({
                        channel: '2',
                        automatedInteractions: '200',
                        decile: expect.any(Number),
                    }),
                    expect.objectContaining({
                        channel: '3',
                        automatedInteractions: '300',
                        decile: expect.any(Number),
                    }),
                ]),
                dimensions: ['channel'],
                measures: ['automatedInteractions'],
            })
        })
    })

    describe('fetchStatsMetricPerDimension', () => {
        it('should fetch data and return formatted result', async () => {
            fetchPostStatsMock.mockResolvedValue(mockApiData as any)

            const result = await fetchStatsMetricPerDimension(query, '1')

            expect(fetchPostStatsMock).toHaveBeenCalledWith(query)
            expect(result.isFetching).toBe(false)
            expect(result.isError).toBe(false)
            expect(result.data).toMatchObject({
                allData: expect.any(Array),
                dimensions: ['channel'],
                measures: ['automatedInteractions'],
            })
        })

        it('should handle fetch errors gracefully', async () => {
            fetchPostStatsMock.mockRejectedValue(new Error('API Error'))

            const result = await fetchStatsMetricPerDimension(query, '1')

            expect(result.isFetching).toBe(false)
            expect(result.isError).toBe(true)
            expect(result.data).toBe(null)
        })

        it('should work without dimensionId parameter', async () => {
            fetchPostStatsMock.mockResolvedValue(mockApiData as any)

            const result = await fetchStatsMetricPerDimension(query)

            expect(fetchPostStatsMock).toHaveBeenCalledWith(query)
            expect(result.isError).toBe(false)
            expect(result.data).toBeDefined()
        })

        it('should apply deciles to fetched data', async () => {
            const dataWithoutDeciles = {
                data: {
                    data: [
                        { channel: '1', automatedInteractions: '100' },
                        { channel: '2', automatedInteractions: '200' },
                    ],
                },
            }
            fetchPostStatsMock.mockResolvedValue(dataWithoutDeciles as any)

            const result = await fetchStatsMetricPerDimension(query, '1')

            expect(result.data?.allData.every((item) => 'decile' in item)).toBe(
                true,
            )
        })
    })

    describe('toEntityMap', () => {
        it('returns empty object when data is null', () => {
            const result = toEntityMap({ data: null })
            expect(result).toEqual({})
        })

        it('maps allValues to a record of dimension to value', () => {
            const result = toEntityMap({
                data: {
                    value: 100,
                    decile: null,
                    allData: [],
                    allValues: [
                        { dimension: 'cancel_order', value: 100, decile: null },
                        { dimension: 'track_order', value: 200, decile: null },
                    ],
                    dimensions: [],
                    measures: [],
                },
            })

            expect(result).toEqual({ cancel_order: 100, track_order: 200 })
        })

        it('returns empty object when allValues is empty', () => {
            const result = toEntityMap({
                data: {
                    value: null,
                    decile: null,
                    allData: [],
                    allValues: [],
                    dimensions: [],
                    measures: [],
                },
            })

            expect(result).toEqual({})
        })

        it('includes null values in the map', () => {
            const result = toEntityMap({
                data: {
                    value: null,
                    decile: null,
                    allData: [],
                    allValues: [
                        {
                            dimension: 'cancel_order',
                            value: null,
                            decile: null,
                        },
                    ],
                    dimensions: [],
                    measures: [],
                },
            })

            expect(result).toEqual({ cancel_order: null })
        })
    })

    describe('mapMetricValues', () => {
        const baseMetric = {
            isFetching: false,
            isError: false,
            data: {
                value: 100,
                decile: null,
                allData: [],
                allValues: [
                    { dimension: 'a', value: 100, decile: null },
                    { dimension: 'b', value: 200, decile: null },
                ],
                dimensions: [],
                measures: [],
            },
        }

        it('transforms value and allValues using the transform function', () => {
            const result = mapMetricValues(baseMetric, (v) =>
                v !== null ? v * 2 : null,
            )

            expect(result.data?.value).toBe(200)
            expect(result.data?.allValues).toEqual([
                { dimension: 'a', value: 200, decile: null },
                { dimension: 'b', value: 400, decile: null },
            ])
        })

        it('returns null data when metric.data is null', () => {
            const result = mapMetricValues(
                { isFetching: false, isError: false, data: null },
                (v) => v,
            )

            expect(result.data).toBeNull()
        })

        it('preserves isFetching and isError from the metric', () => {
            const result = mapMetricValues(
                { isFetching: true, isError: true, data: null },
                (v) => v,
            )

            expect(result.isFetching).toBe(true)
            expect(result.isError).toBe(true)
        })

        it('propagates isFetching from extra dependencies', () => {
            const result = mapMetricValues(baseMetric, (v) => v, [
                { isFetching: true, isError: false },
            ])

            expect(result.isFetching).toBe(true)
        })

        it('propagates isError from extra dependencies', () => {
            const result = mapMetricValues(baseMetric, (v) => v, [
                { isFetching: false, isError: true },
            ])

            expect(result.isError).toBe(true)
        })

        it('handles null transform result', () => {
            const result = mapMetricValues(baseMetric, () => null)

            expect(result.data?.value).toBeNull()
            expect(result.data?.allValues).toEqual([
                { dimension: 'a', value: null, decile: null },
                { dimension: 'b', value: null, decile: null },
            ])
        })
    })

    describe('filterEntitiesWithData', () => {
        const entityData = {
            automationRate: { flow_a: 0.5, flow_b: null, flow_c: NaN },
            automatedInteractions: { flow_a: 10, flow_b: null, flow_c: null },
        }

        it('returns all entities when isLoading is true', () => {
            const result = filterEntitiesWithData(
                ['flow_a', 'flow_b', 'flow_c'],
                entityData,
                true,
            )

            expect(result).toEqual(['flow_a', 'flow_b', 'flow_c'])
        })

        it('returns only entities with at least one non-null, non-NaN value', () => {
            const result = filterEntitiesWithData(
                ['flow_a', 'flow_b', 'flow_c'],
                entityData,
                false,
            )

            expect(result).toEqual(['flow_a'])
        })

        it('includes entities with 0 values', () => {
            const result = filterEntitiesWithData(
                ['flow_a', 'flow_b'],
                { metric: { flow_a: 0, flow_b: null } },
                false,
            )

            expect(result).toEqual(['flow_a'])
        })

        it('returns empty array when no entity has data', () => {
            const result = filterEntitiesWithData(
                ['flow_a', 'flow_b'],
                { metric: { flow_a: null, flow_b: null } },
                false,
            )

            expect(result).toEqual([])
        })

        it('preserves the entity type', () => {
            type FlowEntity = 'flow_a' | 'flow_b'
            const result: FlowEntity[] = filterEntitiesWithData(
                ['flow_a', 'flow_b'] as FlowEntity[],
                { metric: { flow_a: 1, flow_b: null } },
                false,
            )

            expect(result).toEqual(['flow_a'])
        })
    })

    describe('assembleEntityRows', () => {
        const buildRow = (entity: string) => ({ entity })

        it('returns empty array when all values are zero', () => {
            const result = assembleEntityRows(
                { metric1: { cancel_order: 0, track_order: 0 } },
                ['cancel_order', 'track_order'],
                buildRow,
            )

            expect(result).toEqual([])
        })

        it('returns empty array when all values are null', () => {
            const result = assembleEntityRows(
                { metric1: { cancel_order: null, track_order: null } },
                ['cancel_order', 'track_order'],
                buildRow,
            )

            expect(result).toEqual([])
        })

        it('returns rows for all entities when at least one value is non-zero', () => {
            const result = assembleEntityRows(
                { metric1: { cancel_order: 100, track_order: 0 } },
                ['cancel_order', 'track_order'],
                buildRow,
            )

            expect(result).toEqual([
                { entity: 'cancel_order' },
                { entity: 'track_order' },
            ])
        })

        it('returns rows for all entities when data has values across multiple metrics', () => {
            const result = assembleEntityRows(
                {
                    metric1: { cancel_order: 0, track_order: 0 },
                    metric2: { cancel_order: 50, track_order: 0 },
                },
                ['cancel_order', 'track_order'],
                buildRow,
            )

            expect(result).toEqual([
                { entity: 'cancel_order' },
                { entity: 'track_order' },
            ])
        })

        it('skips empty check when skipEmptyCheck is true', () => {
            const result = assembleEntityRows(
                { metric1: { cancel_order: 0 } },
                ['cancel_order'],
                buildRow,
                { skipEmptyCheck: true },
            )

            expect(result).toEqual([{ entity: 'cancel_order' }])
        })

        it('passes entity to buildRow', () => {
            const buildRowSpy = jest.fn((entity: string) => ({ entity }))
            assembleEntityRows(
                { metric1: { cancel_order: 10 } },
                ['cancel_order', 'track_order'],
                buildRowSpy,
            )

            expect(buildRowSpy).toHaveBeenCalledWith(
                'cancel_order',
                expect.any(Number),
                expect.any(Array),
            )
            expect(buildRowSpy).toHaveBeenCalledWith(
                'track_order',
                expect.any(Number),
                expect.any(Array),
            )
        })
    })

    describe('useEntityMetrics', () => {
        const filters = {
            period: {
                start_datetime: '2025-09-03T00:00:00.000',
                end_datetime: '2025-09-03T23:59:59.000',
            },
        }

        it('calls use function with filters and timezone for each config entry', async () => {
            const mockUseResult = {
                isFetching: false,
                isError: false,
                data: {
                    value: 100,
                    decile: null,
                    allData: [],
                    allValues: [
                        { dimension: 'cancel_order', value: 100, decile: null },
                    ],
                    dimensions: [],
                    measures: [],
                },
            }
            const mockUseFn = jest.fn().mockReturnValue(mockUseResult)
            const config = {
                automationRate: { use: mockUseFn, fetch: jest.fn() },
            }

            const { result } = renderHook(
                () => useEntityMetrics(config, filters, 'utc'),
                { wrapper: mockQueryClientProvider().QueryClientProvider },
            )

            await waitFor(() => {
                expect(mockUseFn).toHaveBeenCalledWith(filters, 'utc')
                expect(result.current.data.automationRate).toEqual({
                    cancel_order: 100,
                })
                expect(result.current.isLoading).toBe(false)
                expect(result.current.isError).toBe(false)
            })
        })

        it('reflects isLoading true when any metric is fetching', async () => {
            const mockUseFn = jest.fn().mockReturnValue({
                isFetching: true,
                isError: false,
                data: null,
            })
            const config = {
                automationRate: { use: mockUseFn, fetch: jest.fn() },
            }

            const { result } = renderHook(
                () => useEntityMetrics(config, filters, 'utc'),
                { wrapper: mockQueryClientProvider().QueryClientProvider },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(true)
            })
        })

        it('assembles data from multiple config entries', async () => {
            const config = {
                automationRate: {
                    use: jest.fn().mockReturnValue({
                        isFetching: false,
                        isError: false,
                        data: {
                            value: 10,
                            decile: null,
                            allData: [],
                            allValues: [
                                {
                                    dimension: 'cancel_order',
                                    value: 10,
                                    decile: null,
                                },
                            ],
                            dimensions: [],
                            measures: [],
                        },
                    }),
                    fetch: jest.fn(),
                },
                handoverCount: {
                    use: jest.fn().mockReturnValue({
                        isFetching: false,
                        isError: false,
                        data: {
                            value: 5,
                            decile: null,
                            allData: [],
                            allValues: [
                                {
                                    dimension: 'cancel_order',
                                    value: 5,
                                    decile: null,
                                },
                            ],
                            dimensions: [],
                            measures: [],
                        },
                    }),
                    fetch: jest.fn(),
                },
            }

            const { result } = renderHook(
                () => useEntityMetrics(config, filters, 'utc'),
                { wrapper: mockQueryClientProvider().QueryClientProvider },
            )

            await waitFor(() => {
                expect(result.current.data.automationRate).toEqual({
                    cancel_order: 10,
                })
                expect(result.current.data.handoverCount).toEqual({
                    cancel_order: 5,
                })
                expect(result.current.loadingStates).toEqual({
                    automationRate: false,
                    handoverCount: false,
                })
            })
        })
    })

    describe('fetchEntityMetrics', () => {
        const filters = {
            period: {
                start_datetime: '2025-09-03T00:00:00.000',
                end_datetime: '2025-09-03T23:59:59.000',
            },
        }

        it('calls fetch function with filters and timezone for each config entry', async () => {
            const mockFetch = jest.fn().mockResolvedValue({
                isFetching: false,
                isError: false,
                data: {
                    value: 100,
                    decile: null,
                    allData: [],
                    allValues: [
                        { dimension: 'cancel_order', value: 100, decile: null },
                    ],
                    dimensions: [],
                    measures: [],
                },
            })
            const config = {
                automationRate: { use: jest.fn(), fetch: mockFetch },
            }

            const result = await fetchEntityMetrics(config, filters, 'utc')

            expect(mockFetch).toHaveBeenCalledWith(filters, 'utc')
            expect(result.data.automationRate).toEqual({ cancel_order: 100 })
            expect(result.isLoading).toBe(false)
            expect(result.isError).toBe(false)
        })

        it('reflects isError true when any fetch result has isError', async () => {
            const config = {
                automationRate: {
                    use: jest.fn(),
                    fetch: jest.fn().mockResolvedValue({
                        isFetching: false,
                        isError: true,
                        data: null,
                    }),
                },
            }

            const result = await fetchEntityMetrics(config, filters, 'utc')

            expect(result.isError).toBe(true)
        })

        it('assembles data from multiple config entries in parallel', async () => {
            const config = {
                automationRate: {
                    use: jest.fn(),
                    fetch: jest.fn().mockResolvedValue({
                        isFetching: false,
                        isError: false,
                        data: {
                            value: 10,
                            decile: null,
                            allData: [],
                            allValues: [
                                {
                                    dimension: 'cancel_order',
                                    value: 10,
                                    decile: null,
                                },
                            ],
                            dimensions: [],
                            measures: [],
                        },
                    }),
                },
                handoverCount: {
                    use: jest.fn(),
                    fetch: jest.fn().mockResolvedValue({
                        isFetching: false,
                        isError: false,
                        data: {
                            value: 5,
                            decile: null,
                            allData: [],
                            allValues: [
                                {
                                    dimension: 'cancel_order',
                                    value: 5,
                                    decile: null,
                                },
                            ],
                            dimensions: [],
                            measures: [],
                        },
                    }),
                },
            }

            const result = await fetchEntityMetrics(config, filters, 'utc')

            expect(result.data.automationRate).toEqual({ cancel_order: 10 })
            expect(result.data.handoverCount).toEqual({ cancel_order: 5 })
            expect(result.loadingStates).toEqual({
                automationRate: false,
                handoverCount: false,
            })
        })
    })
})
