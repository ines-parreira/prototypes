import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { AiSalesAgentChart } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { MetricsConfig } from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import { AutoQAAgentsTableColumn } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { VoiceOfCustomerMetricWithDrillDown } from 'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerMetricConfig'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { ProductsPerTicketColumn } from 'domains/reporting/state/ui/stats/productsPerTicketSlice'
import {
    AgentsTableColumn,
    AIInsightsMetric,
    AutoQAMetric,
    ChannelsTableColumns,
    ConvertMetric,
    KnowledgeMetric,
    ProductInsightsTableColumns,
    SatisfactionMetric,
    TagsMetric,
    TicketFieldsMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'domains/reporting/state/ui/stats/types'

export const hiddenMetrics: DrillDownMetric['metricName'][] = [
    OverviewMetric.OpenTickets,
    OverviewMetric.TicketsClosed,
    OverviewMetric.TicketsCreated,
    OverviewMetric.TicketsReplied,
    OverviewMetric.MessagesSent,
    OverviewMetric.MessagesReceived,
    OverviewMetric.OneTouchTickets,
    OverviewMetric.ZeroTouchTickets,
    TicketFieldsMetric.TicketCustomFieldsTicketCount,
    TagsMetric.TicketCount,
    AgentsTableColumn.ClosedTickets,
    AgentsTableColumn.PercentageOfClosedTickets,
    AgentsTableColumn.RepliedTickets,
    AgentsTableColumn.MessagesSent,
    AgentsTableColumn.OneTouchTickets,
    AgentsTableColumn.ZeroTouchTickets,
    AgentsTableColumn.RepliedTicketsPerHour,
    AgentsTableColumn.ClosedTicketsPerHour,
    AutoQAMetric.ReviewedClosedTickets,
    AutoQAMetric.ResolutionCompleteness,
    AIInsightsMetric.TicketCustomFieldsTicketCount,
    AIInsightsMetric.TicketDrillDownPerCoverageRate,
    SatisfactionMetric.SatisfactionScore,
    SatisfactionMetric.ResponseRate,
    SatisfactionMetric.SurveysSent,
    AutoQAAgentsTableColumn.ReviewedClosedTickets,
    AutoQAAgentsTableColumn.ResolutionCompleteness,
    ChannelsTableColumns.TicketsCreated,
    ChannelsTableColumns.CreatedTicketsPercentage,
    ChannelsTableColumns.ClosedTickets,
    ChannelsTableColumns.TicketsReplied,
    ConvertMetric.CampaignSalesCount,
    VoiceMetric.AverageWaitTime,
    VoiceMetric.AverageTalkTime,
    VoiceMetric.QueueAverageWaitTime,
    VoiceMetric.QueueAverageTalkTime,
    VoiceMetric.QueueInboundCalls,
    VoiceMetric.QueueInboundUnansweredCalls,
    VoiceMetric.QueueInboundMissedCalls,
    VoiceMetric.QueueInboundCancelledCalls,
    VoiceMetric.QueueInboundAbandonedCalls,
    VoiceMetric.QueueInboundCallbackRequestedCalls,
    VoiceMetric.QueueOutboundCalls,
    VoiceMetric.QueueCallsAchievementRate,
    VoiceMetric.VoiceCallsBreachedRate,
    VoiceMetric.VoiceCallsAchievementRate,
    VoiceAgentsMetric.AgentTotalCalls,
    VoiceAgentsMetric.AgentInboundAnsweredCalls,
    VoiceAgentsMetric.AgentInboundMissedCalls,
    VoiceAgentsMetric.AgentOutboundCalls,
    VoiceAgentsMetric.AgentAverageTalkTime,
    VoiceAgentsMetric.AgentInboundTransferredCalls,
    VoiceAgentsMetric.AgentInboundDeclinedCalls,
    AiSalesAgentChart.AiSalesAgentSuccessRate,
    AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders,
    AiSalesAgentChart.AiSalesAgentTotalSalesConv,
    AiSalesAgentChart.AiSalesAgentTotalProductRecommendations,
    ProductInsightsTableColumns.NegativeSentiment,
    ProductInsightsTableColumns.PositiveSentiment,
    ProductInsightsTableColumns.TicketsVolume,
    ProductInsightsTableColumns.ReturnMentions,
    VoiceOfCustomerMetricWithDrillDown.IntentPerProduct,
    VoiceOfCustomerMetricWithDrillDown.IntentPerProducts,
    ProductsPerTicketColumn.TicketVolume,
    AIJourneyMetric.TotalOrders,
    AIJourneyMetric.ResponseRate,
    AIJourneyMetric.OptOutRate,
    AIJourneyMetric.ClickThroughRate,
    AIJourneyMetric.DiscountCodesGenerated,
    AIJourneyMetric.DiscountCodesUsed,
    KnowledgeMetric.Tickets,
    KnowledgeMetric.HandoverTickets,
    KnowledgeMetric.CSAT,
]

describe('MetricsConfig', () => {
    const metricsInMetricConfig = Object.keys(MetricsConfig).filter(
        (metric) =>
            ![
                AgentsTableColumn.AgentName,
                ChannelsTableColumns.Channel,
                AutoQAAgentsTableColumn.AgentName,
            ]
                .map(String)
                .includes(String(metric)),
    )
    it.each(metricsInMetricConfig)(
        'should match the old code %s',
        (metricName) => {
            expect(
                !hiddenMetrics.includes(
                    metricName as DrillDownMetric['metricName'],
                ),
            ).toEqual(
                MetricsConfig[metricName as DrillDownMetric['metricName']]
                    .showMetric,
            )
        },
    )
})
