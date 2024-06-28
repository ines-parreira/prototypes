import {OrderDirection} from 'models/api/types'
import {HandleTimeCubeWithJoins} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketSLACubeWithJoins} from 'models/reporting/cubes/sla/TicketSLACube'
import {ticketHandleTimePerTicketDrillDownQueryFactory} from 'models/reporting/queryFactories/agentxp/ticketHandleTime'
import {
    breachedTicketsDrillDownQueryFactory,
    satisfiedOrBreachedTicketsDrillDownQueryFactory,
} from 'models/reporting/queryFactories/sla/satisfiedOrBreachedTickets'
import {closedTicketsPerTicketDrillDownQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {customerSatisfactionMetricDrillDownQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {firstResponseTimeMetricPerTicketDrillDownQueryFactory} from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import {resolutionTimeMetricPerTicketDrillDownQueryFactory} from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import {messagesPerTicketDrillDownQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesPerTicket'
import {messagesSentMetricPerTicketDrillDownQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {oneTouchTicketsPerTicketQueryFactory} from 'models/reporting/queryFactories/support-performance/oneTouchTickets'
import {openTicketsPerTicketDrillDownQueryFactory} from 'models/reporting/queryFactories/support-performance/openTickets'
import {ticketsCreatedPerTicketDrillDownQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {ticketsRepliedMetricPerTicketDrillDownQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {customFieldsTicketCountPerTicketDrillDownQueryFactory} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    ChannelColumnConfig,
    ChannelsTableColumns,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {
    AgentsTableColumn,
    OverviewMetric,
    SlaMetric,
    TicketFieldsMetric,
} from 'state/ui/stats/types'

export type DrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
) => ReportingQuery<
    | HelpdeskMessageCubeWithJoins
    | HandleTimeCubeWithJoins
    | TicketSLACubeWithJoins
>

const queryBuilderWithAgentFilter =
    (
        agentId: number,
        queryBuilder: DrillDownQueryFactory
    ): DrillDownQueryFactory =>
    (statsFilters: StatsFilters, timezone: string, sorting?: OrderDirection) =>
        queryBuilder({...statsFilters, agents: [agentId]}, timezone, sorting)

const queryBuilderWithChannelFilter =
    (
        channel: string,
        queryBuilder: DrillDownQueryFactory
    ): DrillDownQueryFactory =>
    (statsFilters: StatsFilters, timezone: string, sorting?: OrderDirection) =>
        queryBuilder({...statsFilters, channels: [channel]}, timezone, sorting)

export const getDrillDownQuery = (
    metricName: DrillDownMetric
): DrillDownQueryFactory => {
    switch (metricName.metricName) {
        case OverviewMetric.CustomerSatisfaction:
            return customerSatisfactionMetricDrillDownQueryFactory
        case OverviewMetric.MedianFirstResponseTime:
            return firstResponseTimeMetricPerTicketDrillDownQueryFactory
        case OverviewMetric.MedianResolutionTime:
            return resolutionTimeMetricPerTicketDrillDownQueryFactory
        case OverviewMetric.MessagesPerTicket:
            return messagesPerTicketDrillDownQueryFactory
        case OverviewMetric.MessagesSent:
            return messagesSentMetricPerTicketDrillDownQueryFactory
        case OverviewMetric.TicketsClosed:
            return closedTicketsPerTicketDrillDownQueryFactory
        case OverviewMetric.TicketsReplied:
            return ticketsRepliedMetricPerTicketDrillDownQueryFactory
        case OverviewMetric.OpenTickets:
            return openTicketsPerTicketDrillDownQueryFactory
        case OverviewMetric.TicketsCreated:
            return ticketsCreatedPerTicketDrillDownQueryFactory
        case OverviewMetric.OneTouchTickets:
            return oneTouchTicketsPerTicketQueryFactory
        case OverviewMetric.TicketHandleTime:
            return ticketHandleTimePerTicketDrillDownQueryFactory
        case AgentsTableColumn.CustomerSatisfaction:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                customerSatisfactionMetricDrillDownQueryFactory
            )
        case AgentsTableColumn.MedianFirstResponseTime:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                firstResponseTimeMetricPerTicketDrillDownQueryFactory
            )
        case AgentsTableColumn.MedianResolutionTime:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                resolutionTimeMetricPerTicketDrillDownQueryFactory
            )
        case AgentsTableColumn.MessagesSent:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                messagesSentMetricPerTicketDrillDownQueryFactory
            )
        case AgentsTableColumn.PercentageOfClosedTickets:
        case AgentsTableColumn.ClosedTicketsPerHour:
        case AgentsTableColumn.ClosedTickets:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                closedTicketsPerTicketDrillDownQueryFactory
            )
        case AgentsTableColumn.RepliedTickets:
        case AgentsTableColumn.RepliedTicketsPerHour:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                ticketsRepliedMetricPerTicketDrillDownQueryFactory
            )
        case AgentsTableColumn.OneTouchTickets:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                oneTouchTicketsPerTicketQueryFactory
            )
        case AgentsTableColumn.TicketHandleTime:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                ticketHandleTimePerTicketDrillDownQueryFactory
            )
        case SlaMetric.AchievementRate:
            return satisfiedOrBreachedTicketsDrillDownQueryFactory
        case SlaMetric.BreachedTicketsRate:
            return breachedTicketsDrillDownQueryFactory
        case ChannelsTableColumns.TicketHandleTime:
        case ChannelsTableColumns.ClosedTickets:
        case ChannelsTableColumns.TicketsCreated:
        case ChannelsTableColumns.CreatedTicketsPercentage:
        case ChannelsTableColumns.FirstResponseTime:
        case ChannelsTableColumns.MedianResolutionTime:
        case ChannelsTableColumns.TicketsReplied:
        case ChannelsTableColumns.MessagesSent:
        case ChannelsTableColumns.CustomerSatisfaction:
            return queryBuilderWithChannelFilter(
                metricName.perChannel,
                ChannelColumnConfig[metricName.metricName].drillDownQuery
            )
        case TicketFieldsMetric.TicketCustomFieldsTicketCount:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection
            ) =>
                customFieldsTicketCountPerTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    String(metricName.customFieldId),
                    metricName.customFieldValue,
                    metricName.dateRange || statsFilters.period,
                    sorting
                )
    }
}
