import type { MetricConfigItem } from '@repo/reporting'

import { useAIJourneyProviderTotalOrders } from 'AIJourney/hooks/useAIJourneyProviderTotalOrders/useAIJourneyProviderTotalOrders'
import { useAIJourneyProviderTotalSales } from 'AIJourney/hooks/useAIJourneyProviderTotalSales/useAIJourneyProviderTotalSales'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import type { AttributionModelComparison } from 'AIJourney/utils/attributionModelComparison'
import {
    ATTRIBUTION_MODEL_LABELS,
    providerMetricIds,
} from 'AIJourney/utils/attributionModelComparison'
import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'

type UseAIJourneyProviderMetricDataParams = Pick<
    Parameters<typeof useAIJourneyProviderTotalOrders>[0],
    'integrationId' | 'userTimezone' | 'filters' | 'granularity' | 'journeyIds'
> & {
    currency: Parameters<typeof useAIJourneyProviderTotalSales>[0]['currency']
    baseForceEmpty: boolean
    isAttributionModelComparisonEnabled: boolean | undefined
    keyKpisConfig: MetricConfigItem[]
}

export function useAIJourneyProviderMetricData(
    model: AttributionModelComparison,
    {
        integrationId,
        userTimezone,
        filters,
        currency,
        granularity,
        journeyIds,
        baseForceEmpty,
        isAttributionModelComparisonEnabled,
        keyKpisConfig,
    }: UseAIJourneyProviderMetricDataParams,
) {
    const label = ATTRIBUTION_MODEL_LABELS[model]
    const { totalSales: totalSalesId, orders: ordersId } =
        providerMetricIds(model)
    const modelEnabled = keyKpisConfig.some(
        (config) =>
            (config.id === totalSalesId || config.id === ordersId) &&
            config.visibility,
    )
    const forceEmpty =
        baseForceEmpty || !isAttributionModelComparisonEnabled || !modelEnabled

    const orders = useAIJourneyProviderTotalOrders({
        provider: model,
        integrationId,
        userTimezone,
        filters,
        granularity,
        journeyIds,
        forceEmpty,
    })
    const totalSales = useAIJourneyProviderTotalSales({
        provider: model,
        integrationId,
        userTimezone,
        filters,
        currency,
        granularity,
        journeyIds,
        forceEmpty,
    })
    const ordersDrillDown = useDrillDownModalTrigger({
        metricName: AIJourneyMetric.ProviderTotalOrders,
        title: `Total Orders (${label})`,
        integrationId,
        journeyIds,
        provider: model,
    })

    return { label, orders, totalSales, ordersDrillDown }
}

export type ProviderMetricData = ReturnType<
    typeof useAIJourneyProviderMetricData
>
