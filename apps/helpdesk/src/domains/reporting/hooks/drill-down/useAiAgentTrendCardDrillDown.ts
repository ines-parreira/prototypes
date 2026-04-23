import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'
import type { DrillDownModalTigerParams } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'

export const useAiAgentTrendCardDrillDown = (
    params: Omit<DrillDownModalTigerParams, 'metricName'> & {
        metricName?: DrillDownModalTigerParams['metricName']
    },
) => {
    const { value: isDrillDownEnabled, isLoading: isDrillDownFlagLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsDrillDown)

    const drillDown = useDrillDownModalTrigger({
        ...params,
        metricName:
            params.metricName as DrillDownModalTigerParams['metricName'],
    })

    if (!params.metricName || !isDrillDownEnabled || isDrillDownFlagLoading)
        return undefined

    return drillDown
}
