import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const overallAutomatedInteractionsScope = defineScope({
    scope: MetricScope.OverallAutomatedInteractions,
    measures: ['automatedInteractionsCount'],
    dimensions: [
        'automationFeatureType',
        'orderManagementType',
        'channel',
        'storeIntegrationId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'channel',
        'storeIntegrationId',
        'automationFeatureType',
    ],
    order: ['eventDatetime', 'automatedInteractionsCount'],
})

export const dynamicOverallAutomatedInteractions =
    overallAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_DYNAMIC_OVERALL_AUTOMATED_INTERACTIONS,
        )
        .defineQuery(({ ctx }) => ({
            measures: ['automatedInteractionsCount'],
            dimensions: ctx.dimensions,
        }))

export const dynamicOverallAutomatedInteractionsQueryFactoryV2 = (
    ctx: Context,
) => dynamicOverallAutomatedInteractions.build(ctx)
