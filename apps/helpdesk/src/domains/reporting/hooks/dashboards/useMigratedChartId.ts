import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { applyChartMigration } from 'domains/reporting/pages/dashboards/legacyAiAgentChartMigration'

export function useMigratedChartId(chartId: string): string | null {
    const { value: isNewScreensEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens,
    )
    const { value: isLegacyDisabled } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsDisableLegacyReports,
    )

    return applyChartMigration(chartId, isNewScreensEnabled, isLegacyDisabled)
}
