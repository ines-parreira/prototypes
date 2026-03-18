import { FeatureFlagKey } from '@repo/feature-flags'

import type { MetricName } from 'domains/reporting/hooks/metricNames'
import {
    METRIC_NAMES_BY_SCOPE,
    MetricScope,
} from 'domains/reporting/hooks/metricNames'

export const P1_SCOPES: MetricScope[] = [
    MetricScope.MessagesSent,
    MetricScope.SatisfactionSurveys,
    MetricScope.TicketsClosed,
    MetricScope.TicketsCreated,
    MetricScope.TicketHandleTime,
    MetricScope.MessagesPerTicket,
    MetricScope.OneTouchTickets,
    MetricScope.OnlineTime,
    MetricScope.UserAvailabilityTracking,
    MetricScope.ResolutionTime,
    MetricScope.TicketsReplied,
    MetricScope.TicketsOpen,
    MetricScope.FirstResponseTime,
]

export const P2_SCOPES: MetricScope[] = [
    MetricScope.AutomatedInteractions,
    MetricScope.AutoQA,
    MetricScope.MessagesReceived,
    MetricScope.HumanFirstResponseTime,
    MetricScope.TicketServiceLevelAgreement,
    MetricScope.VoiceAgentEvents,
    MetricScope.WorkloadTickets,
    MetricScope.ResponseTime,
    MetricScope.Tags,
    MetricScope.TicketFields,
    MetricScope.ZeroTouchTickets,
    MetricScope.VoiceCalls,
    MetricScope.VoiceCallsSummary,
]

export const P3_SCOPES: MetricScope[] = [
    MetricScope.KnowledgeInsights,
    MetricScope.Helpcenter,
    MetricScope.ConvertCampaignEvents,
    MetricScope.ConvertOrderConversion,
    MetricScope.ConvertCampaignOrderEvents,
    MetricScope.AISalesAgentConversations,
    MetricScope.AISalesAgentOrders,
]

export const P5_AI_AGENT_REVAMP_SCOPES: MetricScope[] = [
    MetricScope.OverallAutomationRate,
    MetricScope.AiAgentCoverageRate,
    MetricScope.AiSalesAgentConversionRate,
    MetricScope.AiSalesAgentBuyThroughRate,
    MetricScope.AiSalesAgentActivity,
    MetricScope.AiSalesAgentDiscounts,
]

const METRIC_TO_FLAG_MAP = new Map<MetricName, FeatureFlagKey>()

P1_SCOPES.forEach((scope) => {
    METRIC_NAMES_BY_SCOPE[scope].forEach((metricName) => {
        METRIC_TO_FLAG_MAP.set(
            metricName,
            FeatureFlagKey.ReportingP1MetricMigration,
        )
    })
})

P2_SCOPES.forEach((scope) => {
    METRIC_NAMES_BY_SCOPE[scope].forEach((metricName) => {
        METRIC_TO_FLAG_MAP.set(
            metricName,
            FeatureFlagKey.ReportingP2MetricMigration,
        )
    })
})

P3_SCOPES.forEach((scope) => {
    METRIC_NAMES_BY_SCOPE[scope].forEach((metricName) => {
        METRIC_TO_FLAG_MAP.set(
            metricName,
            FeatureFlagKey.ReportingP3MetricMigration,
        )
    })
})

P5_AI_AGENT_REVAMP_SCOPES.forEach((scope) => {
    METRIC_NAMES_BY_SCOPE[scope].forEach((metricName) => {
        METRIC_TO_FLAG_MAP.set(
            metricName,
            FeatureFlagKey.ReportingP5AiAgentRevampQueryScopes,
        )
    })
})

export function resolveMetricFlag(name: MetricName): FeatureFlagKey {
    return (
        METRIC_TO_FLAG_MAP.get(name) ??
        FeatureFlagKey.ReportingUnsortedMetricMigration
    )
}

export function skipMetricComparison(name: MetricName): boolean {
    return (
        resolveMetricFlag(name) ===
        FeatureFlagKey.ReportingP5AiAgentRevampQueryScopes
    )
}
