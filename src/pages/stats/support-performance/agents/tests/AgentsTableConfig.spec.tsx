import {
    useClosedTicketsMetric,
    useMessagesReceivedMetric,
    useMessagesSentMetric,
    useTicketsRepliedMetric,
} from 'hooks/reporting/metrics'
import { useMessagesSentPerHourPerAgentTotalCapacity } from 'hooks/reporting/useMessagesSentPerHour'
import { useTicketsClosedPerHourPerAgentTotalCapacity } from 'hooks/reporting/useTicketsClosedPerHour'
import { useTicketsRepliedPerHourPerAgentTotalCapacity } from 'hooks/reporting/useTicketsRepliedPerHour'
import { StatsFilters } from 'models/stat/types'
import { getTotalsQuery } from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { AgentsTableColumn } from 'state/ui/stats/types'

jest.mock('hooks/reporting/metrics', () => ({
    useClosedTicketsMetric: jest.fn(),
    useMessagesSentMetric: jest.fn(),
    useMessagesReceivedMetric: jest.fn(),
    useTicketsRepliedMetric: jest.fn(),
}))
jest.mock('hooks/reporting/useMessagesSentPerHour', () => ({
    useMessagesSentPerHour: jest.fn(),
}))
jest.mock('hooks/reporting/useTicketsClosedPerHour', () => ({
    useTicketsClosedPerHour: jest.fn(),
}))
jest.mock('hooks/reporting/useTicketsRepliedPerHour', () => ({
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
