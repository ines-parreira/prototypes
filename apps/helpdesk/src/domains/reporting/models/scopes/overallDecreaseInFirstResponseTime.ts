import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

export const overallDecreaseInFirstResponseTimeScope = defineScope({
    scope: MetricScope.OverallDecreaseInFirstResponseTime,
    measures: [
        'averageDecreaseInFirstResponseTime',
        'medianDecreaseInFirstResponseTime',
    ],
    dimensions: [
        'automationFeatureType',
        'channel',
        'firstResponseTime',
        'flowId',
        'orderManagementType',
        'storeIntegrationId',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'automationFeatureType',
        'channel',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: [
        'averageDecreaseInFirstResponseTime',
        'eventDatetime',
        'firstResponseTime',
        'medianDecreaseInFirstResponseTime',
        'ticketId',
    ],
})

export type OverallDecreaseInFirstResponseTimeContext = Context<
    typeof overallDecreaseInFirstResponseTimeScope.config
>

export const medianDecreaseInFirstResponseTime =
    overallDecreaseInFirstResponseTimeScope
        .defineMetricName(METRIC_NAMES.AI_AGENT_OVERVIEW_DECREASE_IN_FRT)
        .defineQuery(() => ({
            measures: ['medianDecreaseInFirstResponseTime'] as const,
        }))

export const medianDecreaseInFirstResponseTimeQueryV2Factory = (
    ctx: OverallDecreaseInFirstResponseTimeContext,
) => medianDecreaseInFirstResponseTime.build(ctx)
