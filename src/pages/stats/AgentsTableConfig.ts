import {
    Metric,
    useClosedTicketsMetric,
    useCustomerSatisfactionMetric,
    useMedianFirstResponseTimeMetric,
    useMedianResolutionTimeMetric,
    useMessagesSentMetric,
    useOnlineTimeMetric,
    useTicketAverageHandleTimeMetric,
    useTicketsRepliedMetric,
} from 'hooks/reporting/metrics'
import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useMedianFirstResponseTimeMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
    useMessagesSentMetricPerAgent,
    useOnlineTimePerAgent,
    useTicketAverageHandleTimePerAgent,
    useTicketsRepliedMetricPerAgent,
} from 'hooks/reporting/metricsPerDimension'
import {useMessagesSentPerHour} from 'hooks/reporting/useMessagesSentPerHour'
import {useMessagesSentPerHourPerAgent} from 'hooks/reporting/useMessagesSentPerHourPerAgent'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {useOneTouchTicketsPercentageMetricPerAgent} from 'hooks/reporting/useOneTouchTicketsPercentageMetricPerAgent'
import {useOneTouchTicketsPercentageMetricTrend} from 'hooks/reporting/useOneTouchTicketsPercentageMetricTrend'
import {useTicketsClosedPerHour} from 'hooks/reporting/useTicketsClosedPerHour'
import {useTicketsClosedPerHourPerAgent} from 'hooks/reporting/useTicketsClosedPerHourPerAgent'
import {useTicketsRepliedPerHour} from 'hooks/reporting/useTicketsRepliedPerHour'
import {useTicketsRepliedPerHourPerAgent} from 'hooks/reporting/useTicketsRepliedPerHourPerAgent'
import {OrderDirection} from 'models/api/types'
import {AgentTimeTrackingMember} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {HelpdeskMessageMember} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesMember} from 'models/reporting/cubes/TicketMessagesCube'
import {StatsFilters} from 'models/stat/types'
import {isExtraLargeScreen} from 'pages/common/utils/mobile'
import {MetricValueFormat} from 'pages/stats/common/utils'
import {
    TableColumn,
    TableSetting,
    TableViewIdentifier,
} from 'state/ui/stats/types'
import {TooltipData} from './types'

export const TableColumnsOrder: TableColumn[] = [
    TableColumn.AgentName,
    TableColumn.ClosedTickets,
    TableColumn.PercentageOfClosedTickets,
    TableColumn.CustomerSatisfaction,
    TableColumn.RepliedTickets,
    TableColumn.MessagesSent,
    TableColumn.MedianFirstResponseTime,
    TableColumn.MedianResolutionTime,
    TableColumn.OneTouchTickets,
]

export const TableColumnsOrderWithOnlineTime = [
    ...TableColumnsOrder,
    TableColumn.OnlineTime,
    TableColumn.MessagesSentPerHour,
    TableColumn.RepliedTicketsPerHour,
    TableColumn.ClosedTicketsPerHour,
    TableColumn.TicketHandleTime,
]

export const agentPerformanceMetrics = TableColumnsOrder.map((column) => ({
    id: column,
    visibility: true,
}))

export const SystemTableViews: TableSetting = {
    active_view: TableViewIdentifier.AgentPerformanceMetrics,
    views: [],
}

export const agentPerformanceTableActiveView = {
    id: TableViewIdentifier.AgentPerformanceMetrics,
    name: 'Agent performance metrics',
    metrics: agentPerformanceMetrics,
}

export const TableLabels: Record<TableColumn, string> = {
    [TableColumn.AgentName]: 'Agent',
    [TableColumn.CustomerSatisfaction]: 'Customer Satisfaction',
    [TableColumn.MedianFirstResponseTime]: 'First Response Time',
    [TableColumn.MedianResolutionTime]: 'Resolution Time',
    [TableColumn.ClosedTickets]: 'Closed Tickets',
    [TableColumn.PercentageOfClosedTickets]: '% of Closed Tickets',
    [TableColumn.RepliedTickets]: 'Tickets Replied',
    [TableColumn.MessagesSent]: 'Messages Sent',
    [TableColumn.OneTouchTickets]: 'One-touch Tickets',
    [TableColumn.OnlineTime]: 'Online time',
    [TableColumn.MessagesSentPerHour]: 'Messages sent per hour',
    [TableColumn.RepliedTicketsPerHour]: 'Tickets replied per hour',
    [TableColumn.ClosedTicketsPerHour]: 'Closed Tickets per hour',
    [TableColumn.TicketHandleTime]: 'Ticket Handle time',
}

export const AGENT_NAME_COLUMN_WIDTH = isExtraLargeScreen() ? 200 : 300
export const METRIC_COLUMN_WIDTH = 160

export const HeaderTooltips: Record<TableColumn, TooltipData | undefined> = {
    [TableColumn.AgentName]: undefined,
    [TableColumn.CustomerSatisfaction]: {
        title: 'Average CSAT score for tickets assigned to the agent for which a survey was sent within the timeframe; surveys are sent following ticket resolution',
        link: 'https://link.gorgias.com/9a6',
    },
    [TableColumn.MedianFirstResponseTime]: {
        title: 'Median time between 1st customer message and 1st agent response, for tickets where the response was sent within the selected timeframe',
        link: 'https://link.gorgias.com/gs6',
    },
    [TableColumn.MedianResolutionTime]: {
        title: 'Median time between 1st customer message and the last time the ticket was closed, for tickets closed within the selected timeframe',
        link: 'https://link.gorgias.com/a9m',
    },
    [TableColumn.MessagesSent]: {
        title: 'Total number of messages sent by the agent within the selected timeframe',
        link: 'https://link.gorgias.com/114',
    },
    [TableColumn.PercentageOfClosedTickets]: {
        title: 'Proportion of closed tickets assigned to the agent compared to the total number of closed tickets assigned to all agents (excludes unassigned closed tickets)',
        link: 'https://link.gorgias.com/jd4',
    },
    [TableColumn.ClosedTickets]: {
        title: 'Number of unique closed tickets within the selected timeframe (that did not reopen), assigned to selected agent(s)/team(s)',
        link: 'https://link.gorgias.com/m9b',
    },
    [TableColumn.RepliedTickets]: {
        title: 'Number of unique tickets where the agent sent a message within the selected timeframe',
        link: 'https://link.gorgias.com/jhv',
    },
    [TableColumn.OneTouchTickets]: {
        title: 'Percentage of closed tickets assigned to the agent with exactly 1 message sent by the agent (or rule).',
        link: 'https://link.gorgias.com/t13',
    },
    [TableColumn.OnlineTime]: {
        title: 'Total time spent by the agent on Gorgias during the period. The metric is only affected by the date and agent filter.',
        link: 'https://link.gorgias.com/qdx',
    },
    [TableColumn.MessagesSentPerHour]: {
        title: 'Number of messages sent by the agent divided by the number of online hours',
    },
    [TableColumn.RepliedTicketsPerHour]: {
        title: 'Number of tickets replied by the agent divided by the number of online hours',
    },
    [TableColumn.ClosedTicketsPerHour]: {
        title: 'Number of closed tickets assigned to the agent divided by the number of online hours',
    },
    [TableColumn.TicketHandleTime]: {
        title: 'Average amount of time spent by any agent on the closed tickets assigned to the agent',
        link: 'https://link.gorgias.com/611',
    },
}

export const MetricFormat: Record<
    TableColumn,
    {format: MetricValueFormat; perAgent: boolean}
> = {
    [TableColumn.AgentName]: {format: 'integer', perAgent: false},
    [TableColumn.CustomerSatisfaction]: {format: 'decimal', perAgent: false},
    [TableColumn.MedianFirstResponseTime]: {
        format: 'duration',
        perAgent: false,
    },
    [TableColumn.MedianResolutionTime]: {format: 'duration', perAgent: false},
    [TableColumn.MessagesSent]: {format: 'integer', perAgent: true},
    [TableColumn.PercentageOfClosedTickets]: {
        format: 'percent',
        perAgent: true,
    },
    [TableColumn.ClosedTickets]: {format: 'integer', perAgent: true},
    [TableColumn.RepliedTickets]: {format: 'integer', perAgent: true},
    [TableColumn.OneTouchTickets]: {format: 'percent', perAgent: false},
    [TableColumn.OnlineTime]: {format: 'duration', perAgent: true},
    [TableColumn.MessagesSentPerHour]: {format: 'decimal', perAgent: false},
    [TableColumn.RepliedTicketsPerHour]: {format: 'decimal', perAgent: false},
    [TableColumn.ClosedTicketsPerHour]: {format: 'decimal', perAgent: false},
    [TableColumn.TicketHandleTime]: {format: 'duration', perAgent: false},
}

export const getColumnWidth = (column: TableColumn) =>
    column === TableColumn.AgentName
        ? AGENT_NAME_COLUMN_WIDTH
        : METRIC_COLUMN_WIDTH

export const getColumnAlignment = (column: TableColumn) =>
    column === TableColumn.AgentName ? 'left' : 'right'

export type MetricQueryPerAgentQuery = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) => MetricWithDecile

export type MetricQueryHook = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
) => Metric

export const getQuery = (column: TableColumn): MetricQueryPerAgentQuery => {
    switch (column) {
        case TableColumn.AgentName:
            return () => ({
                isFetching: false,
                isError: false,
                data: null,
            })
        case TableColumn.MedianFirstResponseTime:
            return useMedianFirstResponseTimeMetricPerAgent
        case TableColumn.RepliedTickets:
            return useTicketsRepliedMetricPerAgent
        case TableColumn.PercentageOfClosedTickets:
        case TableColumn.ClosedTickets:
            return useClosedTicketsMetricPerAgent
        case TableColumn.MessagesSent:
            return useMessagesSentMetricPerAgent
        case TableColumn.MedianResolutionTime:
            return useMedianResolutionTimeMetricPerAgent
        case TableColumn.CustomerSatisfaction:
            return useCustomerSatisfactionMetricPerAgent
        case TableColumn.OneTouchTickets:
            return useOneTouchTicketsPercentageMetricPerAgent
        case TableColumn.OnlineTime:
            return useOnlineTimePerAgent
        case TableColumn.MessagesSentPerHour:
            return useMessagesSentPerHourPerAgent
        case TableColumn.RepliedTicketsPerHour:
            return useTicketsRepliedPerHourPerAgent
        case TableColumn.ClosedTicketsPerHour:
            return useTicketsClosedPerHourPerAgent
        case TableColumn.TicketHandleTime:
            return useTicketAverageHandleTimePerAgent
    }
}

export const getSummaryQuery = (column: TableColumn): MetricQueryHook => {
    switch (column) {
        case TableColumn.AgentName:
            return () => ({
                isFetching: false,
                isError: false,
                data: undefined,
            })
        case TableColumn.MedianFirstResponseTime:
            return useMedianFirstResponseTimeMetric
        case TableColumn.RepliedTickets:
            return useTicketsRepliedMetric
        case TableColumn.PercentageOfClosedTickets:
            return () => ({
                data: {value: 100},
                isError: false,
                isFetching: false,
            })
        case TableColumn.ClosedTickets:
            return useClosedTicketsMetric
        case TableColumn.MessagesSent:
            return useMessagesSentMetric
        case TableColumn.MedianResolutionTime:
            return useMedianResolutionTimeMetric
        case TableColumn.CustomerSatisfaction:
            return useCustomerSatisfactionMetric
        case TableColumn.OneTouchTickets:
            return useOneTouchTicketsPercentageMetricTrend
        case TableColumn.OnlineTime:
            return useOnlineTimeMetric
        case TableColumn.MessagesSentPerHour:
            return useMessagesSentPerHour
        case TableColumn.RepliedTicketsPerHour:
            return useTicketsRepliedPerHour
        case TableColumn.ClosedTicketsPerHour:
            return useTicketsClosedPerHour
        case TableColumn.TicketHandleTime:
            return useTicketAverageHandleTimeMetric
    }
}

export const agentIdFields = [
    TicketMember.AssigneeUserId,
    TicketMessagesMember.FirstHelpdeskMessageUserId,
    HelpdeskMessageMember.SenderId,
    AgentTimeTrackingMember.UserId,
]
