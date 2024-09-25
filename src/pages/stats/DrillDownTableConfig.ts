import {OrderDirection} from 'models/api/types'
import {DrillDownReportingQuery} from 'models/job/types'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import {ticketHandleTimePerTicketDrillDownQueryFactory} from 'models/reporting/queryFactories/agentxp/ticketHandleTime'
import {communicationSkillsDrillDownQueryFactory} from 'models/reporting/queryFactories/auto-qa/communicationSkillsQueryFactory'
import {resolutionCompletenessDrillDownQueryFactory} from 'models/reporting/queryFactories/auto-qa/resolutionCompletenessQueryFactory'
import {reviewedClosedTicketsDrillDownQueryFactory} from 'models/reporting/queryFactories/auto-qa/reviewedClosedTicketsQueryFactory'
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
import {
    isFilterWithLogicalOperator,
    withDefaultLogicalOperator,
} from 'models/reporting/queryFactories/utils'
import {
    connectedCallsListQueryFactory,
    liveDashboardConnectedCallsListQueryFactory,
    liveDashboardWaitingTimeCallsListQueryFactory,
    voiceCallListQueryFactory,
    waitingTimeCallsListQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import {
    FilterKey,
    LegacyStatsFilters,
    StatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'models/stat/types'
import {campaignSalesDrillDownQueryFactory} from 'pages/stats/convert/clients/queryFactories/campaignSalesDrillDownQueryFactory'
import {AutoQAAgentsTableColumn} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import {
    ChannelColumnConfig,
    ChannelsTableColumns,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {
    AgentsTableColumn,
    AutoQAMetric,
    ConvertMetric,
    OverviewMetric,
    SlaMetric,
    TicketFieldsMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'state/ui/stats/types'

export type DrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
) => DrillDownReportingQuery

const queryBuilderWithAgentFilter =
    (
        agentId: number,
        queryBuilder: DrillDownQueryFactory
    ): DrillDownQueryFactory =>
    (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection
    ) => {
        const areFiltersWithLogicalOperator = Object.values(FilterKey).some(
            (val) =>
                val !== FilterKey.Period &&
                isFilterWithLogicalOperator(statsFilters?.[val] || [])
        )
        const statsFiltersWithLogicalOperators = areFiltersWithLogicalOperator
            ? (statsFilters as StatsFiltersWithLogicalOperator)
            : fromLegacyStatsFilters(statsFilters as LegacyStatsFilters)

        return queryBuilder(
            {
                ...statsFiltersWithLogicalOperators,
                agents: withDefaultLogicalOperator(
                    [agentId],
                    statsFiltersWithLogicalOperators[FilterKey.Agents]?.operator
                ),
            },
            timezone,
            sorting
        )
    }

const queryBuilderWithChannelFilter =
    (
        channel: string,
        queryBuilder: DrillDownQueryFactory
    ): DrillDownQueryFactory =>
    (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection
    ) => {
        const areFiltersWithLogicalOperator = Object.values(FilterKey).some(
            (val) =>
                val !== FilterKey.Period &&
                isFilterWithLogicalOperator(statsFilters?.[val] || [])
        )
        const statsFiltersWithLogicalOperators = areFiltersWithLogicalOperator
            ? (statsFilters as StatsFiltersWithLogicalOperator)
            : fromLegacyStatsFilters(statsFilters as LegacyStatsFilters)

        return queryBuilder(
            {
                ...statsFiltersWithLogicalOperators,
                channels: withDefaultLogicalOperator(
                    [channel],
                    statsFiltersWithLogicalOperators[FilterKey.Channels]
                        ?.operator
                ),
            },
            timezone,
            sorting
        )
    }

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
        case AutoQAMetric.ReviewedClosedTickets:
            return reviewedClosedTicketsDrillDownQueryFactory
        case AutoQAAgentsTableColumn.ResolutionCompleteness:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                resolutionCompletenessDrillDownQueryFactory
            )
        case AutoQAAgentsTableColumn.CommunicationSkills:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                communicationSkillsDrillDownQueryFactory
            )
        case AutoQAAgentsTableColumn.ReviewedClosedTickets:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                reviewedClosedTicketsDrillDownQueryFactory
            )
        case AutoQAMetric.ResolutionCompleteness:
            return resolutionCompletenessDrillDownQueryFactory
        case AutoQAMetric.CommunicationSkills:
            return communicationSkillsDrillDownQueryFactory
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
        case ConvertMetric.CampaignSalesCount:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection
            ) =>
                campaignSalesDrillDownQueryFactory(
                    metricName.shopName,
                    metricName.selectedCampaignIds,
                    metricName.campaignsOperator,
                    statsFilters,
                    timezone,
                    sorting,
                    metricName.abVariant
                )
        case VoiceMetric.AverageTalkTime:
            return (statsFilters: StatsFilters, timezone: string) =>
                connectedCallsListQueryFactory(statsFilters, timezone)
        case VoiceMetric.AverageWaitTime:
            return (statsFilters: StatsFilters, timezone: string) =>
                waitingTimeCallsListQueryFactory(
                    statsFilters,
                    timezone,
                    VoiceCallSegment.inboundCalls
                )
        case VoiceMetric.QueueAverageTalkTime:
            return (statsFilters: StatsFilters) =>
                liveDashboardConnectedCallsListQueryFactory(statsFilters)
        case VoiceMetric.QueueAverageWaitTime:
            return (statsFilters: StatsFilters) =>
                liveDashboardWaitingTimeCallsListQueryFactory(
                    statsFilters,
                    VoiceCallSegment.inboundCalls
                )
        case VoiceAgentsMetric.AgentTotalCalls:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallListQueryFactory(statsFilters, timezone)
            )
        case VoiceAgentsMetric.AgentInboundAnsweredCalls:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallListQueryFactory(
                        statsFilters,
                        timezone,
                        VoiceCallSegment.answeredCallsByAgent
                    )
            )
        case VoiceAgentsMetric.AgentInboundMissedCalls:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallListQueryFactory(
                        statsFilters,
                        timezone,
                        VoiceCallSegment.missedCallsByAgent
                    )
            )
        case VoiceAgentsMetric.AgentOutboundCalls:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallListQueryFactory(
                        statsFilters,
                        timezone,
                        VoiceCallSegment.outboundCalls
                    )
            )
        case VoiceAgentsMetric.AgentAverageTalkTime:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                (statsFilters: StatsFilters, timezone: string) =>
                    connectedCallsListQueryFactory(statsFilters, timezone)
            )
    }
}
