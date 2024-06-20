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
} from 'hooks/reporting/metricsPerAgent'
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
import {
    isExtraLargeScreen,
    isMediumOrSmallScreen,
} from 'pages/common/utils/mobile'
import {MetricValueFormat} from 'pages/stats/common/utils'
import {
    CLOSED_TICKETS_PER_HOUR,
    CUSTOMER_SATISFACTION_LABEL,
    MEDIAN_FIRST_RESPONSE_TIME_LABEL,
    MEDIAN_RESOLUTION_TIME_LABEL,
    MESSAGES_SENT_LABEL,
    MESSAGES_SENT_PER_HOUR,
    ONE_TOUCH_TICKETS_LABEL,
    ONLINE_TIME_LABEL,
    PERCENT_OF_CLOSED_TICKETS,
    REPLIED_TICKETS_PER_HOUR,
    TICKET_HANDLE_TIME_LABEL,
    TICKETS_CLOSED_LABEL,
    TICKETS_REPLIED_LABEL,
} from 'services/reporting/constants'
import {
    AgentsTableColumn,
    AgentsTableViewIdentifier,
    TableSetting,
} from 'state/ui/stats/types'
import {TooltipData} from './types'

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
]

export const TableColumnsOrderWithOnlineTime = [
    ...TableColumnsOrder,
    AgentsTableColumn.OnlineTime,
    AgentsTableColumn.MessagesSentPerHour,
    AgentsTableColumn.RepliedTicketsPerHour,
    AgentsTableColumn.ClosedTicketsPerHour,
    AgentsTableColumn.TicketHandleTime,
]

export const agentPerformanceMetrics = TableColumnsOrderWithOnlineTime.map(
    (column) => ({
        id: column,
        visibility: true,
    })
)

export const AgentsTableViews: TableSetting<AgentsTableColumn> = {
    active_view: AgentsTableViewIdentifier.AgentPerformanceMetrics,
    views: [],
}

export const agentPerformanceTableActiveView = {
    id: AgentsTableViewIdentifier.AgentPerformanceMetrics,
    name: 'Agent performance metrics',
    metrics: agentPerformanceMetrics,
}

export const TableLabels: Record<AgentsTableColumn, string> = {
    [AgentsTableColumn.AgentName]: 'Agent',
    [AgentsTableColumn.CustomerSatisfaction]: CUSTOMER_SATISFACTION_LABEL,
    [AgentsTableColumn.MedianFirstResponseTime]:
        MEDIAN_FIRST_RESPONSE_TIME_LABEL,
    [AgentsTableColumn.MedianResolutionTime]: MEDIAN_RESOLUTION_TIME_LABEL,
    [AgentsTableColumn.ClosedTickets]: TICKETS_CLOSED_LABEL,
    [AgentsTableColumn.PercentageOfClosedTickets]: PERCENT_OF_CLOSED_TICKETS,
    [AgentsTableColumn.RepliedTickets]: TICKETS_REPLIED_LABEL,
    [AgentsTableColumn.MessagesSent]: MESSAGES_SENT_LABEL,
    [AgentsTableColumn.OneTouchTickets]: ONE_TOUCH_TICKETS_LABEL,
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

export const AgentsColumnConfig: Record<
    AgentsTableColumn,
    {
        format: MetricValueFormat
        hint: TooltipData | null
        perAgent: boolean
    }
> = {
    [AgentsTableColumn.AgentName]: {
        format: 'integer',
        hint: null,
        perAgent: false,
    },
    [AgentsTableColumn.CustomerSatisfaction]: {
        format: 'decimal',
        hint: {
            title: 'Average CSAT score for tickets assigned to the agent for which a survey was sent within the timeframe; surveys are sent following ticket resolution',
            link: 'https://link.gorgias.com/9a6',
        },
        perAgent: false,
    },
    [AgentsTableColumn.MedianFirstResponseTime]: {
        format: 'duration',
        hint: {
            title: 'Median time between 1st customer message and 1st agent response, for tickets where the response was sent within the selected timeframe',
            link: 'https://link.gorgias.com/gs6',
        },
        perAgent: false,
    },
    [AgentsTableColumn.MedianResolutionTime]: {
        format: 'duration',
        hint: {
            title: 'Median time between 1st customer message and the last time the ticket was closed, for tickets closed within the selected timeframe',
            link: 'https://link.gorgias.com/a9m',
        },
        perAgent: false,
    },
    [AgentsTableColumn.MessagesSent]: {
        format: 'integer',
        hint: {
            title: 'Total number of messages sent by the agent within the selected timeframe',
            link: 'https://link.gorgias.com/114',
        },
        perAgent: true,
    },
    [AgentsTableColumn.PercentageOfClosedTickets]: {
        format: 'percent',
        hint: {
            title: 'Proportion of closed tickets assigned to the agent compared to the total number of closed tickets assigned to all agents (excludes unassigned closed tickets)',
            link: 'https://link.gorgias.com/jd4',
        },
        perAgent: true,
    },
    [AgentsTableColumn.ClosedTickets]: {
        format: 'integer',
        hint: {
            title: 'Number of unique closed tickets within the selected timeframe (that did not reopen), assigned to selected agent(s)/team(s)',
            link: 'https://link.gorgias.com/m9b',
        },
        perAgent: true,
    },
    [AgentsTableColumn.RepliedTickets]: {
        format: 'integer',
        hint: {
            title: 'Number of unique tickets where the agent sent a message within the selected timeframe',
            link: 'https://link.gorgias.com/jhv',
        },
        perAgent: true,
    },
    [AgentsTableColumn.OneTouchTickets]: {
        format: 'percent',
        hint: {
            title: 'Percentage of closed tickets assigned to the agent with exactly 1 message sent by the agent (or rule).',
            link: 'https://link.gorgias.com/t13',
        },
        perAgent: false,
    },
    [AgentsTableColumn.OnlineTime]: {
        format: 'duration',
        hint: {
            title: 'Total time spent by the agent on Gorgias during the period. The metric is only affected by the date and agent filter.',
            link: 'https://link.gorgias.com/qdx',
        },
        perAgent: true,
    },
    [AgentsTableColumn.MessagesSentPerHour]: {
        format: 'decimal',
        hint: {
            title: 'Number of messages sent by the agent divided by the number of online hours',
            link: 'https://link.gorgias.com/5p9',
        },
        perAgent: false,
    },
    [AgentsTableColumn.RepliedTicketsPerHour]: {
        format: 'decimal',
        hint: {
            title: 'Number of tickets replied by the agent divided by the number of online hours',
            link: 'https://link.gorgias.com/zn8',
        },
        perAgent: false,
    },
    [AgentsTableColumn.ClosedTicketsPerHour]: {
        format: 'decimal',
        hint: {
            title: 'Number of closed tickets assigned to the agent divided by the number of online hours',
            link: 'https://link.gorgias.com/pcu',
        },
        perAgent: false,
    },
    [AgentsTableColumn.TicketHandleTime]: {
        format: 'duration',
        hint: {
            title: 'Average amount of time spent by any agent on the closed tickets assigned to the agent',
            link: 'https://link.gorgias.com/611',
        },
        perAgent: false,
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
    agentAssigneeId?: string
) => MetricWithDecile

export type MetricQueryHook = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
) => Metric

export const getQuery = (
    column: AgentsTableColumn
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
        case AgentsTableColumn.RepliedTickets:
            return useTicketsRepliedMetricPerAgent
        case AgentsTableColumn.PercentageOfClosedTickets:
        case AgentsTableColumn.ClosedTickets:
            return useClosedTicketsMetricPerAgent
        case AgentsTableColumn.MessagesSent:
            return useMessagesSentMetricPerAgent
        case AgentsTableColumn.MedianResolutionTime:
            return useMedianResolutionTimeMetricPerAgent
        case AgentsTableColumn.CustomerSatisfaction:
            return useCustomerSatisfactionMetricPerAgent
        case AgentsTableColumn.OneTouchTickets:
            return useOneTouchTicketsPercentageMetricPerAgent
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
                data: {value: 100},
                isError: false,
                isFetching: false,
            })
        case AgentsTableColumn.ClosedTickets:
            return useClosedTicketsMetric
        case AgentsTableColumn.MessagesSent:
            return useMessagesSentMetric
        case AgentsTableColumn.MedianResolutionTime:
            return useMedianResolutionTimeMetric
        case AgentsTableColumn.CustomerSatisfaction:
            return useCustomerSatisfactionMetric
        case AgentsTableColumn.OneTouchTickets:
            return useOneTouchTicketsPercentageMetricTrend
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

export const agentIdFields = [
    TicketMember.AssigneeUserId,
    TicketMessagesMember.FirstHelpdeskMessageUserId,
    HelpdeskMessageMember.SenderId,
    AgentTimeTrackingMember.UserId,
]
