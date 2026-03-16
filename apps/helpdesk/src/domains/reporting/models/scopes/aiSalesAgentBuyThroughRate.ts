import { MetricScope } from 'domains/reporting/hooks/metricNames'
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
