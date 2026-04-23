import type { Cube } from 'domains/reporting/models/types'

export enum AiSalesAgentActivityMeasure {
    ProductRecommendations = 'AiSalesAgentActivity.productRecommendations',
}

export enum AiSalesAgentActivityDimension {
    TicketId = 'AiSalesAgentActivity.ticketId',
    ProductRecommended = 'AiSalesAgentActivity.productRecommended',
    StoreIntegrationId = 'AiSalesAgentActivity.storeIntegrationId',
    ProductVariantIds = 'AiSalesAgentActivity.productVariantIds',
}

export enum AiSalesAgentActivityFilterMember {
    ProductRecommended = 'AiSalesAgentActivity.productRecommended',
    PeriodStart = 'AiSalesAgentActivity.periodStart',
    PeriodEnd = 'AiSalesAgentActivity.periodEnd',
    StoreIntegrationId = 'AiSalesAgentActivity.storeIntegrationId',
}

export type AiSalesAgentActivityCube = Cube<
    AiSalesAgentActivityMeasure,
    AiSalesAgentActivityDimension,
    never,
    AiSalesAgentActivityFilterMember
>
