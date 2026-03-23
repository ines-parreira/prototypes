import {
    aiJourneyClickThroughRateDrillDownQueryFactory,
    aiJourneyDiscountCodesGeneratedDrillDownQueryFactory,
    aiJourneyDiscountCodesUsedDrillDownQueryFactory,
    aiJourneyOptOutAfterReplyDrillDownQueryFactory,
    aiJourneyOptOutRateDrillDownQueryFactory,
    aiJourneyOrdersDrillDownQueryFactory,
    aiJourneyResponseRateDrillDownQueryFactory,
    aiJourneySankeyConversionsDrillDownQueryFactory,
    aiJourneyTotalConversationsDrillDownQueryFactory,
    aiJourneyTotalOptOutsDrillDownQueryFactory,
    aiJourneyTotalRepliesDrillDownQueryFactory,
} from 'AIJourney/queries/aiJourneyDrillDownQueries'
import type { AIJourneyMetrics } from 'AIJourney/types/AIJourneyTypes'
import {
    AIJourneyMetric,
    AIJourneyMetricsConfig,
} from 'AIJourney/types/AIJourneyTypes'
import {
    successRateV2DrillDownQueryFactory,
    totalNumberProductRecommendationsDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import {
    allAgentsAutomatedInteractionsDrillDownQueryFactory,
    allAgentsHandoverInteractionsDrillDownQueryFactory,
    shoppingAssistantAutomatedInteractionsDrillDownQueryFactory,
    shoppingAssistantHandoverInteractionsDrillDownQueryFactory,
    supportAgentAutomatedInteractionsDrillDownQueryFactory,
    supportAgentHandoverInteractionsDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/automate_v2/aiAgentDrillDownQueryFactories'
import {
    knowledgeCSATDrillDownQueryFactory,
    knowledgeHandoverTicketsDrillDownQueryFactory,
    knowledgeTicketsDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { medianFirstAgentResponseTimePerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import {
    aiInsightsCustomerSatisfactionMetricDrillDownQueryFactory,
    coverageRateTicketDrillDownQueryFactory,
    customFieldsTicketCountOnCreatedDatetimePerTicketDrillDownQueryFactory,
    customFieldsTicketCountPerIntentLevelPerTicketDrillDownQueryFactory,
    customFieldsTicketCountPerTicketDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { BuiltQuery, Context } from 'domains/reporting/models/scopes/scope'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    FilterKey,
    TicketTimeReference,
} from 'domains/reporting/models/stat/types'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { AiInsightsMetricConfig } from 'domains/reporting/pages/automate/AiInsightsMetricConfig'
import {
    AiSalesAgentChart,
    AiSalesAgentMetricsWithDrillDownConfig,
} from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import type {
    ColumnConfig,
    DrillDownQueryFactory,
} from 'domains/reporting/pages/common/drill-down/types'
import type { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import { campaignSalesDrillDownQueryFactory } from 'domains/reporting/pages/convert/clients/queryFactories/campaignSalesDrillDownQueryFactory'
import {
    SatisfactionAverageSurveyScoreMetricConfig,
    SatisfactionMetricConfig,
    SatisfactionMetricConfig as SatisfactionTrendCardConfig,
} from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionMetricsConfig'
import type { SLA_FORMAT } from 'domains/reporting/pages/sla/SlaConfig'
import { SlaMetricConfig } from 'domains/reporting/pages/sla/SlaConfig'
import {
    AgentsColumnConfig,
    TableLabels,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import {
    AutoQAAgentsColumnConfig,
    AutoQAAgentsTableColumn,
} from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { TrendCardConfig } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAMetricsConfig'
import {
    ChannelColumnConfig,
    ChannelsTableLabels,
} from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { TagsMetricConfig } from 'domains/reporting/pages/ticket-insights/tags/TagsMetricConfig'
import { TicketFieldsMetricConfig } from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldsMetricConfig'
import { TicketVolumeConfig } from 'domains/reporting/pages/voice-of-customer/charts/ChangeInTicketVolumeChart/ticketVolumeConfig'
import {
    ProductInsightsColumnConfig,
    ProductInsightsColumnWithDrillDownConfig,
} from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import {
    VoiceOfCustomerMetricWithDrillDown,
    VoiceOfCustomerMetricWithDrillDownConfig,
} from 'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerMetricConfig'
import { VoiceAgentsMetricsConfig } from 'domains/reporting/pages/voice/VoiceConfigs/VoiceAgentMetricsConfig'
import { VoiceMetricsConfig } from 'domains/reporting/pages/voice/VoiceConfigs/VoiceMetricsConfig'
import type {
    AiAgentMetrics,
    AiSalesAgentMetrics,
    DrillDownMetric,
    KnowledgeMetrics,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import { ProductsPerTicketColumn } from 'domains/reporting/state/ui/stats/productsPerTicketSlice'
import {
    AgentsTableColumn,
    AIInsightsMetric,
    AutoQAMetric,
    ChannelsTableColumns,
    ConvertMetric,
    KnowledgeMetric,
    ProductInsightsTableColumns,
    SatisfactionAverageSurveyScoreMetric,
    SatisfactionMetric,
    SlaMetric,
    TagsMetric,
    TicketFieldsMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'domains/reporting/state/ui/stats/types'
import type { OrderDirection } from 'models/api/types'

export const getDrillDownQuery = (
    metricData: DrillDownMetric,
): DrillDownQueryFactory => {
    switch (metricData.metricName) {
        case ProductInsightsTableColumns.NegativeSentiment:
        case ProductInsightsTableColumns.PositiveSentiment: {
            const { drillDownQuery } =
                ProductInsightsColumnConfig[metricData.metricName]

            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                drillDownQuery(
                    statsFilters,
                    timezone,
                    metricData.sentimentCustomFieldId,
                    metricData.sentiment,
                    metricData.productId,
                    sorting,
                )
        }
        case ProductInsightsTableColumns.ReturnMentions: {
            const { drillDownQuery } =
                ProductInsightsColumnConfig[metricData.metricName]

            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                drillDownQuery(
                    statsFilters,
                    timezone,
                    metricData.intentCustomFieldId,
                    metricData.productId,
                    sorting,
                )
        }
        case ProductInsightsTableColumns.TicketsVolume: {
            const { drillDownQuery } =
                ProductInsightsColumnConfig[metricData.metricName]

            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                drillDownQuery(
                    statsFilters,
                    timezone,
                    metricData.productId,
                    sorting,
                )
        }

        case ProductsPerTicketColumn.TicketVolume: {
            const { drillDownQuery } =
                TicketVolumeConfig[ProductsPerTicketColumn.TicketVolume]

            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                drillDownQuery(
                    statsFilters,
                    timezone,
                    metricData.productId,
                    sorting,
                )
        }

        case OverviewMetric.MedianFirstResponseTime: {
            return medianFirstAgentResponseTimePerTicketDrillDownQueryFactory
        }
        case OverviewMetric.CustomerSatisfaction:
        case OverviewMetric.MedianResponseTime:
        case OverviewMetric.HumanResponseTimeAfterAiHandoff:
        case OverviewMetric.MedianResolutionTime:
        case OverviewMetric.MessagesPerTicket:
        case OverviewMetric.MessagesSent:
        case OverviewMetric.MessagesReceived:
        case OverviewMetric.TicketsClosed:
        case OverviewMetric.TicketsReplied:
        case OverviewMetric.OpenTickets:
        case OverviewMetric.TicketsCreated:
        case OverviewMetric.OneTouchTickets:
        case OverviewMetric.ZeroTouchTickets:
        case OverviewMetric.TicketHandleTime:
            return OverviewMetricConfig[metricData.metricName].drillDownQuery

        case AgentsTableColumn.MedianFirstResponseTime: {
            return queryBuilderWithAgentFilter(
                metricData.perAgentId,
                medianFirstAgentResponseTimePerTicketDrillDownQueryFactory,
            )
        }
        case AgentsTableColumn.CustomerSatisfaction:
        case AgentsTableColumn.MedianResponseTime:
        case AgentsTableColumn.MedianResolutionTime:
        case AgentsTableColumn.MessagesSent:
        case AgentsTableColumn.MessagesReceived:
        case AgentsTableColumn.PercentageOfClosedTickets:
        case AgentsTableColumn.ClosedTicketsPerHour:
        case AgentsTableColumn.ClosedTickets:
        case AgentsTableColumn.RepliedTickets:
        case AgentsTableColumn.RepliedTicketsPerHour:
        case AgentsTableColumn.OneTouchTickets:
        case AgentsTableColumn.ZeroTouchTickets:
        case AgentsTableColumn.TicketHandleTime:
        case AgentsTableColumn.HumanResponseTimeAfterAiHandoff:
            return queryBuilderWithAgentFilter(
                metricData.perAgentId,
                AgentsColumnConfig[metricData.metricName].drillDownQuery,
            )
        case AutoQAAgentsTableColumn.ResolutionCompleteness:
        case AutoQAAgentsTableColumn.CommunicationSkills:
        case AutoQAAgentsTableColumn.LanguageProficiency:
        case AutoQAAgentsTableColumn.Accuracy:
        case AutoQAAgentsTableColumn.Efficiency:
        case AutoQAAgentsTableColumn.InternalCompliance:
        case AutoQAAgentsTableColumn.BrandVoice:
        case AutoQAAgentsTableColumn.ReviewedClosedTickets:
            return queryBuilderWithAgentFilter(
                metricData.perAgentId,
                AutoQAAgentsColumnConfig[metricData.metricName].drillDownQuery,
            )
        case AutoQAMetric.Accuracy:
        case AutoQAMetric.Efficiency:
        case AutoQAMetric.InternalCompliance:
        case AutoQAMetric.BrandVoice:
        case AutoQAMetric.ReviewedClosedTickets:
        case AutoQAMetric.ResolutionCompleteness:
        case AutoQAMetric.CommunicationSkills:
        case AutoQAMetric.LanguageProficiency:
            return TrendCardConfig[metricData.metricName].drillDownQuery
        case SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreOne:
        case SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreTwo:
        case SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreThree:
        case SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreFour:
        case SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreFive:
            return SatisfactionAverageSurveyScoreMetricConfig[
                metricData.metricName
            ].drillDownQuery
        case SatisfactionMetric.AverageSurveyScore:
        case SatisfactionMetric.SatisfactionScore:
        case SatisfactionMetric.ResponseRate:
        case SatisfactionMetric.SurveysSent:
        case SatisfactionMetric.AverageCSATPerAssignee:
        case SatisfactionMetric.AverageCSATPerChannel:
        case SatisfactionMetric.AverageCSATPerIntegration:
            return SatisfactionMetricConfig[metricData.metricName]
                .drillDownQuery
        case SlaMetric.AchievementRate:
        case SlaMetric.BreachedTicketsRate:
            return SlaMetricConfig[metricData.metricName].drillDownQuery

        case ChannelsTableColumns.FirstResponseTime: {
            return queryBuilderWithChannelFilter(
                metricData.perChannel,
                medianFirstAgentResponseTimePerTicketDrillDownQueryFactory,
            )
        }

        case ChannelsTableColumns.TicketHandleTime:
        case ChannelsTableColumns.ClosedTickets:
        case ChannelsTableColumns.TicketsCreated:
        case ChannelsTableColumns.CreatedTicketsPercentage:
        case ChannelsTableColumns.HumanResponseTimeAfterAiHandoff:
        case ChannelsTableColumns.MedianResponseTime:
        case ChannelsTableColumns.MedianResolutionTime:
        case ChannelsTableColumns.TicketsReplied:
        case ChannelsTableColumns.MessagesSent:
        case ChannelsTableColumns.MessagesReceived:
        case ChannelsTableColumns.CustomerSatisfaction:
            return queryBuilderWithChannelFilter(
                metricData.perChannel,
                ChannelColumnConfig[metricData.metricName].drillDownQuery,
            )
        case TagsMetric.TicketCount:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                TagsMetricConfig[metricData.metricName].drillDownQuery(
                    statsFilters,
                    timezone,
                    metricData.tagId,
                    metricData.dateRange || statsFilters.period,
                    sorting,
                    metricData.ticketTimeReference,
                )
        case TicketFieldsMetric.TicketCustomFieldsTicketCount: {
            const queryFactory =
                metricData.ticketTimeReference === TicketTimeReference.TaggedAt
                    ? customFieldsTicketCountPerTicketDrillDownQueryFactory
                    : customFieldsTicketCountOnCreatedDatetimePerTicketDrillDownQueryFactory

            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                queryFactory(
                    statsFilters,
                    timezone,
                    metricData.customFieldId,
                    metricData.customFieldValue,
                    metricData.dateRange || statsFilters.period,
                    sorting,
                )
        }
        case AIInsightsMetric.TicketCustomFieldsTicketCount:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                customFieldsTicketCountPerIntentLevelPerTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    metricData.intentFieldId,
                    metricData.intentFieldValues,
                    metricData.outcomeFieldId,
                    sorting,
                    metricData.integrationIds,
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
                    metricData.outcomeFieldId,
                    metricData.intentFieldId,
                    sorting,
                    metricData.integrationIds,
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
                    metricData.perAgentId,
                    metricData.intentFieldId,
                    metricData.outcomeFieldId,
                    sorting,
                    metricData.integrationIds,
                    metricData.intentFieldValues,
                )

        case ConvertMetric.CampaignSalesCount:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                campaignSalesDrillDownQueryFactory(
                    metricData.shopName,
                    metricData.selectedCampaignIds,
                    metricData.campaignsOperator,
                    statsFilters,
                    timezone,
                    sorting,
                    metricData.abVariant,
                )
        case VoiceMetric.AverageTalkTime:
        case VoiceMetric.AverageWaitTime:
        case VoiceMetric.QueueAverageTalkTime:
        case VoiceMetric.QueueAverageWaitTime:
        case VoiceMetric.QueueInboundCalls:
        case VoiceMetric.QueueInboundUnansweredCalls:
        case VoiceMetric.QueueInboundMissedCalls:
        case VoiceMetric.QueueInboundAbandonedCalls:
        case VoiceMetric.QueueInboundCancelledCalls:
        case VoiceMetric.QueueInboundCallbackRequestedCalls:
        case VoiceMetric.QueueOutboundCalls:
        case VoiceMetric.QueueCallsAchievementRate:
        case VoiceMetric.VoiceCallsAchievementRate:
        case VoiceMetric.VoiceCallsBreachedRate:
            return VoiceMetricsConfig[metricData.metricName].drillDownQuery
        case VoiceAgentsMetric.AgentTotalCalls:
        case VoiceAgentsMetric.AgentInboundAnsweredCalls:
        case VoiceAgentsMetric.AgentInboundMissedCalls:
        case VoiceAgentsMetric.AgentOutboundCalls:
        case VoiceAgentsMetric.AgentAverageTalkTime:
        case VoiceAgentsMetric.AgentInboundTransferredCalls:
        case VoiceAgentsMetric.AgentInboundDeclinedCalls:
            return queryBuilderWithAgentFilter(
                metricData.perAgentId,
                VoiceAgentsMetricsConfig[metricData.metricName].drillDownQuery,
            )
        case AiSalesAgentChart.AiSalesAgentTotalSalesConv:
            return AiSalesAgentMetricsWithDrillDownConfig[
                AiSalesAgentChart.AiSalesAgentTotalSalesConv
            ].drillDownQuery
        case AiSalesAgentChart.AiSalesAgentSuccessRate:
            return AiSalesAgentMetricsWithDrillDownConfig[
                AiSalesAgentChart.AiSalesAgentSuccessRate
            ].drillDownQuery
        case AiAgentDrillDownMetricName.ShoppingAssistantSuccessRateCard:
            // Exhaustiveness stub, AiAgentDrillDownConfig.drillDownHook handles actual routing.
            return successRateV2DrillDownQueryFactory
        case AiAgentDrillDownMetricName.AllAgentsHandoverInteractionsCard:
            return allAgentsHandoverInteractionsDrillDownQueryFactory
        case AiAgentDrillDownMetricName.ShoppingAssistantHandoverInteractionsCard:
            return shoppingAssistantHandoverInteractionsDrillDownQueryFactory
        case AiAgentDrillDownMetricName.SupportAgentHandoverInteractionsCard:
            return supportAgentHandoverInteractionsDrillDownQueryFactory
        case AiSalesAgentChart.AiSalesDiscountOffered:
            return AiSalesAgentMetricsWithDrillDownConfig[
                AiSalesAgentChart.AiSalesDiscountOffered
            ].drillDownQuery
        case AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders:
            return AiSalesAgentMetricsWithDrillDownConfig[
                AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders
            ].drillDownQuery
        case AiSalesAgentChart.AiSalesAgentTotalProductRecommendations:
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                totalNumberProductRecommendationsDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    sorting,
                    metricData.productId,
                )
        case AiAgentDrillDownMetricName.AutomatedInteractionsCard:
            return allAgentsAutomatedInteractionsDrillDownQueryFactory
        case AiAgentDrillDownMetricName.ResolvedInteractionsCard:
            return shoppingAssistantAutomatedInteractionsDrillDownQueryFactory
        case AiAgentDrillDownMetricName.SupportInteractionsCard:
            return supportAgentAutomatedInteractionsDrillDownQueryFactory
        case VoiceOfCustomerMetricWithDrillDown.IntentPerProduct: {
            const { drillDownQuery } =
                VoiceOfCustomerMetricWithDrillDownConfig[
                    VoiceOfCustomerMetricWithDrillDown.IntentPerProduct
                ]

            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                drillDownQuery(
                    statsFilters,
                    timezone,
                    metricData.intentCustomFieldId,
                    metricData.intentCustomFieldValueString,
                    metricData.productId,
                    sorting,
                )
        }
        case VoiceOfCustomerMetricWithDrillDown.IntentPerProducts: {
            const { drillDownQuery } =
                VoiceOfCustomerMetricWithDrillDownConfig[
                    VoiceOfCustomerMetricWithDrillDown.IntentPerProducts
                ]

            return (statsFilters: StatsFilters, timezone: string) =>
                drillDownQuery(
                    statsFilters,
                    timezone,
                    metricData.intentCustomFieldId,
                    metricData.intentCustomFieldValueString,
                )
        }
        case AIJourneyMetric.TotalOrders: {
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                aiJourneyOrdersDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    metricData.integrationId,
                    sorting,
                    metricData.journeyIds,
                )
        }
        case AIJourneyMetric.ResponseRate: {
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                aiJourneyResponseRateDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    metricData.integrationId,
                    sorting,
                    metricData.journeyIds,
                )
        }
        case AIJourneyMetric.OptOutRate: {
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                aiJourneyOptOutRateDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    metricData.integrationId,
                    sorting,
                    metricData.journeyIds,
                )
        }
        case AIJourneyMetric.ClickThroughRate: {
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                aiJourneyClickThroughRateDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    metricData.integrationId,
                    sorting,
                    metricData.journeyIds,
                )
        }
        case AIJourneyMetric.DiscountCodesGenerated: {
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                aiJourneyDiscountCodesGeneratedDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    metricData.integrationId,
                    sorting,
                    metricData.journeyIds,
                )
        }
        case AIJourneyMetric.DiscountCodesUsed: {
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                aiJourneyDiscountCodesUsedDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    metricData.integrationId,
                    sorting,
                    metricData.journeyIds,
                )
        }
        case AIJourneyMetric.TotalConversations: {
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                aiJourneyTotalConversationsDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    metricData.integrationId,
                    sorting,
                    metricData.journeyIds,
                )
        }
        case AIJourneyMetric.TotalOptOuts: {
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                aiJourneyTotalOptOutsDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    metricData.integrationId,
                    sorting,
                    metricData.journeyIds,
                )
        }
        case AIJourneyMetric.TotalReplies: {
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                aiJourneyTotalRepliesDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    metricData.integrationId,
                    sorting,
                    metricData.journeyIds,
                )
        }
        case AIJourneyMetric.OptOutAfterReply: {
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                aiJourneyOptOutAfterReplyDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    metricData.integrationId,
                    sorting,
                    metricData.journeyIds,
                )
        }
        case AIJourneyMetric.SankeyConversions: {
            return (
                statsFilters: StatsFilters,
                timezone: string,
                sorting?: OrderDirection,
            ) =>
                aiJourneySankeyConversionsDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    metricData.integrationId,
                    sorting,
                    metricData.journeyIds,
                    metricData.engagementCategory,
                )
        }
        case KnowledgeMetric.Tickets: {
            return (
                statsFilters: StatsFilters,
                timezone: string,
                __sorting?: OrderDirection,
            ) => {
                const knowledgeMetricData = metricData as KnowledgeMetrics
                const filtersWithPeriod: StatsFilters = {
                    ...statsFilters,
                    [FilterKey.Period]: {
                        start_datetime:
                            knowledgeMetricData.dateRange.start_datetime,
                        end_datetime:
                            knowledgeMetricData.dateRange.end_datetime,
                    },
                    ...(knowledgeMetricData.shopIntegrationId && {
                        [FilterKey.Stores]: {
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: [knowledgeMetricData.shopIntegrationId],
                        },
                    }),
                }
                return knowledgeTicketsDrillDownQueryFactory(
                    filtersWithPeriod,
                    timezone,
                    knowledgeMetricData.resourceSourceId,
                    knowledgeMetricData.resourceSourceSetId,
                )
            }
        }
        case KnowledgeMetric.HandoverTickets: {
            return (
                statsFilters: StatsFilters,
                timezone: string,
                __sorting?: OrderDirection,
            ) => {
                const knowledgeMetricData = metricData as KnowledgeMetrics
                const filtersWithHandover: StatsFilters = {
                    ...statsFilters,
                    [FilterKey.Period]: {
                        start_datetime:
                            knowledgeMetricData.dateRange.start_datetime,
                        end_datetime:
                            knowledgeMetricData.dateRange.end_datetime,
                    },
                    [FilterKey.CustomFields]: [
                        {
                            customFieldId:
                                knowledgeMetricData.outcomeCustomFieldId!,
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: [
                                'Handover::With message',
                                'Handover::Without message',
                            ],
                        },
                    ],
                    ...(knowledgeMetricData.shopIntegrationId && {
                        [FilterKey.Stores]: {
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: [knowledgeMetricData.shopIntegrationId],
                        },
                    }),
                }
                return knowledgeHandoverTicketsDrillDownQueryFactory(
                    filtersWithHandover,
                    timezone,
                    knowledgeMetricData.resourceSourceId,
                    knowledgeMetricData.resourceSourceSetId,
                )
            }
        }
        case KnowledgeMetric.CSAT: {
            return (
                statsFilters: StatsFilters,
                timezone: string,
                __sorting?: OrderDirection,
            ) => {
                const knowledgeMetricData = metricData as KnowledgeMetrics
                const filtersWithPeriod: StatsFilters = {
                    ...statsFilters,
                    [FilterKey.Period]: {
                        start_datetime:
                            knowledgeMetricData.dateRange.start_datetime,
                        end_datetime:
                            knowledgeMetricData.dateRange.end_datetime,
                    },
                    ...(knowledgeMetricData.shopIntegrationId && {
                        [FilterKey.Stores]: {
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: [knowledgeMetricData.shopIntegrationId],
                        },
                    }),
                }
                return knowledgeCSATDrillDownQueryFactory(
                    filtersWithPeriod,
                    timezone,
                    knowledgeMetricData.resourceSourceId,
                    knowledgeMetricData.resourceSourceSetId,
                )
            }
        }
    }
}
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
                    LogicalOperatorEnum.ONE_OF,
                ),
            },
            timezone,
            sorting,
        )
    }

const isAiSalesAgentMetric = (
    metricData: DrillDownMetric,
): metricData is AiSalesAgentMetrics => {
    return Object.values(AiSalesAgentChart).includes(
        metricData.metricName as AiSalesAgentChart,
    )
}

const isAiAgentMetric = (
    metricData: DrillDownMetric,
): metricData is AiAgentMetrics => {
    return Object.values(AiAgentDrillDownMetricName).includes(
        metricData.metricName as AiAgentDrillDownMetricName,
    )
}

const isAIJourneyMetric = (
    metricData: DrillDownMetric,
): metricData is AIJourneyMetrics => {
    return Object.values(AIJourneyMetric).includes(
        metricData.metricName as AIJourneyMetric,
    )
}

export const getDrillDownMetricColumn = (
    metricData: DrillDownMetric,
    showMetric: boolean,
): ColumnConfig => {
    let metricTitle = ''
    let metricValueFormat: MetricValueFormat | typeof SLA_FORMAT = 'decimal'

    if (!metricData) {
        return {
            metricTitle,
            showMetric: false,
            metricValueFormat: 'decimal',
        }
    }

    if (
        metricData.metricName === VoiceAgentsMetric.AgentTotalCalls ||
        metricData.metricName === VoiceAgentsMetric.AgentInboundAnsweredCalls ||
        metricData.metricName === VoiceAgentsMetric.AgentInboundMissedCalls ||
        metricData.metricName === VoiceAgentsMetric.AgentOutboundCalls ||
        metricData.metricName === VoiceAgentsMetric.AgentAverageTalkTime ||
        metricData.metricName ===
            VoiceAgentsMetric.AgentInboundTransferredCalls ||
        metricData.metricName === VoiceAgentsMetric.AgentInboundDeclinedCalls
    ) {
        metricTitle = VoiceAgentsMetricsConfig[metricData.metricName].title
    } else if (
        metricData.metricName ===
            ProductInsightsTableColumns.NegativeSentiment ||
        metricData.metricName ===
            ProductInsightsTableColumns.PositiveSentiment ||
        metricData.metricName === ProductInsightsTableColumns.TicketsVolume ||
        metricData.metricName === ProductInsightsTableColumns.ReturnMentions
    ) {
        const config =
            ProductInsightsColumnWithDrillDownConfig[metricData.metricName]
        metricTitle = metricData.title ?? config.hint.title
        metricValueFormat = config.format
    } else if (
        metricData.metricName === VoiceMetric.QueueAverageTalkTime ||
        metricData.metricName === VoiceMetric.QueueAverageWaitTime ||
        metricData.metricName === VoiceMetric.QueueInboundCalls ||
        metricData.metricName === VoiceMetric.QueueInboundUnansweredCalls ||
        metricData.metricName === VoiceMetric.QueueInboundMissedCalls ||
        metricData.metricName === VoiceMetric.QueueInboundAbandonedCalls ||
        metricData.metricName === VoiceMetric.QueueInboundCancelledCalls ||
        metricData.metricName ===
            VoiceMetric.QueueInboundCallbackRequestedCalls ||
        metricData.metricName === VoiceMetric.QueueOutboundCalls ||
        metricData.metricName === VoiceMetric.QueueCallsAchievementRate ||
        metricData.metricName === VoiceMetric.VoiceCallsAchievementRate ||
        metricData.metricName === VoiceMetric.VoiceCallsBreachedRate
    ) {
        metricTitle = VoiceMetricsConfig[metricData.metricName].title
    } else if (
        metricData.metricName === SlaMetric.AchievementRate ||
        metricData.metricName === SlaMetric.BreachedTicketsRate
    ) {
        metricTitle = SlaMetricConfig[metricData.metricName].drillDownTitle
        metricValueFormat =
            SlaMetricConfig[metricData.metricName].drillDownFormat
    } else if (
        metricData.metricName === SatisfactionMetric.SatisfactionScore ||
        metricData.metricName === SatisfactionMetric.ResponseRate ||
        metricData.metricName === SatisfactionMetric.SurveysSent ||
        metricData.metricName === SatisfactionMetric.AverageCSATPerAssignee ||
        metricData.metricName === SatisfactionMetric.AverageCSATPerChannel ||
        metricData.metricName === SatisfactionMetric.AverageCSATPerIntegration
    ) {
        metricTitle = SatisfactionTrendCardConfig[metricData.metricName].title
        metricValueFormat =
            SatisfactionTrendCardConfig[metricData.metricName].metricFormat
    } else if (
        metricData.metricName === SatisfactionMetric.AverageSurveyScore
    ) {
        metricTitle =
            SatisfactionMetricConfig[SatisfactionMetric.AverageSurveyScore]
                .drillDownTitle
        metricValueFormat =
            SatisfactionTrendCardConfig[SatisfactionMetric.AverageSurveyScore]
                .metricFormat
    } else if (
        metricData.metricName ===
            SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreOne ||
        metricData.metricName ===
            SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreTwo ||
        metricData.metricName ===
            SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreThree ||
        metricData.metricName ===
            SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreFour ||
        metricData.metricName ===
            SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreFive
    ) {
        metricTitle =
            SatisfactionAverageSurveyScoreMetricConfig[metricData.metricName]
                .title
        metricValueFormat =
            SatisfactionAverageSurveyScoreMetricConfig[metricData.metricName]
                .metricFormat
    } else if (
        metricData.metricName === AutoQAMetric.ReviewedClosedTickets ||
        metricData.metricName === AutoQAMetric.CommunicationSkills ||
        metricData.metricName === AutoQAMetric.ResolutionCompleteness ||
        metricData.metricName === AutoQAMetric.LanguageProficiency ||
        metricData.metricName === AutoQAMetric.Accuracy ||
        metricData.metricName === AutoQAMetric.Efficiency ||
        metricData.metricName === AutoQAMetric.InternalCompliance ||
        metricData.metricName === AutoQAMetric.BrandVoice
    ) {
        metricTitle = TrendCardConfig[metricData.metricName].title
        metricValueFormat = TrendCardConfig[metricData.metricName].metricFormat
    } else if (
        metricData.metricName === AutoQAAgentsTableColumn.CommunicationSkills ||
        metricData.metricName ===
            AutoQAAgentsTableColumn.ResolutionCompleteness ||
        metricData.metricName ===
            AutoQAAgentsTableColumn.ReviewedClosedTickets ||
        metricData.metricName === AutoQAAgentsTableColumn.LanguageProficiency ||
        metricData.metricName === AutoQAAgentsTableColumn.Accuracy ||
        metricData.metricName === AutoQAAgentsTableColumn.Efficiency ||
        metricData.metricName === AutoQAAgentsTableColumn.InternalCompliance ||
        metricData.metricName === AutoQAAgentsTableColumn.BrandVoice
    ) {
        metricTitle = AutoQAAgentsColumnConfig[metricData.metricName].title
        metricValueFormat =
            AutoQAAgentsColumnConfig[metricData.metricName].format
    } else if (
        metricData.metricName === ConvertMetric.CampaignSalesCount ||
        metricData.metricName === VoiceMetric.AverageWaitTime ||
        metricData.metricName === VoiceMetric.AverageTalkTime ||
        metricData.metricName === TagsMetric.TicketCount
    ) {
        metricTitle = ''
    } else if (
        metricData.metricName ===
            AIInsightsMetric.TicketCustomFieldsTicketCount ||
        metricData.metricName ===
            AIInsightsMetric.TicketDrillDownPerCoverageRate
    ) {
        metricTitle = metricData.title || ''
        metricValueFormat =
            AiInsightsMetricConfig[metricData.metricName].metricFormat
    } else if (
        metricData.metricName ===
        AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction
    ) {
        metricTitle = AiInsightsMetricConfig[metricData.metricName].title
        metricValueFormat =
            AiInsightsMetricConfig[metricData.metricName].metricFormat
    } else if (
        metricData.metricName ===
        TicketFieldsMetric.TicketCustomFieldsTicketCount
    ) {
        metricTitle = TicketFieldsMetricConfig[metricData.metricName].title
        metricValueFormat =
            TicketFieldsMetricConfig[metricData.metricName].metricFormat
    } else if (isAiSalesAgentMetric(metricData)) {
        metricTitle =
            AiSalesAgentMetricsWithDrillDownConfig[metricData.metricName].title
        metricValueFormat =
            AiSalesAgentMetricsWithDrillDownConfig[metricData.metricName]
                .metricFormat
    } else if (
        metricData.metricName ===
            AiAgentDrillDownMetricName.AutomatedInteractionsCard ||
        metricData.metricName ===
            AiAgentDrillDownMetricName.ResolvedInteractionsCard ||
        metricData.metricName ===
            AiAgentDrillDownMetricName.SupportInteractionsCard ||
        metricData.metricName ===
            AiAgentDrillDownMetricName.AllAgentsHandoverInteractionsCard ||
        metricData.metricName ===
            AiAgentDrillDownMetricName.ShoppingAssistantHandoverInteractionsCard ||
        metricData.metricName ===
            AiAgentDrillDownMetricName.SupportAgentHandoverInteractionsCard
    ) {
        metricTitle = ''
        metricValueFormat = 'decimal'
    } else if (isAiAgentMetric(metricData)) {
        metricTitle = metricData.title || ''
        metricValueFormat = 'decimal-to-percent'
    } else if (isAIJourneyMetric(metricData)) {
        metricTitle = AIJourneyMetricsConfig[metricData.metricName].title
        metricValueFormat =
            AIJourneyMetricsConfig[metricData.metricName].metricFormat
    } else if (
        metricData.metricName ===
        VoiceOfCustomerMetricWithDrillDown.IntentPerProduct
    ) {
        metricTitle =
            metricData.title ||
            VoiceOfCustomerMetricWithDrillDownConfig[
                VoiceOfCustomerMetricWithDrillDown.IntentPerProduct
            ].title
        metricValueFormat =
            VoiceOfCustomerMetricWithDrillDownConfig[
                VoiceOfCustomerMetricWithDrillDown.IntentPerProduct
            ].metricFormat
    } else if (
        metricData.metricName ===
        VoiceOfCustomerMetricWithDrillDown.IntentPerProducts
    ) {
        metricTitle =
            metricData.title ||
            VoiceOfCustomerMetricWithDrillDownConfig[
                VoiceOfCustomerMetricWithDrillDown.IntentPerProducts
            ].title
        metricValueFormat =
            VoiceOfCustomerMetricWithDrillDownConfig[
                VoiceOfCustomerMetricWithDrillDown.IntentPerProducts
            ].metricFormat
    } else if (metricData.metricName === ProductsPerTicketColumn.TicketVolume) {
        metricTitle = metricData.title || ''
        metricValueFormat =
            TicketVolumeConfig[ProductsPerTicketColumn.TicketVolume]
                .metricFormat
    } else if (
        metricData.metricName === KnowledgeMetric.Tickets ||
        metricData.metricName === KnowledgeMetric.HandoverTickets ||
        metricData.metricName === KnowledgeMetric.CSAT
    ) {
        metricTitle = metricData.title || ''
        metricValueFormat = 'decimal'
    } else if ('perAgentId' in metricData) {
        metricTitle = TableLabels[metricData.metricName]
        metricValueFormat = AgentsColumnConfig[metricData.metricName].format
    } else if ('perChannel' in metricData) {
        metricTitle = ChannelsTableLabels[metricData.metricName]
        metricValueFormat = ChannelColumnConfig[metricData.metricName].format
    } else {
        metricTitle = OverviewMetricConfig[metricData.metricName].title
        metricValueFormat =
            OverviewMetricConfig[metricData.metricName].metricFormat
    }

    return {
        metricTitle,
        metricValueFormat,
        showMetric,
    }
}

export const getDrillDownQueryV2 = (
    metricData: DrillDownMetric,
): ((ctx: Context) => BuiltQuery) | undefined => {
    switch (metricData.metricName) {
        case VoiceMetric.AverageTalkTime:
        case VoiceMetric.AverageWaitTime:
        case VoiceMetric.QueueAverageTalkTime:
        case VoiceMetric.QueueAverageWaitTime:
        case VoiceMetric.QueueInboundCalls:
        case VoiceMetric.QueueInboundUnansweredCalls:
        case VoiceMetric.QueueInboundMissedCalls:
        case VoiceMetric.QueueInboundAbandonedCalls:
        case VoiceMetric.QueueInboundCancelledCalls:
        case VoiceMetric.QueueInboundCallbackRequestedCalls:
        case VoiceMetric.QueueOutboundCalls:
        case VoiceMetric.QueueCallsAchievementRate:
        case VoiceMetric.VoiceCallsAchievementRate:
        case VoiceMetric.VoiceCallsBreachedRate:
            return VoiceMetricsConfig[metricData.metricName].drillDownQueryV2
        case VoiceAgentsMetric.AgentTotalCalls:
        case VoiceAgentsMetric.AgentInboundAnsweredCalls:
        case VoiceAgentsMetric.AgentInboundMissedCalls:
        case VoiceAgentsMetric.AgentOutboundCalls:
        case VoiceAgentsMetric.AgentAverageTalkTime:
        case VoiceAgentsMetric.AgentInboundTransferredCalls:
        case VoiceAgentsMetric.AgentInboundDeclinedCalls:
            return queryBuilderWithAgentFilterV2(
                metricData.perAgentId,
                VoiceAgentsMetricsConfig[metricData.metricName]
                    .drillDownQueryV2,
            )
    }
}

const queryBuilderWithAgentFilterV2 = (
    agentId: number,
    queryBuilder?: (ctx: Context) => BuiltQuery,
): ((ctx: Context) => BuiltQuery) | undefined => {
    if (!queryBuilder) return undefined
    return (ctx: Context) =>
        queryBuilder({
            ...ctx,
            filters: {
                ...ctx.filters,
                agents: withDefaultLogicalOperator([agentId]),
            },
        })
}
