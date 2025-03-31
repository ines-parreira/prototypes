import { User } from 'config/types/user'
import {
    Metric,
    useClosedTicketsMetric,
    useCustomerSatisfactionMetric,
    useMedianFirstResponseTimeMetric,
    useMedianResolutionTimeMetric,
    useMedianResponseTimeMetric,
    useMessagesReceivedMetric,
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
    useMedianResponseTimeMetricPerAgent,
    useMessagesReceivedMetricPerAgent,
    useMessagesSentMetricPerAgent,
    useOnlineTimePerAgent,
    useTicketAverageHandleTimePerAgent,
    useTicketsRepliedMetricPerAgent,
    useZeroTouchTicketsMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import { usePercentageOfClosedTicketsMetricPerAgent } from 'hooks/reporting/support-performance/agents/usePercentageOfClosedTicketsMetricPerAgent'
import { useOneTouchTicketsPercentageMetricPerAgent } from 'hooks/reporting/support-performance/overview/useOneTouchTicketsPercentageMetricPerAgent'
import { useOneTouchTicketsPercentageMetricTrend } from 'hooks/reporting/support-performance/overview/useOneTouchTicketsPercentageMetricTrend'
import { useZeroTouchTicketsMetricTrend } from 'hooks/reporting/support-performance/overview/useZeroTouchTicketsMetricTrend'
import {
    useMessagesSentPerHour,
    useMessagesSentPerHourPerAgentTotalCapacity,
} from 'hooks/reporting/useMessagesSentPerHour'
import { useMessagesSentPerHourPerAgent } from 'hooks/reporting/useMessagesSentPerHourPerAgent'
import { MetricWithDecile } from 'hooks/reporting/useMetricPerDimension'
import {
    useTicketsClosedPerHour,
    useTicketsClosedPerHourPerAgentTotalCapacity,
} from 'hooks/reporting/useTicketsClosedPerHour'
import { useTicketsClosedPerHourPerAgent } from 'hooks/reporting/useTicketsClosedPerHourPerAgent'
import {
    useTicketsRepliedPerHour,
    useTicketsRepliedPerHourPerAgentTotalCapacity,
} from 'hooks/reporting/useTicketsRepliedPerHour'
import { useTicketsRepliedPerHourPerAgent } from 'hooks/reporting/useTicketsRepliedPerHourPerAgent'
import { OrderDirection } from 'models/api/types'
import { AgentTimeTrackingMember } from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import { HelpdeskMessageMember } from 'models/reporting/cubes/HelpdeskMessageCube'
import { TicketMember } from 'models/reporting/cubes/TicketCube'
import { TicketMessagesMember } from 'models/reporting/cubes/TicketMessagesCube'
import { TicketMessagesEnrichedResponseTimesDimension } from 'models/reporting/cubes/TicketMessagesEnrichedResponseTimesCube'
import { ticketHandleTimePerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/closedTickets'
import { customerSatisfactionMetricDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import { firstResponseTimeMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import { resolutionTimeMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import { medianResponseTimeMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/medianResponseTime'
import { messagesReceivedMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/messagesReceived'
import { messagesSentMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsPerTicketQueryFactory } from 'models/reporting/queryFactories/support-performance/oneTouchTickets'
import { ticketsRepliedMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsPerTicketQueryFactory } from 'models/reporting/queryFactories/support-performance/zeroTouchTickets'
import { StatsFilters } from 'models/stat/types'
import {
    isExtraLargeScreen,
    isMediumOrSmallScreen,
} from 'pages/common/utils/mobile'
import { DrillDownQueryFactory } from 'pages/stats/common/drill-down/DrillDownTableConfig'
import { Domain } from 'pages/stats/common/drill-down/types'
import { MetricValueFormat } from 'pages/stats/common/utils'
import { TooltipData } from 'pages/stats/types'
import {
    AVERAGE_RESPONSE_TIME_LABEL,
    CLOSED_TICKETS_PER_HOUR,
    CUSTOMER_SATISFACTION_LABEL,
    MEDIAN_FIRST_RESPONSE_TIME_LABEL,
    MEDIAN_RESOLUTION_TIME_LABEL,
    MESSAGES_RECEIVED_LABEL,
    MESSAGES_SENT_LABEL,
    MESSAGES_SENT_PER_HOUR,
    ONE_TOUCH_TICKETS_LABEL,
    ONLINE_TIME_LABEL,
    PERCENT_OF_CLOSED_TICKETS,
    REPLIED_TICKETS_PER_HOUR,
    TICKET_HANDLE_TIME_LABEL,
    TICKETS_CLOSED_LABEL,
    TICKETS_REPLIED_LABEL,
    ZERO_TOUCH_TICKETS_LABEL,
} from 'services/reporting/constants'
import { AgentMetricColumn } from 'state/ui/stats/drillDownSlice'
import {
    AgentsTableColumn,
    AgentsTableRow,
    AgentsTableViewIdentifier,
    TableSetting,
} from 'state/ui/stats/types'

export const TableColumnsOrder: AgentsTableColumn[] = [
    AgentsTableColumn.AgentName,
    AgentsTableColumn.ClosedTickets,
    AgentsTableColumn.PercentageOfClosedTickets,
    AgentsTableColumn.CustomerSatisfaction,
    AgentsTableColumn.RepliedTickets,
    AgentsTableColumn.MessagesSent,
    AgentsTableColumn.MedianFirstResponseTime,
    AgentsTableColumn.MedianResolutionTime,
    AgentsTableColumn.OneTouchTickets,
    AgentsTableColumn.ZeroTouchTickets,
    AgentsTableColumn.OnlineTime,
    AgentsTableColumn.MessagesSentPerHour,
    AgentsTableColumn.RepliedTicketsPerHour,
    AgentsTableColumn.ClosedTicketsPerHour,
    AgentsTableColumn.TicketHandleTime,
    AgentsTableColumn.MessagesReceived,
]

export const TableRowsOrder: AgentsTableRow[] = [AgentsTableRow.Average]

export const TableRowsOrderWithTotal: AgentsTableRow[] = [
    AgentsTableRow.Average,
    AgentsTableRow.Total,
]

export const agentPerformanceMetrics = TableColumnsOrder.map((column) => ({
    id: column,
    visibility: true,
}))

export const agentPerformanceRows = TableRowsOrder.map((row) => ({
    id: row,
    visibility: true,
}))

export const AgentsTableViews: TableSetting<AgentsTableColumn, AgentsTableRow> =
    {
        active_view: AgentsTableViewIdentifier.AgentPerformanceMetrics,
        views: [],
    }

export const agentPerformanceTableActiveView = {
    id: AgentsTableViewIdentifier.AgentPerformanceMetrics,
    name: 'Agent performance metrics',
    metrics: agentPerformanceMetrics,
    rows: agentPerformanceRows,
}

export const TableRowLabels: Record<AgentsTableRow, string> = {
    [AgentsTableRow.Average]: 'Average',
    [AgentsTableRow.Total]: 'Total',
}

export const TableLabels: Record<AgentsTableColumn, string> = {
    [AgentsTableColumn.AgentName]: 'Agent',
    [AgentsTableColumn.CustomerSatisfaction]: CUSTOMER_SATISFACTION_LABEL,
    [AgentsTableColumn.MedianFirstResponseTime]:
        MEDIAN_FIRST_RESPONSE_TIME_LABEL,
    [AgentsTableColumn.MedianResponseTime]: AVERAGE_RESPONSE_TIME_LABEL,
    [AgentsTableColumn.MedianResolutionTime]: MEDIAN_RESOLUTION_TIME_LABEL,
    [AgentsTableColumn.ClosedTickets]: TICKETS_CLOSED_LABEL,
    [AgentsTableColumn.PercentageOfClosedTickets]: PERCENT_OF_CLOSED_TICKETS,
    [AgentsTableColumn.RepliedTickets]: TICKETS_REPLIED_LABEL,
    [AgentsTableColumn.MessagesSent]: MESSAGES_SENT_LABEL,
    [AgentsTableColumn.MessagesReceived]: MESSAGES_RECEIVED_LABEL,
    [AgentsTableColumn.OneTouchTickets]: ONE_TOUCH_TICKETS_LABEL,
    [AgentsTableColumn.ZeroTouchTickets]: ZERO_TOUCH_TICKETS_LABEL,
    [AgentsTableColumn.OnlineTime]: ONLINE_TIME_LABEL,
    [AgentsTableColumn.MessagesSentPerHour]: MESSAGES_SENT_PER_HOUR,
    [AgentsTableColumn.RepliedTicketsPerHour]: REPLIED_TICKETS_PER_HOUR,
    [AgentsTableColumn.ClosedTicketsPerHour]: CLOSED_TICKETS_PER_HOUR,
    [AgentsTableColumn.TicketHandleTime]: TICKET_HANDLE_TIME_LABEL,
}

export const AGENT_NAME_COLUMN_WIDTH = isExtraLargeScreen() ? 160 : 300
export const MOBILE_AGENT_NAME_COLUMN_WIDTH = 140
export const METRIC_COLUMN_WIDTH = 160
export const MOBILE_METRIC_COLUMN_WIDTH = 120

export const averageTooltip = {
    title: '',
    link: 'https://link.gorgias.com/a6l',
}

export const AgentsRowConfig: Record<
    AgentsTableRow,
    {
        hint: TooltipData | null
    }
> = {
    [AgentsTableRow.Total]: {
        hint: null,
    },
    [AgentsTableRow.Average]: {
        hint: null,
    },
}

export const AgentsColumnConfig: Record<
    AgentsTableColumn,
    {
        format: MetricValueFormat
        hint: TooltipData | null
        perAgent: boolean
        showMetric: boolean
        domain: Domain.Ticket
        drillDownQuery: DrillDownQueryFactory
    }
> = {
    [AgentsTableColumn.AgentName]: {
        format: 'integer',
        hint: null,
        perAgent: false,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: (() => {}) as any, // TODO cleanup
    },
    [AgentsTableColumn.CustomerSatisfaction]: {
        format: 'decimal',
        hint: {
            title: 'Average CSAT score for tickets assigned to the agent for which a survey was sent within the timeframe; surveys are sent following ticket resolution',
            link: 'https://link.gorgias.com/9a6',
        },
        perAgent: false,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: customerSatisfactionMetricDrillDownQueryFactory,
    },
    [AgentsTableColumn.MedianFirstResponseTime]: {
        format: 'duration',
        hint: {
            title: 'Median time between 1st customer message and 1st agent response, for tickets where the response was sent within the selected timeframe',
            link: 'https://link.gorgias.com/gs6',
        },
        perAgent: false,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: firstResponseTimeMetricPerTicketDrillDownQueryFactory,
    },
    [AgentsTableColumn.MedianResponseTime]: {
        format: 'duration',
        hint: {
            title: 'Average response time between message sent by customer and response from the ticket agent response',
        },
        perAgent: false,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: medianResponseTimeMetricPerTicketDrillDownQueryFactory,
    },
    [AgentsTableColumn.MedianResolutionTime]: {
        format: 'duration',
        hint: {
            title: 'Median time between 1st customer message and the last time the ticket was closed, for tickets closed within the selected timeframe',
            link: 'https://link.gorgias.com/a9m',
        },
        perAgent: false,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: resolutionTimeMetricPerTicketDrillDownQueryFactory,
    },
    [AgentsTableColumn.MessagesSent]: {
        format: 'integer',
        hint: {
            title: 'Total number of messages sent by the agent within the selected timeframe',
            link: 'https://link.gorgias.com/114',
        },
        perAgent: true,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: messagesSentMetricPerTicketDrillDownQueryFactory,
    },
    [AgentsTableColumn.MessagesReceived]: {
        format: 'integer',
        hint: {
            title: 'Number of messages received within the selected timeframe.',
        },
        perAgent: true,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: messagesReceivedMetricPerTicketDrillDownQueryFactory,
    },
    [AgentsTableColumn.PercentageOfClosedTickets]: {
        format: 'percent',
        hint: {
            title: 'Proportion of closed tickets assigned to the agent compared to the total number of closed tickets assigned to all agents (excludes unassigned closed tickets)',
            link: 'https://link.gorgias.com/jd4',
        },
        perAgent: true,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: closedTicketsPerTicketDrillDownQueryFactory,
    },
    [AgentsTableColumn.ClosedTickets]: {
        format: 'integer',
        hint: {
            title: 'Number of unique closed tickets within the selected timeframe (that did not reopen), assigned to selected agent(s)/team(s)',
            link: 'https://link.gorgias.com/m9b',
        },
        perAgent: true,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: closedTicketsPerTicketDrillDownQueryFactory,
    },
    [AgentsTableColumn.RepliedTickets]: {
        format: 'integer',
        hint: {
            title: 'Number of unique tickets where the agent sent a message within the selected timeframe',
            link: 'https://link.gorgias.com/jhv',
        },
        perAgent: true,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: ticketsRepliedMetricPerTicketDrillDownQueryFactory,
    },
    [AgentsTableColumn.OneTouchTickets]: {
        format: 'percent',
        hint: {
            title: 'Percentage of closed tickets assigned to the agent with exactly 1 message sent by the agent (or rule).',
            link: 'https://link.gorgias.com/t13',
        },
        perAgent: false,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: oneTouchTicketsPerTicketQueryFactory,
    },
    [AgentsTableColumn.ZeroTouchTickets]: {
        format: 'decimal',
        hint: {
            title: 'Number of tickets closed without agent reply.',
            link: '', // TODO: add link
        },
        perAgent: false,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: zeroTouchTicketsPerTicketQueryFactory,
    },
    [AgentsTableColumn.OnlineTime]: {
        format: 'duration',
        hint: {
            title: 'Total time spent by the agent on Gorgias during the period. The metric is only affected by the date and agent filter.',
            link: 'https://link.gorgias.com/qdx',
        },
        perAgent: true,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: (() => {}) as any, // TODO cleanup
    },
    [AgentsTableColumn.MessagesSentPerHour]: {
        format: 'decimal',
        hint: {
            title: 'Number of messages sent by the agent divided by the number of online hours',
            link: 'https://link.gorgias.com/5p9',
        },
        perAgent: false,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: messagesSentMetricPerTicketDrillDownQueryFactory,
    },
    [AgentsTableColumn.RepliedTicketsPerHour]: {
        format: 'decimal',
        hint: {
            title: 'Number of tickets replied by the agent divided by the number of online hours',
            link: 'https://link.gorgias.com/zn8',
        },
        perAgent: false,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: ticketsRepliedMetricPerTicketDrillDownQueryFactory,
    },
    [AgentsTableColumn.ClosedTicketsPerHour]: {
        format: 'decimal',
        hint: {
            title: 'Number of closed tickets assigned to the agent divided by the number of online hours',
            link: 'https://link.gorgias.com/pcu',
        },
        perAgent: false,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: closedTicketsPerTicketDrillDownQueryFactory,
    },
    [AgentsTableColumn.TicketHandleTime]: {
        format: 'duration',
        hint: {
            title: 'Average amount of time spent by any agent on the closed tickets assigned to the agent',
            link: 'https://link.gorgias.com/611',
        },
        perAgent: false,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: ticketHandleTimePerTicketDrillDownQueryFactory,
    },
}

export const getColumnWidth = (column: AgentsTableColumn) => {
    if (isMediumOrSmallScreen()) {
        return column === AgentsTableColumn.AgentName
            ? MOBILE_AGENT_NAME_COLUMN_WIDTH
            : MOBILE_METRIC_COLUMN_WIDTH
    }
    return column === AgentsTableColumn.AgentName
        ? AGENT_NAME_COLUMN_WIDTH
        : METRIC_COLUMN_WIDTH
}

export const getColumnAlignment = (column: AgentsTableColumn) =>
    column === AgentsTableColumn.AgentName ? 'left' : 'right'

export type MetricQueryPerAgentQuery = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) => MetricWithDecile

export type MetricQueryHook = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
) => Metric

export const getQuery = (
    column: AgentsTableColumn,
): MetricQueryPerAgentQuery => {
    switch (column) {
        case AgentsTableColumn.AgentName:
            return () => ({
                isFetching: false,
                isError: false,
                data: null,
            })
        case AgentsTableColumn.MedianFirstResponseTime:
            return useMedianFirstResponseTimeMetricPerAgent
        case AgentsTableColumn.MedianResponseTime:
            return useMedianResponseTimeMetricPerAgent
        case AgentsTableColumn.RepliedTickets:
            return useTicketsRepliedMetricPerAgent
        case AgentsTableColumn.PercentageOfClosedTickets:
            return usePercentageOfClosedTicketsMetricPerAgent
        case AgentsTableColumn.ClosedTickets:
            return useClosedTicketsMetricPerAgent
        case AgentsTableColumn.MessagesSent:
            return useMessagesSentMetricPerAgent
        case AgentsTableColumn.MessagesReceived:
            return useMessagesReceivedMetricPerAgent
        case AgentsTableColumn.MedianResolutionTime:
            return useMedianResolutionTimeMetricPerAgent
        case AgentsTableColumn.CustomerSatisfaction:
            return useCustomerSatisfactionMetricPerAgent
        case AgentsTableColumn.OneTouchTickets:
            return useOneTouchTicketsPercentageMetricPerAgent
        case AgentsTableColumn.ZeroTouchTickets:
            return useZeroTouchTicketsMetricPerAgent
        case AgentsTableColumn.OnlineTime:
            return useOnlineTimePerAgent
        case AgentsTableColumn.MessagesSentPerHour:
            return useMessagesSentPerHourPerAgent
        case AgentsTableColumn.RepliedTicketsPerHour:
            return useTicketsRepliedPerHourPerAgent
        case AgentsTableColumn.ClosedTicketsPerHour:
            return useTicketsClosedPerHourPerAgent
        case AgentsTableColumn.TicketHandleTime:
            return useTicketAverageHandleTimePerAgent
    }
}

export const getSummaryQuery = (column: AgentsTableColumn): MetricQueryHook => {
    switch (column) {
        case AgentsTableColumn.AgentName:
            return () => ({
                isFetching: false,
                isError: false,
                data: undefined,
            })
        case AgentsTableColumn.MedianFirstResponseTime:
            return useMedianFirstResponseTimeMetric
        case AgentsTableColumn.RepliedTickets:
            return useTicketsRepliedMetric
        case AgentsTableColumn.PercentageOfClosedTickets:
            return () => ({
                data: { value: 100 },
                isError: false,
                isFetching: false,
            })
        case AgentsTableColumn.ClosedTickets:
            return useClosedTicketsMetric
        case AgentsTableColumn.MessagesSent:
            return useMessagesSentMetric
        case AgentsTableColumn.MessagesReceived:
            return useMessagesReceivedMetric
        case AgentsTableColumn.MedianResolutionTime:
            return useMedianResolutionTimeMetric
        case AgentsTableColumn.MedianResponseTime:
            return useMedianResponseTimeMetric
        case AgentsTableColumn.CustomerSatisfaction:
            return useCustomerSatisfactionMetric
        case AgentsTableColumn.OneTouchTickets:
            return useOneTouchTicketsPercentageMetricTrend
        case AgentsTableColumn.ZeroTouchTickets:
            return useZeroTouchTicketsMetricTrend
        case AgentsTableColumn.OnlineTime:
            return useOnlineTimeMetric
        case AgentsTableColumn.MessagesSentPerHour:
            return useMessagesSentPerHour
        case AgentsTableColumn.RepliedTicketsPerHour:
            return useTicketsRepliedPerHour
        case AgentsTableColumn.ClosedTicketsPerHour:
            return useTicketsClosedPerHour
        case AgentsTableColumn.TicketHandleTime:
            return useTicketAverageHandleTimeMetric
    }
}

export const getTotalsQuery = (column: AgentsTableColumn): MetricQueryHook => {
    switch (column) {
        case AgentsTableColumn.ClosedTickets:
            return useClosedTicketsMetric
        case AgentsTableColumn.ClosedTicketsPerHour:
            return useTicketsClosedPerHourPerAgentTotalCapacity
        case AgentsTableColumn.RepliedTicketsPerHour:
            return useTicketsRepliedPerHourPerAgentTotalCapacity
        case AgentsTableColumn.RepliedTickets:
            return useTicketsRepliedMetric
        case AgentsTableColumn.MessagesSent:
            return useMessagesSentMetric
        case AgentsTableColumn.MessagesReceived:
            return useMessagesReceivedMetric
        case AgentsTableColumn.MessagesSentPerHour:
            return useMessagesSentPerHourPerAgentTotalCapacity
        case AgentsTableColumn.AgentName:
        case AgentsTableColumn.MedianFirstResponseTime:
        case AgentsTableColumn.MedianResponseTime:
        case AgentsTableColumn.MedianResolutionTime:
        case AgentsTableColumn.CustomerSatisfaction:
        case AgentsTableColumn.OneTouchTickets:
        case AgentsTableColumn.OnlineTime:
        case AgentsTableColumn.TicketHandleTime:
        case AgentsTableColumn.PercentageOfClosedTickets:
        case AgentsTableColumn.ZeroTouchTickets:
            return () => ({
                isFetching: false,
                isError: false,
                data: undefined,
            })
    }
}

export const agentIdFields = [
    TicketMember.AssigneeUserId,
    TicketMember.MessageSenderId,
    TicketMember.MessageSenderIdToExclude,
    TicketMessagesMember.FirstHelpdeskMessageUserId,
    TicketMessagesEnrichedResponseTimesDimension.TicketMessageUserId,
    HelpdeskMessageMember.SenderId,
    AgentTimeTrackingMember.UserId,
]

const isAgentsMetric = (
    column: AgentsTableColumn,
): column is AgentMetricColumn =>
    column !== AgentsTableColumn.AgentName &&
    column !== AgentsTableColumn.OnlineTime &&
    column !== AgentsTableColumn.MessagesSentPerHour

export const buildAgentMetric = (column: AgentMetricColumn, agent: User) => ({
    title: `${TableLabels[column]} | ${agent.name}`,
    metricName: column,
    perAgentId: agent.id,
})

export function getDrillDownMetricData(column: AgentsTableColumn, agent: User) {
    if (isAgentsMetric(column)) {
        return buildAgentMetric(column, agent)
    }
    return null
}
