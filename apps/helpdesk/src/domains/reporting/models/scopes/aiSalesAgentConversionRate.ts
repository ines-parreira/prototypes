import { MetricScope } from 'domains/reporting/hooks/metricNames'
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
