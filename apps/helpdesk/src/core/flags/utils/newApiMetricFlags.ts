import { FeatureFlagKey } from '@repo/feature-flags'

import type { MetricName } from 'domains/reporting/hooks/metricNames'
import {
    METRIC_NAMES_BY_SCOPE,
    MetricScope,
} from 'domains/reporting/hooks/metricNames'

export const P1_SCOPES: MetricScope[] = [
    MetricScope.TicketsReplied,
    MetricScope.TicketsClosed,
    MetricScope.MessagesSent,
    MetricScope.FirstResponseTime,
    MetricScope.OneTouchTickets,
    MetricScope.TicketsOpen,
    MetricScope.TicketHandleTime,
]

export const P2_SCOPES: MetricScope[] = [
    MetricScope.SatisfactionSurveys,
    MetricScope.TicketsCreated,
    MetricScope.MessagesPerTicket,
    MetricScope.OnlineTime,
    MetricScope.ResolutionTime,
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

export function resolveMetricFlag(name: MetricName): FeatureFlagKey {
    return (
        METRIC_TO_FLAG_MAP.get(name) ??
        FeatureFlagKey.ReportingUnsortedMetricMigration
    )
}
