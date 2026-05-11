import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

export const overallDecreaseInResolutionTimeScope = defineScope({
    scope: MetricScope.OverallDecreaseInResolutionTime,
    measures: [
        'averageDecreaseInResolutionTime',
        'medianDecreaseInResolutionTime',
    ],
    dimensions: [
        'automationFeatureType',
        'channel',
        'flowId',
        'orderManagementType',
        'resolutionTime',
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
        'averageDecreaseInResolutionTime',
        'eventDatetime',
        'medianDecreaseInResolutionTime',
        'ticketId',
    ],
})

export type OverallDecreaseInResolutionTimeContext = Context<
    typeof overallDecreaseInResolutionTimeScope.config
>

export const overallDecreaseInResolutionTime =
    overallDecreaseInResolutionTimeScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_OVERVIEW_DECREASE_IN_RESOLUTION_TIME,
        )
        .defineQuery(() => ({
            measures: ['medianDecreaseInResolutionTime'] as const,
        }))

export const overallDecreaseInResolutionTimeQueryV2Factory = (
    ctx: OverallDecreaseInResolutionTimeContext,
) => overallDecreaseInResolutionTime.build(ctx)
