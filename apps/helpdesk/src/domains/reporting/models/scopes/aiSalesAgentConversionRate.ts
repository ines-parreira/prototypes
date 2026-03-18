import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

export const aiSalesAgentConversionRateScope = defineScope({
    scope: MetricScope.AiSalesAgentConversionRate,
    measures: ['conversionRate'],
    dimensions: ['channel', 'engagementType', 'storeIntegrationId', 'ticketId'],
    timeDimensions: ['eventDatetime'],
    filters: [
        'channel',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: ['conversionRate', 'eventDatetime', 'ticketId'],
})

export type AiSalesAgentConversionRateContext = Context<
    typeof aiSalesAgentConversionRateScope.config
>

export const conversionRate = aiSalesAgentConversionRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_CONVERSION_RATE)
    .defineQuery(() => ({
        measures: ['conversionRate'] as const,
    }))

export const conversionRateQueryV2Factory = (
    ctx: AiSalesAgentConversionRateContext,
) => conversionRate.build(ctx)
