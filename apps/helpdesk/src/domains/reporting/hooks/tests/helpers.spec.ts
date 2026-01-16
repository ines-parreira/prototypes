import { assumeMock } from '@repo/testing'

import {
    calculateTotalCapacity,
    createFetchPerDimension,
    getPeriodDateTimesFromFilters,
} from 'domains/reporting/hooks/helpers'
import { calculateMetricPerHour } from 'domains/reporting/hooks/metricCalculations'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { fetchMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'domains/reporting/models/cubes/agentxp/AgentTimeTrackingCube'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
} from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import type { ReportingFilter } from 'domains/reporting/models/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'domains/reporting/models/types'

jest.mock('domains/reporting/hooks/useMetricPerDimension')

const messagesSentAgentId = HelpdeskMessageDimension.SenderId
const messagesSentMeasure = HelpdeskMessageMeasure.MessageCount

const onlineTimeMeasure = AgentTimeTrackingMeasure.OnlineTime
const onlineTimeAgentID = AgentTimeTrackingDimension.UserId

jest.mock('hooks/useAppSelector')

describe('calculateTotalCapacity', () => {
    const agentId = '789726418'
    const agentsMessagesSent = 62
    const agentsOnlineTime = 18044
    const agentBId = '696020168'
    const messagesSentPayload = [
        {
            [messagesSentAgentId]: agentId,
            [messagesSentMeasure]: String(agentsMessagesSent),
            decile: '9',
        },
        {
            [messagesSentAgentId]: agentBId,
            [messagesSentMeasure]: String(agentsMessagesSent),
            decile: '9',
        },
        {
            [messagesSentAgentId]: '696020168',
            [messagesSentMeasure]: '9',
            decile: '7',
        },
        {
            [messagesSentAgentId]: '778779062',
            [messagesSentMeasure]: '1',
            decile: ' 5',
        },
        {
            [messagesSentAgentId]: '360037000',
            [messagesSentMeasure]: '1',
            decile: '3',
        },
        {
            [messagesSentAgentId]: '789752988',
            [messagesSentMeasure]: '1',
            decile: '1',
        },
    ]

    const onlineTime = [
        {
            [onlineTimeAgentID]: agentId,
            [onlineTimeMeasure]: String(agentsOnlineTime),
            decile: '9',
        },
        {
            [onlineTimeAgentID]: agentBId,
            [onlineTimeMeasure]: String(agentsOnlineTime),
            decile: '9',
        },
    ]

    it('should calculate a sum of each active agents capacity', () => {
        const result = calculateTotalCapacity(
            messagesSentPayload,
            onlineTime,
            messagesSentAgentId,
            messagesSentMeasure,
            onlineTimeAgentID,
            onlineTimeMeasure,
        )

        const agentACapacity = calculateMetricPerHour(
            agentsMessagesSent,
            agentsOnlineTime,
        )
        const agentBCapacity = calculateMetricPerHour(
            agentsMessagesSent,
            agentsOnlineTime,
        )

        expect(result).toEqual({ value: agentACapacity + agentBCapacity })
    })

    it('should return 0 if there is no corresponding agentId', () => {
        const messagesSentPayload = [
            {
                [messagesSentAgentId]: '789752988',
                [messagesSentMeasure]: '1',
                decile: '1',
            },
        ]

        const result = calculateTotalCapacity(
            messagesSentPayload,
            onlineTime,
            messagesSentAgentId,
            messagesSentMeasure,
            onlineTimeAgentID,
            onlineTimeMeasure,
        )

        expect(result).toEqual({ value: 0 })
    })

    it('should return null if there is no online time data', () => {
        const result = calculateTotalCapacity(
            messagesSentPayload,
            undefined,
            messagesSentAgentId,
            messagesSentMeasure,
            onlineTimeAgentID,
            onlineTimeMeasure,
        )

        expect(result).toEqual({ value: null })
    })

    it('should return null if there is no messages sent data', () => {
        const result = calculateTotalCapacity(
            undefined,
            onlineTime,
            messagesSentAgentId,
            messagesSentMeasure,
            onlineTimeAgentID,
            onlineTimeMeasure,
        )

        expect(result).toEqual({ value: null })
    })

    it('should return 0 if its a wrong dimension', () => {
        const result = calculateTotalCapacity(
            messagesSentPayload,
            onlineTime,
            'wrong_id',
            messagesSentMeasure,
            onlineTimeAgentID,
            onlineTimeMeasure,
        )

        expect(result).toEqual({ value: 0 })
    })

    it('should return 0 if its a wrong measure', () => {
        const result = calculateTotalCapacity(
            messagesSentPayload,
            onlineTime,
            messagesSentAgentId,
            'wrong-measure',
            onlineTimeAgentID,
            onlineTimeMeasure,
        )

        expect(result).toEqual({ value: 0 })
    })
})

const fetchMetricPerDimensionV2Mock = assumeMock(fetchMetricPerDimensionV2)

describe('createFetchPerDimension', () => {
    const mockQuery = jest.fn()
    const mockQueryV2 = jest.fn()
    const statsFilters = {
        period: { start_datetime: '2023-01-01', end_datetime: '2023-01-31' },
    }
    const timezone = 'UTC'
    const sorting = undefined
    const dimensionId = '123'

    beforeEach(() => {
        jest.resetAllMocks()
        mockQuery.mockReturnValue({
            metricName: METRIC_NAMES.TEST_METRIC,
            measures: [],
            dimensions: [],
            filters: [],
        })
        mockQueryV2.mockReturnValue({
            metricName: METRIC_NAMES.TEST_METRIC,
            scope: 'test-scope',
            measures: [],
            filters: [],
        })
        fetchMetricPerDimensionV2Mock.mockResolvedValue({
            data: { value: 42, decile: 5, allData: [] },
            isFetching: false,
            isError: false,
        })
    })

    it('should call fetchMetricPerDimensionV2 with queryV2 when provided', async () => {
        const fetchFn = createFetchPerDimension(mockQuery, mockQueryV2)

        await fetchFn(statsFilters, timezone, sorting, dimensionId)

        expect(mockQuery).toHaveBeenCalledWith(statsFilters, timezone, sorting)
        expect(mockQueryV2).toHaveBeenCalledWith({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        })
        expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
            mockQuery.mock.results[0].value,
            mockQueryV2.mock.results[0].value,
            dimensionId,
        )
    })

    it('should call fetchMetricPerDimensionV2 with undefined queryV2 when not provided', async () => {
        const fetchFn = createFetchPerDimension(mockQuery)

        await fetchFn(statsFilters, timezone, sorting, dimensionId)

        expect(mockQuery).toHaveBeenCalledWith(statsFilters, timezone, sorting)
        expect(mockQueryV2).not.toHaveBeenCalled()
        expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
            mockQuery.mock.results[0].value,
            undefined,
            dimensionId,
        )
    })
})

describe('getDateRangeFromFilters', () => {
    it('should return empty array when periodStart and periodEnd values are null', () => {
        const granularity = ReportingGranularity.Hour

        expect(getPeriodDateTimesFromFilters(undefined, granularity)).toEqual(
            [],
        )
        expect(getPeriodDateTimesFromFilters([], granularity)).toEqual([])
    })

    it('should return empty array when periodStart and periodEnd are null', () => {
        const filters = [
            {
                member: TicketDimension.Channel,
                operator: ReportingFilterOperator.Equals,
                values: ['email'],
            },
            {
                member: TicketDimension.PeriodStart,
                operator: ReportingFilterOperator.AfterDate,
                values: null,
            },
            {
                member: TicketDimension.PeriodEnd,
                operator: ReportingFilterOperator.BeforeDate,
                values: null,
            },
        ]
        const granularity = ReportingGranularity.Hour

        const result = getPeriodDateTimesFromFilters(
            filters as ReportingFilter[],
            granularity,
        )

        expect(result).toEqual([])
    })

    it('should return date range when periodStart and periodEnd have values', () => {
        const filters = [
            {
                member: TicketDimension.PeriodStart,
                operator: ReportingFilterOperator.AfterDate,
                values: ['2022-01-02T00:00:00.000'],
            },
            {
                member: TicketDimension.PeriodEnd,
                operator: ReportingFilterOperator.BeforeDate,
                values: ['2022-01-02T05:00:00.000'],
            },
        ]
        const granularity = ReportingGranularity.Hour

        const result = getPeriodDateTimesFromFilters(filters, granularity)

        expect(result).toEqual([
            '2022-01-02T00:00:00.000',
            '2022-01-02T01:00:00.000',
            '2022-01-02T02:00:00.000',
            '2022-01-02T03:00:00.000',
            '2022-01-02T04:00:00.000',
        ])
    })

    it('should return empty array if InRange is null', () => {
        const filters = [
            {
                member: TicketDimension.Channel,
                operator: ReportingFilterOperator.Equals,
                values: ['email'],
            },
            {
                member: TicketDimension.PeriodStart,
                operator: ReportingFilterOperator.InDateRange,
                values: null,
            },
        ]
        const granularity = ReportingGranularity.Hour

        const result = getPeriodDateTimesFromFilters(
            filters as ReportingFilter[],
            granularity,
        )

        expect(result).toEqual([])
    })

    it('should return date range when InRange have values', () => {
        const filters = [
            {
                member: TicketDimension.PeriodStart,
                operator: ReportingFilterOperator.InDateRange,
                values: ['2022-01-02T00:00:00.000', '2022-01-02T05:00:00.000'],
            },
        ]
        const granularity = ReportingGranularity.Hour

        const result = getPeriodDateTimesFromFilters(filters, granularity)

        expect(result).toEqual([
            '2022-01-02T00:00:00.000',
            '2022-01-02T01:00:00.000',
            '2022-01-02T02:00:00.000',
            '2022-01-02T03:00:00.000',
            '2022-01-02T04:00:00.000',
        ])
    })

    it('should return date range when periodStart and periodEnd have values and granularity is undefined', () => {
        const filters = [
            {
                member: TicketDimension.PeriodStart,
                operator: ReportingFilterOperator.AfterDate,
                values: ['2022-01-02T00:00:00.000'],
            },
            {
                member: TicketDimension.PeriodEnd,
                operator: ReportingFilterOperator.BeforeDate,
                values: ['2022-01-02T05:00:00.000'],
            },
        ]

        expect(getPeriodDateTimesFromFilters(filters, undefined)).toEqual([
            '2022-01-02T00:00:00.000',
        ])
    })
})
