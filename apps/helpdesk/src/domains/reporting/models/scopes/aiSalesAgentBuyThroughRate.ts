import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

export const aiSalesAgentBuyThroughRateScope = defineScope({
    scope: MetricScope.AiSalesAgentBuyThroughRate,
    measures: ['buyThroughRate'],
    dimensions: [
        'boughtProducts',
        'channel',
        'engagementType',
        'productRecommended',
        'storeIntegrationId',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'channel',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: ['buyThroughRate', 'eventDatetime', 'ticketId'],
})

export type AiSalesAgentBuyThroughRateContext = Context<
    typeof aiSalesAgentBuyThroughRateScope.config
>

export const buyThroughRate = aiSalesAgentBuyThroughRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_BUY_THROUGH_RATE)
    .defineQuery(() => ({
        measures: ['buyThroughRate'] as const,
    }))

export const buyThroughRateQueryV2Factory = (
    ctx: AiSalesAgentBuyThroughRateContext,
) => buyThroughRate.build(ctx)
