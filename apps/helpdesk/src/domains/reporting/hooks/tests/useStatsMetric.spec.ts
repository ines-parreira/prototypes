import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'

import { appQueryClient } from 'api/queryClient'
import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    fetchStatsMetric,
    selectStatsMeasure,
    useStatsMetric,
} from 'domains/reporting/hooks/useStatsMetric'
import { fetchPostStats, usePostStats } from 'domains/reporting/models/queries'
import type { BuiltQuery } from 'domains/reporting/models/scopes/scope'

jest.mock('domains/reporting/models/queries')

const usePostStatsMock = assumeMock(usePostStats)
const fetchPostStatsMock = assumeMock(fetchPostStats)

describe('useStatsMetric', () => {
    const defaultQuery: BuiltQuery = {
        scope: MetricScope.TicketsClosed,
        measures: ['ticketCount'],
        dimensions: [],
        filters: [],
        metricName: METRIC_NAMES.TEST_METRIC,
    }

    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    beforeEach(() => {
        jest.resetAllMocks()
        appQueryClient.clear()
    })

    describe('selectStatsMeasure', () => {
        it('should return null when data is null', () => {
            const data = {
                data: {
                    data: [{ ticketCount: null }],
                },
            } as any

            const result = selectStatsMeasure(data, defaultQuery)

            expect(result).toBe(null)
        })

        it('should return null when data array is empty', () => {
            const data = {
                data: {
                    data: [],
                },
            } as any

            const result = selectStatsMeasure(data, defaultQuery)

            expect(result).toBe(null)
        })

        it('should return null when measures array is empty', () => {
            const queryWithNoMeasures = { ...defaultQuery, measures: [] as any }
            const data = {
                data: {
                    data: [{ ticketCount: '100' }],
                },
            } as any

            const result = selectStatsMeasure(data, queryWithNoMeasures)

            expect(result).toBe(null)
        })

        it('should return null when measure is not present in data', () => {
            const data = {
                data: {
                    data: [{}],
                },
            } as any

            const result = selectStatsMeasure(data, defaultQuery)

            expect(result).toBe(null)
        })

        it('should parse and return numeric values from strings', () => {
            const floatData = {
                data: {
                    data: [{ ticketCount: '123.45' }],
                },
            } as any
            const intData = {
                data: {
                    data: [{ ticketCount: '100' }],
                },
            } as any
            const zeroData = {
                data: {
                    data: [{ ticketCount: '0' }],
                },
            } as any

            expect(selectStatsMeasure(floatData, defaultQuery)).toBe(123.45)
            expect(selectStatsMeasure(intData, defaultQuery)).toBe(100)
            expect(selectStatsMeasure(zeroData, defaultQuery)).toBe(0)
        })

        it('should handle negative values', () => {
            const data = {
                data: {
                    data: [{ ticketCount: '-50.5' }],
                },
            } as any

            const result = selectStatsMeasure(data, defaultQuery)

            expect(result).toBe(-50.5)
        })

        it('should use the first measure in the query', () => {
            const queryWithMultipleMeasures = {
                ...defaultQuery,
                measures: ['ticketCount', 'openTickets'] as any,
            }
            const data = {
                data: {
                    data: [{ ticketCount: '100', openTickets: '200' }],
                },
            } as any

            const result = selectStatsMeasure(data, queryWithMultipleMeasures)

            expect(result).toBe(100)
        })
    })

    describe('useStatsMetric hook', () => {
        it('should return correct isFetching state', () => {
            usePostStatsMock.mockReturnValue({
                ...defaultReporting,
                isFetching: false,
            } as UseQueryResult)

            const { result: resultNotFetching } = renderHook(() =>
                useStatsMetric(defaultQuery),
            )
            expect(resultNotFetching.current.isFetching).toBe(false)

            usePostStatsMock.mockReturnValue({
                ...defaultReporting,
                isFetching: true,
            } as UseQueryResult)

            const { result: resultFetching } = renderHook(() =>
                useStatsMetric(defaultQuery),
            )
            expect(resultFetching.current.isFetching).toBe(true)
        })

        it('should return correct isError state', () => {
            usePostStatsMock.mockReturnValue({
                ...defaultReporting,
                isError: false,
            } as UseQueryResult)

            const { result: resultNoError } = renderHook(() =>
                useStatsMetric(defaultQuery),
            )
            expect(resultNoError.current.isError).toBe(false)

            usePostStatsMock.mockReturnValue({
                ...defaultReporting,
                isError: true,
            } as UseQueryResult)

            const { result: resultWithError } = renderHook(() =>
                useStatsMetric(defaultQuery),
            )
            expect(resultWithError.current.isError).toBe(true)
        })

        it('should handle various data values correctly', () => {
            usePostStatsMock.mockReturnValue({
                ...defaultReporting,
                data: undefined,
            } as UseQueryResult)
            const { result: undefinedResult } = renderHook(() =>
                useStatsMetric(defaultQuery),
            )
            expect(undefinedResult.current.data).toBe(undefined)

            usePostStatsMock.mockReturnValue({
                ...defaultReporting,
                data: 150,
            } as UseQueryResult)
            const { result: numericResult } = renderHook(() =>
                useStatsMetric(defaultQuery),
            )
            expect(numericResult.current.data).toEqual({ value: 150 })

            usePostStatsMock.mockReturnValue({
                ...defaultReporting,
                data: null,
            } as UseQueryResult)
            const { result: nullResult } = renderHook(() =>
                useStatsMetric(defaultQuery),
            )
            expect(nullResult.current.data).toEqual({ value: null })

            usePostStatsMock.mockReturnValue({
                ...defaultReporting,
                data: 0,
            } as UseQueryResult)
            const { result: zeroResult } = renderHook(() =>
                useStatsMetric(defaultQuery),
            )
            expect(zeroResult.current.data).toEqual({ value: 0 })
        })

        it('should call usePostStats with correct parameters', () => {
            usePostStatsMock.mockReturnValue({
                ...defaultReporting,
                data: 100,
            } as UseQueryResult)

            renderHook(() => useStatsMetric(defaultQuery))

            expect(usePostStatsMock).toHaveBeenCalledWith(
                defaultQuery,
                expect.objectContaining({
                    select: expect.any(Function),
                    enabled: true,
                }),
            )
        })

        it('should respect enabled parameter', () => {
            usePostStatsMock.mockReturnValue(defaultReporting as UseQueryResult)

            renderHook(() => useStatsMetric(defaultQuery, false))
            expect(usePostStatsMock).toHaveBeenCalledWith(
                defaultQuery,
                expect.objectContaining({ enabled: false }),
            )

            jest.clearAllMocks()

            renderHook(() => useStatsMetric(defaultQuery))
            expect(usePostStatsMock).toHaveBeenCalledWith(
                defaultQuery,
                expect.objectContaining({ enabled: true }),
            )
        })

        it('should correctly select data using the select function', () => {
            const rawResponseValue = '250.75'
            const mockApiResponse = {
                data: {
                    data: [{ ticketCount: rawResponseValue }],
                },
            } as any

            usePostStatsMock.mockReturnValue({
                ...defaultReporting,
                data: 250.75,
            } as UseQueryResult)

            renderHook(() => useStatsMetric(defaultQuery))

            const selectFn = usePostStatsMock.mock.calls[0][1]?.select

            expect(selectFn).toBeDefined()
            expect(selectFn?.(mockApiResponse)).toBe(250.75)
        })
    })

    describe('fetchStatsMetric', () => {
        beforeEach(() => {
            jest.resetAllMocks()
        })

        it('should return correct response on success', async () => {
            fetchPostStatsMock.mockResolvedValue({
                data: {
                    data: [{ ticketCount: '125.5' }],
                },
            } as any)

            const result = await fetchStatsMetric(defaultQuery)

            expect(result.isFetching).toBe(false)
            expect(result.isError).toBe(false)
            expect(result.data).toEqual({ value: 125.5 })
        })

        it('should handle various data values from API', async () => {
            fetchPostStatsMock.mockResolvedValue({
                data: {
                    data: [{ ticketCount: null }],
                },
            } as any)
            const nullResult = await fetchStatsMetric(defaultQuery)
            expect(nullResult.data).toEqual({ value: null })

            fetchPostStatsMock.mockResolvedValue({
                data: {
                    data: undefined,
                },
            } as any)
            const undefinedResult = await fetchStatsMetric(defaultQuery)
            expect(undefinedResult.data).toBe(undefined)

            fetchPostStatsMock.mockResolvedValue({
                data: {
                    data: [{ ticketCount: '0' }],
                },
            } as any)
            const zeroResult = await fetchStatsMetric(defaultQuery)
            expect(zeroResult.data).toEqual({ value: 0 })
        })

        it('should return isError=true when fetch fails', async () => {
            fetchPostStatsMock.mockRejectedValue(new Error('API Error'))

            const result = await fetchStatsMetric(defaultQuery)

            expect(result.isFetching).toBe(false)
            expect(result.isError).toBe(true)
            expect(result.data).toBe(undefined)
        })

        it('should call fetchPostStats with the query', async () => {
            fetchPostStatsMock.mockResolvedValue({
                data: {
                    data: [{ ticketCount: '50' }],
                },
            } as any)

            await fetchStatsMetric(defaultQuery)

            expect(fetchPostStatsMock).toHaveBeenCalledWith(defaultQuery)
        })

        it('should handle multiple measures and use the first one', async () => {
            const queryWithMultipleMeasures = {
                ...defaultQuery,
                measures: ['ticketCount', 'openTickets'] as any,
            }
            fetchPostStatsMock.mockResolvedValue({
                data: {
                    data: [{ ticketCount: '100', openTickets: '200' }],
                },
            } as any)

            const result = await fetchStatsMetric(queryWithMultipleMeasures)

            expect(result.data).toEqual({ value: 100 })
        })
    })
})
