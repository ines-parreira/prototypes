import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'

type DrillDownParams = Parameters<typeof useDrillDownModalTrigger>[0]

/**
 * Returns the drillDown trigger for an AI Agent TrendCard, gated behind the
 * AiAgentAnalyticsDashboardsDrillDown feature flag and a non-zero metric value.
 *
 * Pass the result directly as the TrendCard's `drillDown` prop.
 */
export const useAiAgentTrendCardDrillDown = (
    params: DrillDownParams,
    value: number | null | undefined,
) => {
    const isDrillDownEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsDrillDown,
    )
    const drillDown = useDrillDownModalTrigger(params)
    return isDrillDownEnabled && !!value ? drillDown : undefined
}
