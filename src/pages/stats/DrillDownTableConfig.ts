import { OrderDirection } from 'models/api/types'
import { DrillDownReportingQuery } from 'models/job/types'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import { TicketMessagesDimension } from 'models/reporting/cubes/TicketMessagesCube'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { ticketHandleTimePerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/agentxp/ticketHandleTime'
import { accuracyDrillDownQueryFactory } from 'models/reporting/queryFactories/auto-qa/accuracyQueryFactory'
import { brandVoiceDrillDownQueryFactory } from 'models/reporting/queryFactories/auto-qa/brandVoiceQueryFactory'
import { communicationSkillsDrillDownQueryFactory } from 'models/reporting/queryFactories/auto-qa/communicationSkillsQueryFactory'
import { efficiencyDrillDownQueryFactory } from 'models/reporting/queryFactories/auto-qa/efficiencyQueryFactory'
import { internalComplianceDrillDownQueryFactory } from 'models/reporting/queryFactories/auto-qa/internalComplianceQueryFactory'
import { languageProficiencyDrillDownQueryFactory } from 'models/reporting/queryFactories/auto-qa/languageProficiencyQueryFactory'
import { resolutionCompletenessDrillDownQueryFactory } from 'models/reporting/queryFactories/auto-qa/resolutionCompletenessQueryFactory'
import { reviewedClosedTicketsDrillDownQueryFactory } from 'models/reporting/queryFactories/auto-qa/reviewedClosedTicketsQueryFactory'
import { averageCSATScorePerDimensionDrillDownQueryFactory } from 'models/reporting/queryFactories/satisfaction/averageCSATScorePerDimensionQueryFactory'
import {
    averageScoreDrillDownQueryFactory,
    averageScoreDrillDownWithScoreQueryBuilder,
    SatisfactionSurveyScore,
} from 'models/reporting/queryFactories/satisfaction/averageScoreQueryFactory'
import { responseRateDrillDownQueryFactory } from 'models/reporting/queryFactories/satisfaction/responseRateQueryFactory'
import { satisfactionScoreDrillDownQueryFactory } from 'models/reporting/queryFactories/satisfaction/satisfactionScoreQueryFactory'
import { surveysSentDrillDownQueryFactory } from 'models/reporting/queryFactories/satisfaction/surveysSentQueryFactory'
import {
    breachedTicketsDrillDownQueryFactory,
    satisfiedOrBreachedTicketsDrillDownQueryFactory,
} from 'models/reporting/queryFactories/sla/satisfiedOrBreachedTickets'
import { closedTicketsPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/closedTickets'
import { customerSatisfactionMetricDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import { firstResponseTimeMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import { resolutionTimeMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import { messagesPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/messagesPerTicket'
import { messagesReceivedMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/messagesReceived'
import { messagesSentMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsPerTicketQueryFactory } from 'models/reporting/queryFactories/support-performance/oneTouchTickets'
import { openTicketsPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/openTickets'
import { ticketsCreatedPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsPerTicketQueryFactory } from 'models/reporting/queryFactories/support-performance/zeroTouchTickets'
import {
    aiInsightsCustomerSatisfactionMetricDrillDownQueryFactory,
    coverageRateTicketDrillDownQueryFactory,
    customFieldsTicketCountPerIntentLevelPerTicketDrillDownQueryFactory,
    customFieldsTicketCountPerTicketDrillDownQueryFactory,
} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import { tagsTicketCountDrillDownQueryFactory } from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import {
    connectedCallsListQueryFactory,
    liveDashboardConnectedCallsListQueryFactory,
    liveDashBoardVoiceCallListQueryFactory,
    liveDashboardWaitingTimeCallsListQueryFactory,
    voiceCallListQueryFactory,
    waitingTimeCallsListQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import { FilterKey, StatsFilters } from 'models/stat/types'
import { campaignSalesDrillDownQueryFactory } from 'pages/stats/convert/clients/queryFactories/campaignSalesDrillDownQueryFactory'
import { AutoQAAgentsTableColumn } from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { ChannelColumnConfig } from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import { OverviewMetric } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { DrillDownMetric } from 'state/ui/stats/drillDownSlice'
import {
    AgentsTableColumn,
    AIInsightsMetric,
    AutoQAMetric,
    ChannelsTableColumns,
    ConvertMetric,
    SatisfactionAverageSurveyScoreMetric,
    SatisfactionMetric,
    SlaMetric,
    TagsMetric,
    TicketFieldsMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'state/ui/stats/types'

export type DrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
) => DrillDownReportingQuery

const queryBuilderWithAgentFilter =
    (
        agentId: number,
        queryBuilder: DrillDownQueryFactory,
    ): DrillDownQueryFactory =>
    (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
    ) => {
        return queryBuilder(
            {
                ...statsFilters,
                agents: withDefaultLogicalOperator([agentId]),
            },
            timezone,
            sorting,
        )
    }

const queryBuilderWithChannelFilter =
    (
        channel: string,
        queryBuilder: DrillDownQueryFactory,
    ): DrillDownQueryFactory =>
    (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
    ) => {
        return queryBuilder(
            {
                ...statsFilters,
                channels: withDefaultLogicalOperator(
                    [channel],
                    statsFilters[FilterKey.Channels]?.operator,
                ),
            },
            timezone,
            sorting,
        )
    }

export const getDrillDownQuery = (
    metricName: DrillDownMetric,
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
        case OverviewMetric.MessagesReceived:
            return messagesReceivedMetricPerTicketDrillDownQueryFactory
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
        case OverviewMetric.ZeroTouchTickets:
            return zeroTouchTicketsPerTicketQueryFactory
        case OverviewMetric.TicketHandleTime:
            return ticketHandleTimePerTicketDrillDownQueryFactory
        case AgentsTableColumn.CustomerSatisfaction:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                customerSatisfactionMetricDrillDownQueryFactory,
            )
        case AgentsTableColumn.MedianFirstResponseTime:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                firstResponseTimeMetricPerTicketDrillDownQueryFactory,
            )
        case AgentsTableColumn.MedianResolutionTime:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                resolutionTimeMetricPerTicketDrillDownQueryFactory,
            )
        case AgentsTableColumn.MessagesSent:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                messagesSentMetricPerTicketDrillDownQueryFactory,
            )
        case AgentsTableColumn.MessagesReceived:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                messagesReceivedMetricPerTicketDrillDownQueryFactory,
            )
        case AgentsTableColumn.PercentageOfClosedTickets:
        case AgentsTableColumn.ClosedTicketsPerHour:
        case AgentsTableColumn.ClosedTickets:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                closedTicketsPerTicketDrillDownQueryFactory,
            )
        case AgentsTableColumn.RepliedTickets:
        case AgentsTableColumn.RepliedTicketsPerHour:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                ticketsRepliedMetricPerTicketDrillDownQueryFactory,
            )
        case AgentsTableColumn.OneTouchTickets:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                oneTouchTicketsPerTicketQueryFactory,
            )
        case AgentsTableColumn.ZeroTouchTickets:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                zeroTouchTicketsPerTicketQueryFactory,
            )
        case AgentsTableColumn.TicketHandleTime:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                ticketHandleTimePerTicketDrillDownQueryFactory,
            )
        case AutoQAMetric.ReviewedClosedTickets:
            return reviewedClosedTicketsDrillDownQueryFactory
        case AutoQAAgentsTableColumn.ResolutionCompleteness:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                resolutionCompletenessDrillDownQueryFactory,
            )
        case AutoQAAgentsTableColumn.CommunicationSkills:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                communicationSkillsDrillDownQueryFactory,
            )
        case AutoQAAgentsTableColumn.LanguageProficiency:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                languageProficiencyDrillDownQueryFactory,
            )
        case AutoQAAgentsTableColumn.Accuracy:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                accuracyDrillDownQueryFactory,
            )
        case AutoQAAgentsTableColumn.Efficiency:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                efficiencyDrillDownQueryFactory,
            )
        case AutoQAAgentsTableColumn.InternalCompliance:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                internalComplianceDrillDownQueryFactory,
            )
        case AutoQAAgentsTableColumn.BrandVoice:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                brandVoiceDrillDownQueryFactory,
            )
        case AutoQAAgentsTableColumn.ReviewedClosedTickets:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                reviewedClosedTicketsDrillDownQueryFactory,
            )
        case AutoQAMetric.ResolutionCompleteness:
            return resolutionCompletenessDrillDownQueryFactory
        case AutoQAMetric.CommunicationSkills:
            return communicationSkillsDrillDownQueryFactory
        case AutoQAMetric.LanguageProficiency:
            return languageProficiencyDrillDownQueryFactory
        case SatisfactionMetric.AverageSurveyScore:
            return averageScoreDrillDownQueryFactory
        case SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreOne:
            return averageScoreDrillDownWithScoreQueryBuilder(
                SatisfactionSurveyScore.One,
            )
        case SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreTwo:
            return averageScoreDrillDownWithScoreQueryBuilder(
                SatisfactionSurveyScore.Two,
            )
        case SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreThree:
            return averageScoreDrillDownWithScoreQueryBuilder(
                SatisfactionSurveyScore.Three,
            )
        case SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreFour:
            return averageScoreDrillDownWithScoreQueryBuilder(
                SatisfactionSurveyScore.Four,
            )
        case SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreFive:
            return averageScoreDrillDownWithScoreQueryBuilder(
                SatisfactionSurveyScore.Five,
            )
        case SatisfactionMetric.SatisfactionScore:
            return satisfactionScoreDrillDownQueryFactory
        case SatisfactionMetric.ResponseRate:
            return responseRateDrillDownQueryFactory
        case SatisfactionMetric.SurveysSent:
            return surveysSentDrillDownQueryFactory
        case SatisfactionMetric.AverageCSATPerAssignee:
            return averageCSATScorePerDimensionDrillDownQueryFactory(
                TicketDimension.AssigneeUserId,
            )
        case SatisfactionMetric.AverageCSATPerChannel:
            return averageCSATScorePerDimensionDrillDownQueryFactory(
                TicketDimension.Channel,
            )
        case SatisfactionMetric.AverageCSATPerIntegration:
            return averageCSATScorePerDimensionDrillDownQueryFactory(
                TicketMessagesDimension.Integration,
            )
        case AutoQAMetric.Accuracy:
            return accuracyDrillDownQueryFactory
        case AutoQAMetric.Efficiency:
            return efficiencyDrillDownQueryFactory
        case AutoQAMetric.InternalCompliance:
            return internalComplianceDrillDownQueryFactory
        case AutoQAMetric.BrandVoice:
            return brandVoiceDrillDownQueryFactory
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
        case ChannelsTableColumns.MessagesReceived:
        case ChannelsTableColumns.CustomerSatisfaction:
            return queryBuilderWithChannelFilter(
                metricName.perChannel,
                ChannelColumnConfig[metricName.metricName].drillDownQuery,
            )
        case TagsMetric.TicketCount:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                tagsTicketCountDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    metricName.tagId,
                    metricName.dateRange || statsFilters.period,
                    sorting,
                )
        case TicketFieldsMetric.TicketCustomFieldsTicketCount:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                customFieldsTicketCountPerTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    String(metricName.customFieldId),
                    metricName.customFieldValue,
                    metricName.dateRange || statsFilters.period,
                    sorting,
                )
        case AIInsightsMetric.TicketCustomFieldsTicketCount:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                customFieldsTicketCountPerIntentLevelPerTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    metricName.intentFieldId,
                    metricName.intentFieldValues,
                    metricName.outcomeFieldId,
                    metricName.dateRange || statsFilters.period,
                    sorting,
                )
        case AIInsightsMetric.TicketDrillDownPerCoverageRate:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                coverageRateTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    metricName.outcomeFieldId || -1,
                    metricName.intentFieldId || -1,
                    metricName.dateRange || statsFilters.period,
                    sorting,
                )

        case AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                aiInsightsCustomerSatisfactionMetricDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    metricName.perAgentId,
                    sorting,
                )

        case ConvertMetric.CampaignSalesCount:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                campaignSalesDrillDownQueryFactory(
                    metricName.shopName,
                    metricName.selectedCampaignIds,
                    metricName.campaignsOperator,
                    statsFilters,
                    timezone,
                    sorting,
                    metricName.abVariant,
                )
        case VoiceMetric.AverageTalkTime:
            return (statsFilters: StatsFilters, timezone: string) =>
                connectedCallsListQueryFactory(statsFilters, timezone)
        case VoiceMetric.AverageWaitTime:
            return (statsFilters: StatsFilters, timezone: string) =>
                waitingTimeCallsListQueryFactory(
                    statsFilters,
                    timezone,
                    VoiceCallSegment.inboundCalls,
                )
        case VoiceMetric.QueueAverageTalkTime:
            return (statsFilters: StatsFilters) =>
                liveDashboardConnectedCallsListQueryFactory(statsFilters)
        case VoiceMetric.QueueAverageWaitTime:
            return (statsFilters: StatsFilters) =>
                liveDashboardWaitingTimeCallsListQueryFactory(
                    statsFilters,
                    VoiceCallSegment.inboundCalls,
                )
        case VoiceMetric.QueueInboundCalls:
            return (statsFilters: StatsFilters) =>
                liveDashBoardVoiceCallListQueryFactory(
                    statsFilters,
                    VoiceCallSegment.inboundCalls,
                )
        case VoiceMetric.DEPRECATED_QueueMissedInboundCalls:
            return (statsFilters: StatsFilters) =>
                liveDashBoardVoiceCallListQueryFactory(
                    statsFilters,
                    VoiceCallSegment.missedCalls,
                )
        case VoiceMetric.QueueInboundUnansweredCalls:
            return (statsFilters: StatsFilters) =>
                liveDashBoardVoiceCallListQueryFactory(
                    statsFilters,
                    VoiceCallSegment.inboundUnansweredCalls,
                )
        case VoiceMetric.QueueInboundMissedCalls:
            return (statsFilters: StatsFilters) =>
                liveDashBoardVoiceCallListQueryFactory(
                    statsFilters,
                    VoiceCallSegment.inboundMissedCalls,
                )
        case VoiceMetric.QueueInboundAbandonedCalls:
            return (statsFilters: StatsFilters) =>
                liveDashBoardVoiceCallListQueryFactory(
                    statsFilters,
                    VoiceCallSegment.inboundAbandonedCalls,
                )
        case VoiceMetric.QueueOutboundCalls:
            return (statsFilters: StatsFilters) =>
                liveDashBoardVoiceCallListQueryFactory(
                    statsFilters,
                    VoiceCallSegment.outboundCalls,
                )
        case VoiceAgentsMetric.AgentTotalCalls:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallListQueryFactory(statsFilters, timezone),
            )
        case VoiceAgentsMetric.AgentInboundAnsweredCalls:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallListQueryFactory(
                        statsFilters,
                        timezone,
                        VoiceCallSegment.answeredCallsByAgent,
                    ),
            )
        case VoiceAgentsMetric.AgentInboundMissedCalls:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallListQueryFactory(
                        statsFilters,
                        timezone,
                        VoiceCallSegment.missedCallsByAgent,
                    ),
            )
        case VoiceAgentsMetric.AgentOutboundCalls:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                (statsFilters: StatsFilters, timezone: string) =>
                    voiceCallListQueryFactory(
                        statsFilters,
                        timezone,
                        VoiceCallSegment.outboundCalls,
                    ),
            )
        case VoiceAgentsMetric.AgentAverageTalkTime:
            return queryBuilderWithAgentFilter(
                metricName.perAgentId,
                (statsFilters: StatsFilters, timezone: string) =>
                    connectedCallsListQueryFactory(statsFilters, timezone),
            )
    }
}
