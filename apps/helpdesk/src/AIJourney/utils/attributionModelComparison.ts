import type { MetricTrendFormat } from '@repo/reporting'

import type { AttributionModelComparison } from '@gorgias/convert-client'

import type { ProviderMetricData } from 'AIJourney/hooks/useAIJourneyProviderMetricData/useAIJourneyProviderMetricData'
import { seriesToTwoDimensionalDataItem } from 'domains/reporting/hooks/useTimeSeries'

export type { AttributionModelComparison } from '@gorgias/convert-client'

export const ATTRIBUTION_MODEL_LABELS: Record<
    AttributionModelComparison,
    string
> = {
    klaviyo: 'click 5d > delivery 12h',
    attentive: 'click 5d > delivery 24h',
    postscript: 'click 7d > delivery 24h',
    liverecover: 'discount 10d > delivery 20d',
}

export const ATTRIBUTION_MODELS = Object.keys(
    ATTRIBUTION_MODEL_LABELS,
) as AttributionModelComparison[]

export function providerMetricIds(model: AttributionModelComparison) {
    const label = ATTRIBUTION_MODEL_LABELS[model]
    return {
        totalSales: `Total sales (${label})`,
        orders: `Orders (${label})`,
    }
}

export const ATTRIBUTION_MODEL_HINTS: Record<
    AttributionModelComparison,
    string
> = {
    klaviyo:
        'Orders attributed via 5-day click window with 12-hour delivery window (click priority).',
    attentive:
        'Orders attributed via 5-day click window with 24-hour delivery window (click priority).',
    postscript:
        'Orders attributed via 7-day click window with 24-hour delivery window (click priority).',
    liverecover:
        'Orders attributed via 10-day discount code window with 20-day delivery window (discount-code priority).',
}

export function buildProviderMetricPair(
    model: AttributionModelComparison,
    { orders, totalSales, ordersDrillDown }: ProviderMetricData,
    seriesBaseOptions: Omit<
        Parameters<typeof seriesToTwoDimensionalDataItem>[1],
        'label'
    >,
) {
    const { totalSales: totalSalesId, orders: ordersId } =
        providerMetricIds(model)
    return [
        {
            id: totalSalesId,
            label: totalSalesId,
            currency: totalSales.currency,
            hint: `Total value of orders attributed. ${ATTRIBUTION_MODEL_HINTS[model]}`,
            withFixedWidth: true,
            interpretAs: totalSales.interpretAs,
            isLoading: totalSales.isLoading,
            metricFormat: 'currency' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(totalSales.series, {
                label: totalSalesId,
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: totalSales.prevValue ?? null,
                value: totalSales.value,
            },
        },
        {
            id: ordersId,
            label: ordersId,
            hint: `Total number of orders attributed. ${ATTRIBUTION_MODEL_HINTS[model]}`,
            withFixedWidth: true,
            interpretAs: orders.interpretAs,
            isLoading: orders.isLoading,
            metricFormat: 'decimal-precision-1' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(orders.series, {
                label: ordersId,
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: orders.prevValue ?? null,
                value: orders.value,
            },
            drillDown: ordersDrillDown,
        },
    ]
}
