import { MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

export const aiSalesAgentActivityScope = defineScope({
    scope: MetricScope.AiSalesAgentActivity,
    measures: ['recommendedProductCount', 'revenuePerInteraction'],
    dimensions: [
        'attributedRevenue',
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
    order: [
        'eventDatetime',
        'productRecommendations',
        'revenuePerInteraction',
        'ticketId',
    ],
})

export type AiSalesAgentActivityContext = Context<
    typeof aiSalesAgentActivityScope.config
>
