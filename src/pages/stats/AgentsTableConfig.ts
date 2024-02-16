import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useMedianFirstResponseTimeMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
    useMessagesSentMetricPerAgent,
    useOnlineTimePerAgent,
    useTicketsRepliedMetricPerAgent,
} from 'hooks/reporting/metricsPerDimension'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {useOneTouchTicketsPercentageMetricPerAgent} from 'hooks/reporting/useOneTouchTicketsPercentageMetricPerAgent'
import {OrderDirection} from 'models/api/types'
import {StatsFilters} from 'models/stat/types'
import {isExtraLargeScreen} from 'pages/common/utils/mobile'
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
}

export const getColumnWidth = (column: TableColumn) =>
    column === TableColumn.AgentName
        ? AGENT_NAME_COLUMN_WIDTH
        : METRIC_COLUMN_WIDTH

export const getColumnAlignment = (column: TableColumn) =>
    column === TableColumn.AgentName ? 'left' : 'right'

export const getQuery = (
    column: TableColumn
): ((
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) => MetricWithDecile) => {
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
    }
}
