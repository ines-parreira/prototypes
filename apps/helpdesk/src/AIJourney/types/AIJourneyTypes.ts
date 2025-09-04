import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import { MetricValueFormat } from 'domains/reporting/pages/common/utils'

export enum AIJourneyMetric {
    TotalOrders = 'aiJourneyTotalOrders',
    ResponseRate = 'aiJourneyResponseRate',
    ClickThroughRate = 'aiJourneyClickThroughRate',
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
        metricFormat: MetricValueFormat
    }
> = {
    [AIJourneyMetric.TotalOrders]: {
        title: 'Total Orders',
        metricFormat: 'decimal-precision-1',
        showMetric: false,
        domain: Domain.AIJourney,
    },
    [AIJourneyMetric.ResponseRate]: {
        title: 'Response Rate',
        metricFormat: 'percent-precision-1',
        showMetric: false,
        domain: Domain.AIJourney,
    },
    [AIJourneyMetric.ClickThroughRate]: {
        title: 'Click Through Rate',
        metricFormat: 'percent-precision-1',
        showMetric: false,
        domain: Domain.AIJourney,
    },
}
