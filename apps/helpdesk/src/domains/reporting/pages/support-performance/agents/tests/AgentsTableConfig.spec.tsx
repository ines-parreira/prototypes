import {
    useClosedTicketsMetric,
    useCustomerSatisfactionMetric,
    useHumanResponseTimeAfterAiHandoffMetric,
    useMedianFirstResponseTimeMetric,
    useMedianResolutionTimeMetric,
    useMedianResponseTimeMetric,
    useMessagesReceivedMetric,
    useMessagesSentMetric,
    useOnlineTimeMetric,
    useTicketAverageHandleTimeMetric,
    useTicketsRepliedMetric,
} from 'domains/reporting/hooks/metrics'
import { useOneTouchTicketsPercentageMetricTrend } from 'domains/reporting/hooks/support-performance/overview/useOneTouchTicketsPercentageMetricTrend'
import { useZeroTouchTicketsMetricTrend } from 'domains/reporting/hooks/support-performance/overview/useZeroTouchTicketsMetricTrend'
import {
    useMessagesSentPerHour,
    useMessagesSentPerHourPerAgentTotalCapacity,
} from 'domains/reporting/hooks/useMessagesSentPerHour'
import {
    useTicketsClosedPerHour,
    useTicketsClosedPerHourPerAgentTotalCapacity,
} from 'domains/reporting/hooks/useTicketsClosedPerHour'
import {
    useTicketsRepliedPerHour,
    useTicketsRepliedPerHourPerAgentTotalCapacity,
} from 'domains/reporting/hooks/useTicketsRepliedPerHour'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    getAverageQuery,
    getTotalsQuery,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { AgentsTableColumn } from 'domains/reporting/state/ui/stats/types'

jest.mock('domains/reporting/hooks/metrics', () => ({
    useClosedTicketsMetric: jest.fn(),
    useMessagesSentMetric: jest.fn(),
    useMessagesReceivedMetric: jest.fn(),
    useTicketsRepliedMetric: jest.fn(),
}))
jest.mock('domains/reporting/hooks/useMessagesSentPerHour', () => ({
    useMessagesSentPerHour: jest.fn(),
}))
jest.mock('domains/reporting/hooks/useTicketsClosedPerHour', () => ({
    useTicketsClosedPerHour: jest.fn(),
}))
jest.mock('domains/reporting/hooks/useTicketsRepliedPerHour', () => ({
    useTicketsRepliedPerHour: jest.fn(),
}))

describe('getTotalsQuery', () => {
    it('should return useClosedTicketsMetric for ClosedTickets column', () => {
        const result = getTotalsQuery(AgentsTableColumn.ClosedTickets)
        expect(result).toBe(useClosedTicketsMetric)
    })

    it('should return useTicketsClosedPerHourPerAgentTotalCapacity for ClosedTicketsPerHour column', () => {
        const result = getTotalsQuery(AgentsTableColumn.ClosedTicketsPerHour)
        expect(result).toBe(useTicketsClosedPerHourPerAgentTotalCapacity)
    })

    it('should return useTicketsRepliedPerHourPerAgentTotalCapacity for RepliedTicketsPerHour column', () => {
        const result = getTotalsQuery(AgentsTableColumn.RepliedTicketsPerHour)
        expect(result).toBe(useTicketsRepliedPerHourPerAgentTotalCapacity)
    })

    it('should return useTicketsRepliedMetric for RepliedTickets column', () => {
        const result = getTotalsQuery(AgentsTableColumn.RepliedTickets)
        expect(result).toBe(useTicketsRepliedMetric)
    })

    it('should return useMessagesSentMetric for MessagesSent column', () => {
        const result = getTotalsQuery(AgentsTableColumn.MessagesSent)
        expect(result).toBe(useMessagesSentMetric)
    })

    it('should return useMessagesSentMetric for MessagesReceived column', () => {
        const result = getTotalsQuery(AgentsTableColumn.MessagesReceived)
        expect(result).toBe(useMessagesReceivedMetric)
    })

    it('should return useMessagesSentPerHourPerAgentTotalCapacity for MessagesSentPerHour column', () => {
        const result = getTotalsQuery(AgentsTableColumn.MessagesSentPerHour)
        expect(result).toBe(useMessagesSentPerHourPerAgentTotalCapacity)
    })

    describe('columns that return emptyMetricQueryHook', () => {
        const nonApplicableColumns = [
            AgentsTableColumn.AgentName,
            AgentsTableColumn.MedianFirstResponseTime,
            AgentsTableColumn.MedianResponseTime,
            AgentsTableColumn.MedianResolutionTime,
            AgentsTableColumn.CustomerSatisfaction,
            AgentsTableColumn.OneTouchTickets,
            AgentsTableColumn.OnlineTime,
            AgentsTableColumn.TicketHandleTime,
            AgentsTableColumn.PercentageOfClosedTickets,
        ]

        it.each(nonApplicableColumns)(
            'should return emptyMetricQueryHook for %s column',
            (column) => {
                const result = getTotalsQuery(column)

                const mockStatsFilters: StatsFilters = {} as StatsFilters

                const actualResult = result(mockStatsFilters, '', undefined)

                expect(actualResult).toEqual(
                    expect.objectContaining({
                        isFetching: false,
                        isError: false,
                        data: undefined,
                    }),
                )
            },
        )
    })
})

describe('getSummaryQuery', () => {
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: '',
            end_datetime: '',
        },
    }

    const metricHookMap: [AgentsTableColumn, any][] = [
        [AgentsTableColumn.ClosedTickets, useClosedTicketsMetric],
        [AgentsTableColumn.ClosedTicketsPerHour, useTicketsClosedPerHour],
        [AgentsTableColumn.RepliedTicketsPerHour, useTicketsRepliedPerHour],
        [AgentsTableColumn.RepliedTickets, useTicketsRepliedMetric],
        [AgentsTableColumn.MessagesSent, useMessagesSentMetric],
        [AgentsTableColumn.MessagesReceived, useMessagesReceivedMetric],
        [AgentsTableColumn.MessagesSentPerHour, useMessagesSentPerHour],
        [AgentsTableColumn.MedianResponseTime, useMedianResponseTimeMetric],
        [
            AgentsTableColumn.MedianFirstResponseTime,
            useMedianFirstResponseTimeMetric,
        ],
        [
            AgentsTableColumn.HumanResponseTimeAfterAiHandoff,
            useHumanResponseTimeAfterAiHandoffMetric,
        ],
        [AgentsTableColumn.MedianResolutionTime, useMedianResolutionTimeMetric],
        [AgentsTableColumn.CustomerSatisfaction, useCustomerSatisfactionMetric],
        [
            AgentsTableColumn.OneTouchTickets,
            useOneTouchTicketsPercentageMetricTrend,
        ],
        [AgentsTableColumn.OnlineTime, useOnlineTimeMetric],
        [AgentsTableColumn.TicketHandleTime, useTicketAverageHandleTimeMetric],
        [AgentsTableColumn.ZeroTouchTickets, useZeroTouchTicketsMetricTrend],
    ]

    it.each(metricHookMap)(
        'should return useClosedTicketsMetric for ClosedTickets column',
        (metric, hook) => {
            const result = getAverageQuery(metric)
            expect(result).toBe(hook)
        },
    )

    describe('columns that do not return a specific metric hook', () => {
        const nonApplicableColumns = [AgentsTableColumn.AgentName]

        it.each(nonApplicableColumns)(
            'should return emptyMetricQueryHook for %s column',
            (column) => {
                const result = getTotalsQuery(column)

                const actualResult = result(statsFilters, '', undefined)

                expect(actualResult).toEqual(
                    expect.objectContaining({
                        isFetching: false,
                        isError: false,
                        data: undefined,
                    }),
                )
            },
        )

        it.each([AgentsTableColumn.PercentageOfClosedTickets])(
            'should return hook that returns 100% for %s',
            (column) => {
                const result = getTotalsQuery(column)

                const actualResult = result(statsFilters, '', undefined)

                expect(actualResult).toEqual(
                    expect.objectContaining({
                        isFetching: false,
                        isError: false,
                        data: undefined,
                    }),
                )
            },
        )
    })
})
