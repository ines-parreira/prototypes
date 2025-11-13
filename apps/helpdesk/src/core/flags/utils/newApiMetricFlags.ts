import { FeatureFlagKey } from '@repo/feature-flags'

import {
    METRIC_NAMES_BY_SCOPE,
    MetricName,
    MetricScope,
} from 'domains/reporting/hooks/metricNames'

export const P1_SCOPES: MetricScope[] = [
    MetricScope.TicketsCreated,
    MetricScope.TicketsReplied,
    MetricScope.TicketsClosed,
    MetricScope.MessagesSent,
    MetricScope.FirstResponseTime,
    MetricScope.ResolutionTime,
    MetricScope.OneTouchTickets,
    MetricScope.MessagesPerTicket,
    MetricScope.TicketsOpen,
    MetricScope.TicketHandleTime,
    MetricScope.OnlineTime,
]

export const P2_SCOPES: MetricScope[] = [MetricScope.SatisfactionSurveys]

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

export function resolveMetricFlag(name: MetricName): FeatureFlagKey {
    return (
        METRIC_TO_FLAG_MAP.get(name) ??
        FeatureFlagKey.ReportingUnsortedMetricMigration
    )
}
