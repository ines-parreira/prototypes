import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import {
    REPORTS_CONFIG,
    REVAMPED_REPORTS_CONFIG,
} from 'domains/reporting/pages/dashboards/config'
import type { ChartConfig } from 'domains/reporting/pages/dashboards/types'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { VoiceServiceLevelAgreementsChart } from 'domains/reporting/pages/sla/voice/VoiceServiceLevelAgreementsReportConfig'

export const useRestrictedReportsConfig = () => {
    const { isChartRestrictedToCurrentUser, isReportRestrictedToCurrentUser } =
        useReportChartRestrictions()
    const { value: isVoiceSLAEnabled } = useFlagWithLoading(
        FeatureFlagKey.VoiceSLA,
    )
    const { value: isCustomDashboardsEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsCustomDashboards,
    )
    const baseConfig = isCustomDashboardsEnabled
        ? REVAMPED_REPORTS_CONFIG
        : REPORTS_CONFIG

    return baseConfig.map((section) => ({
        ...section,
        children: section.children
            .filter((report) => {
                if (
                    !isVoiceSLAEnabled &&
                    report.type === VoiceServiceLevelAgreementsChart
                ) {
                    return false
                }
                return !isReportRestrictedToCurrentUser(report.config.id)
            })
            .map((config) => {
                return {
                    ...config,
                    config: {
                        ...config.config,
                        charts: Object.entries(config.config.charts).reduce<
                            Record<string, ChartConfig>
                        >((acc, [key, value]) => {
                            if (!isChartRestrictedToCurrentUser(key)) {
                                acc[key] = value
                            }
                            return acc
                        }, {}),
                    },
                }
            }),
    }))
}
