import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useVoiceCallSlaAchievementRateTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallSlaAchievementRateTrend'
import { VoiceMetricsConfig } from 'domains/reporting/pages/voice/VoiceConfigs/VoiceMetricsConfig'
import { VoiceMetric } from 'domains/reporting/state/ui/stats/types'

export const VoiceCallSlaAchievementRateChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <TrendCard
            /* useTrend and interpretAs are already defined in VoiceMetricsConfig,
         avoiding type issues before all metrics configs are updated
         */
            useTrend={useVoiceCallSlaAchievementRateTrend}
            interpretAs="more-is-better"
            {...VoiceMetricsConfig[VoiceMetric.VoiceCallsAchievementRate]}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
