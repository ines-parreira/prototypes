import { AiSalesAgentChart } from 'pages/stats/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { MetricsConfig } from 'pages/stats/common/drill-down/DrillDownTableConfig'
import { AutoQAAgentsTableColumn } from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { OverviewMetric } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { DrillDownMetric } from 'state/ui/stats/drillDownSlice'
import {
    AgentsTableColumn,
    AIInsightsMetric,
    AutoQAMetric,
    ChannelsTableColumns,
    ConvertMetric,
    SatisfactionMetric,
    TagsMetric,
    TicketFieldsMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'state/ui/stats/types'

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
    VoiceMetric.QueueInboundAbandonedCalls,
    VoiceMetric.QueueOutboundCalls,
    VoiceAgentsMetric.AgentTotalCalls,
    VoiceAgentsMetric.AgentInboundAnsweredCalls,
    VoiceAgentsMetric.AgentInboundMissedCalls,
    VoiceAgentsMetric.AgentOutboundCalls,
    VoiceAgentsMetric.AgentAverageTalkTime,
    AiSalesAgentChart.AiSalesAgentSuccessRate,
    AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders,
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
