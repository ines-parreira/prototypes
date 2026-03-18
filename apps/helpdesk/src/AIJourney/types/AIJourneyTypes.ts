import type {
    MetricTrend,
    MetricTrendFormat,
    TooltipData,
    TrendDirection,
} from '@repo/reporting'

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
    TotalConversations = 'aiJourneyTotalConversations',
    TotalOptOuts = 'aiJourneyTotalOptOuts',
    TotalReplies = 'aiJourneyTotalReplies',
    OptOutAfterReply = 'aiJourneyOptOutAfterReply',
}

export type AIJourneyMetricResult = {
    trend: MetricTrend
    interpretAs: TrendDirection
    metricFormat: MetricTrendFormat
    hint: TooltipData
    drilldownMetricName?: AIJourneyMetric
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
    [AIJourneyMetric.TotalConversations]: {
        title: 'Total Conversations',
        metricFormat: 'decimal-precision-1',
        showMetric: false,
        domain: Domain.AIJourney,
    },
    [AIJourneyMetric.TotalOptOuts]: {
        title: 'Total Opt-outs',
        metricFormat: 'decimal',
        showMetric: false,
        domain: Domain.AIJourney,
    },
    [AIJourneyMetric.TotalReplies]: {
        title: 'Total Replies',
        metricFormat: 'decimal',
        showMetric: false,
        domain: Domain.AIJourney,
    },
    [AIJourneyMetric.OptOutAfterReply]: {
        title: 'Opt-out After Reply',
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
