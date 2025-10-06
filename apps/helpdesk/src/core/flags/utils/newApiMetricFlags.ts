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
    MetricScope.AverageCsat,
    MetricScope.MessagesPerTicket,
    MetricScope.TicketsOpen,
    MetricScope.TicketHandleTime,
    MetricScope.OnlineTime,
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

export function resolveMetricFlag(name: MetricName): FeatureFlagKey {
    return (
        METRIC_TO_FLAG_MAP.get(name) ??
        FeatureFlagKey.ReportingUnsortedMetricMigration
    )
}
