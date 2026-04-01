import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'

type DrillDownParams = Omit<
    Parameters<typeof useDrillDownModalTrigger>[0],
    'metricName'
> & {
    metricName?: DrillDownMetric['metricName']
}

export const useAiAgentTrendCardDrillDown = (
    params: DrillDownParams,
    value: number | null | undefined,
) => {
    const { value: isDrillDownEnabled, isLoading: isDrillDownFlagLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsDrillDown)
    const drillDown = useDrillDownModalTrigger({
        ...params,
        metricName: (params.metricName ?? '') as DrillDownMetric['metricName'],
    })
    return !isDrillDownFlagLoading &&
        isDrillDownEnabled &&
        !!params.metricName &&
        !!value
        ? drillDown
        : undefined
}
