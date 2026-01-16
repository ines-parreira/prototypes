import { assumeMock, renderHook } from '@repo/testing'
import type { AxiosResponse } from 'axios'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    fetchStatsTimeSeriesPerDimension,
    selectPerDimension,
    useStatsTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useStatsTimeSeries'
import { BREAKDOWN_FIELD } from 'domains/reporting/hooks/withBreakdown'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { fetchPostStats, usePostStats } from 'domains/reporting/models/queries'
import type {
    BuiltQuery,
    ScopeFilters,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type {
    ReportingResponse,
    ReportingTimeDimension,
} from 'domains/reporting/models/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'domains/reporting/models/types'

jest.mock('domains/reporting/models/queries')
const usePostStatsMock = assumeMock(usePostStats)
const fetchPostStatsMock = assumeMock(fetchPostStats)

// Shared test data
const defaultTimeDimension = {
    dimension: TicketDimension.CreatedDatetime,
    granularity: ReportingGranularity.Hour,
} as ReportingTimeDimension<unknown>

const testScopeMeta = {
    scope: 'test-scope' as any,
    filters: ['periodStart', 'periodEnd'] as const,
    measures: ['medianFirstResponseTime'] as const,
    dimensions: ['agentId'] as const,
    timeDimensions: ['createdDatetime'] as const,
} as const satisfies ScopeMeta

const newAPIQuery: BuiltQuery<typeof testScopeMeta> = {
    metricName: METRIC_NAMES.TEST_METRIC,
    measures: testScopeMeta.measures,
    time_dimensions: [defaultTimeDimension] as any,
    dimensions: testScopeMeta.dimensions,
    filters: [
        {
            member: 'periodStart',
            operator: ReportingFilterOperator.AfterDate,
            values: ['2022-01-02T00:00:00.000'],
        },
        {
            member: 'periodEnd',
            operator: ReportingFilterOperator.BeforeDate,
            values: ['2022-01-02T05:00:00.000'],
        },
    ] as ScopeFilters<typeof testScopeMeta>,
    scope: testScopeMeta.scope,
}

const defaultData = [
    {
        [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
        medianFirstResponseTime: '65',
        agentId: 'agent1',
    },
    {
        [TicketDimension.CreatedDatetime]: '2022-01-02T04:00:00',
        medianFirstResponseTime: '139',
        agentId: 'agent2',
    },
    {
        [TicketDimension.CreatedDatetime]: '2022-01-02T04:00:00',
        medianFirstResponseTime: '55',
        agentId: 'agent1',
    },
]

// Global beforeEach to setup mocks for all tests
beforeEach(() => {
    jest.clearAllMocks()
    // Setup default mock returns so tests can access mock.calls
    usePostStatsMock.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
    } as any)
    fetchPostStatsMock.mockResolvedValue({
        data: {
            data: [],
            annotation: { title: '', shortTitle: '', type: 'array' },
            query: newAPIQuery as any,
        },
    } as any)
})

describe('selectPerDimension', () => {
    it('should handle empty data', () => {
        const result = selectPerDimension(newAPIQuery)([])

        expect(result).toEqual({})
    })

    it('should select and group dimensions from query', () => {
        const mockData = [
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                agentId: 'agent1',
                medianFirstResponseTime: '65',
            },
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
                agentId: 'agent1',
                medianFirstResponseTime: '32',
            },
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                agentId: 'agent2',
                medianFirstResponseTime: '45',
            },
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                agentId: 'agent3',
                medianFirstResponseTime: '55',
            },
        ] as any

        const result = selectPerDimension(newAPIQuery)(mockData)

        expect(Object.keys(result)).toHaveLength(3)
        expect(result.agent1).toBeDefined()
        expect(result.agent2).toBeDefined()
        expect(result.agent3).toBeDefined()
    })

    it('should handle missing measure values', () => {
        const mockData = [
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                agentId: 'agent1',
            },
        ] as any

        const result = selectPerDimension(newAPIQuery)(mockData)

        expect(result.agent1).toBeDefined()
    })

    it('should handle null measure values', () => {
        const mockData = [
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                agentId: 'agent1',
                medianFirstResponseTime: null,
            },
        ] as any

        const result = selectPerDimension(newAPIQuery)(mockData)

        expect(result.agent1).toBeDefined()
    })

    it('should parse numeric strings correctly, including edge cases', () => {
        const mockData = [
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                agentId: 'agent1',
                medianFirstResponseTime: '65.5',
            },
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                agentId: 'agent2',
                medianFirstResponseTime: '0',
            },
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                agentId: 'agent3',
                medianFirstResponseTime: '999999999',
            },
        ] as any

        const result = selectPerDimension(newAPIQuery)(mockData)

        expect(result.agent1[0][0].value).toBe(65.5)
        expect(result.agent2[0][0].value).toBe(0)
        expect(result.agent3[0][0].value).toBe(999999999)
    })

    it('should handle BREAKDOWN_FIELD dimension by stripping escaped quotes', () => {
        const breakdownQuery = {
            ...newAPIQuery,
            dimensions: [BREAKDOWN_FIELD],
        } as any

        const mockData = [
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                [BREAKDOWN_FIELD]: '"escaped_value"',
                medianFirstResponseTime: '100',
            },
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                [BREAKDOWN_FIELD]: '"normal_value"',
                medianFirstResponseTime: '200',
            },
        ] as any

        const result = selectPerDimension(breakdownQuery)(mockData)

        expect(Object.keys(result)).toHaveLength(2)
        expect(result['escaped_value']).toBeDefined()
        expect(result['normal_value']).toBeDefined()
    })

    it('should format dimension values with correct granularity in select function', () => {
        const hourlyQuery: BuiltQuery<typeof testScopeMeta> = {
            ...newAPIQuery,
            time_dimensions: [
                {
                    dimension: TicketDimension.CreatedDatetime,
                    granularity: ReportingGranularity.Hour,
                } as any,
            ],
        }

        const mockData = [
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T15:00:00Z',
                agentId: 'agent1',
                medianFirstResponseTime: '100',
            },
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T16:00:00Z',
                agentId: 'agent1',
                medianFirstResponseTime: '200',
            },
        ] as any

        const result = selectPerDimension(hourlyQuery)(mockData)

        expect(result.agent1).toBeDefined()
        expect(result.agent1[0]).toBeDefined()
        expect(result.agent1[0].length).toBeGreaterThan(0)
        expect(result.agent1[0][0].value).toBeGreaterThanOrEqual(0)
        expect(result.agent1[0][0].label).toBe(testScopeMeta.measures[0])
        expect(result.agent1[0][0].dateTime).toBeDefined()
    })
})

describe('useTimeSeriesPerDimension', () => {
    it('should return separate time series per dimension value with correct select function', () => {
        renderHook(() => useStatsTimeSeriesPerDimension(newAPIQuery))
        const select = usePostStatsMock.mock.calls[0][1]?.select

        const response: AxiosResponse<ReportingResponse<typeof defaultData>> = {
            data: {
                data: defaultData,
                annotation: {
                    title: 'foo title',
                    shortTitle: 'foo',
                    type: 'array',
                },
                query: newAPIQuery as any,
            },
        } as any

        const result = select?.(response) as any

        expect(result).toBeDefined()
        expect(result?.agent1).toBeDefined()
        expect(result?.agent2).toBeDefined()
    })

    it('should call usePostReportingV2 with correct query parameter', () => {
        renderHook(() => useStatsTimeSeriesPerDimension(newAPIQuery))

        expect(usePostStatsMock).toHaveBeenCalled()
        const callArgs = usePostStatsMock.mock.calls[0]
        expect(callArgs[0]).toEqual(newAPIQuery)
    })

    it('should pass enabled flag correctly to usePostReportingV2', () => {
        renderHook(() => useStatsTimeSeriesPerDimension(newAPIQuery, false))

        const callArgs = usePostStatsMock.mock.calls[0][1]
        expect(callArgs?.enabled).toBe(false)
    })

    it('should default enabled flag to true when not provided', () => {
        jest.clearAllMocks()
        renderHook(() => useStatsTimeSeriesPerDimension(newAPIQuery))

        const callArgs = usePostStatsMock.mock.calls[0][1]
        expect(callArgs?.enabled).toBe(true)
    })

    it('should return hook result with data and correct status flags', () => {
        usePostStatsMock.mockReturnValue({
            data: { agent1: [[]] },
            isLoading: false,
            isError: false,
            error: null,
            isFetching: false,
        } as any)

        const { result } = renderHook(() =>
            useStatsTimeSeriesPerDimension(newAPIQuery),
        )

        expect(result.current).toBeDefined()
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should handle loading state', () => {
        usePostStatsMock.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
            isFetching: true,
        } as any)

        const { result } = renderHook(() =>
            useStatsTimeSeriesPerDimension(newAPIQuery),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.isFetching).toBe(true)
    })

    it('should handle error state correctly', () => {
        const error = new Error('Test error')
        usePostStatsMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: error,
            isFetching: false,
        } as any)

        const { result } = renderHook(() =>
            useStatsTimeSeriesPerDimension(newAPIQuery),
        )

        expect(result.current.isError).toBe(true)
        expect(result.current.error).toEqual(error)
    })

    it('should handle empty data response', () => {
        const emptyResponse: AxiosResponse<ReportingResponse<any[]>> = {
            data: {
                data: [],
                annotation: {
                    title: 'foo title',
                    shortTitle: 'foo',
                    type: 'array',
                },
                query: newAPIQuery as any,
            },
        } as any

        renderHook(() => useStatsTimeSeriesPerDimension(newAPIQuery))
        const select = usePostStatsMock.mock.calls[0][1]?.select

        const result = select?.(emptyResponse)

        expect(result).toEqual({})
    })
})

describe('fetchTimeSeriesPerDimension', () => {
    it('should return separate time series per dimension value on success', async () => {
        fetchPostStatsMock.mockResolvedValue({
            data: {
                data: defaultData,
                annotation: {
                    title: 'foo title',
                    shortTitle: 'foo',
                    type: 'array',
                },
                query: newAPIQuery as any,
            },
        } as any)

        const result = await fetchStatsTimeSeriesPerDimension(newAPIQuery)

        expect(result).toBeDefined()
        expect(result['agent1']).toBeDefined()
        expect(result['agent2']).toBeDefined()
    })

    it('should call fetchPostReportingV2 with correct query', async () => {
        fetchPostStatsMock.mockResolvedValue({
            data: {
                data: [],
                annotation: { title: '', shortTitle: '', type: 'array' },
                query: newAPIQuery as any,
            },
        } as any)

        await fetchStatsTimeSeriesPerDimension(newAPIQuery)

        expect(fetchPostStatsMock).toHaveBeenCalled()
        expect(fetchPostStatsMock.mock.calls[0][0]).toEqual(newAPIQuery)
    })

    it('should return empty object for empty data', async () => {
        fetchPostStatsMock.mockResolvedValue({
            data: {
                data: [],
                annotation: { title: '', shortTitle: '', type: 'array' },
                query: newAPIQuery as any,
            },
        } as any)

        const result = await fetchStatsTimeSeriesPerDimension(newAPIQuery)

        expect(result).toEqual({})
    })

    it('should propagate API and network errors', async () => {
        const error = new Error('API Error')
        fetchPostStatsMock.mockRejectedValue(error)

        await expect(
            fetchStatsTimeSeriesPerDimension(newAPIQuery),
        ).rejects.toThrow('API Error')
    })
})
