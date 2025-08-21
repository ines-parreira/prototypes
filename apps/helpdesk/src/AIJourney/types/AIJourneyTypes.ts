import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import { MetricTrendFormat } from 'domains/reporting/pages/common/utils'

export enum AIJourneyMetric {
    TotalOrders = 'aiJourneyTotalOrders',
}

export type AIJourneyMetrics = {
    title: string
    metricName: AIJourneyMetric
    journeyId?: string
    integrationId: string
    shopName?: string
}

export const AIJourneyMetricsConfig: Record<
    AIJourneyMetric,
    {
        showMetric: boolean
        domain: Domain
        title: string
        metricFormat: MetricTrendFormat
    }
> = {
    [AIJourneyMetric.TotalOrders]: {
        title: 'Total Orders',
        metricFormat: 'decimal-precision-1',
        showMetric: false,
        domain: Domain.AIJourney,
    },
}
