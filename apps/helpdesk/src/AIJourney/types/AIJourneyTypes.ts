import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import type { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'

export enum AIJourneyMetric {
    TotalOrders = 'aiJourneyTotalOrders',
    ResponseRate = 'aiJourneyResponseRate',
    OptOutRate = 'aiJourneyOptOutRate',
    ClickThroughRate = 'aiJourneyClickThroughRate',
    DiscountCodesGenerated = 'aiJourneyDiscountCodesGenerated',
    DiscountCodesUsed = 'aiJourneyDiscountCodesUsed',
}

export type AIJourneyMetrics = {
    title: string
    metricName: AIJourneyMetric
    journeyIds?: string[]
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
    [AIJourneyMetric.OptOutRate]: {
        title: 'Opt Out Rate',
        metricFormat: 'percent-precision-1',
        showMetric: false,
        domain: Domain.AIJourney,
    },
    [AIJourneyMetric.DiscountCodesGenerated]: {
        title: 'Discount Codes Generated',
        metricFormat: 'decimal',
        showMetric: false,
        domain: Domain.AIJourney,
    },
    [AIJourneyMetric.DiscountCodesUsed]: {
        title: 'Discount Codes Used',
        metricFormat: 'decimal',
        showMetric: false,
        domain: Domain.AIJourney,
    },
}

export type MetricProps = {
    label: string
    value: number
    prevValue?: number | null | undefined
    series?: TimeSeriesDataItem[]
    interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    metricFormat: MetricValueFormat
    currency?: string
    isLoading: boolean
    drilldown?: DrillDownMetric
}

export type OrderStatus = 'order_placed' | 'order_fulfilled'

export type TargetOrderStatusFieldProps = {
    value?: OrderStatus | null
    onChange?: (value: OrderStatus) => void
}

export type OrderStatusOption = {
    value: OrderStatus
    label: string
}
