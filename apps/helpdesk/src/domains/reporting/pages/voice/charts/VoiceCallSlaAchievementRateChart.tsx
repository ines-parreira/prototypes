import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import VoiceCallVolumeMetric from 'domains/reporting/pages/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import {
    SLA_ACHIEVEMENT_RATE_METRIC_HINT,
    SLA_ACHIEVEMENT_RATE_METRIC_TITLE,
} from 'domains/reporting/pages/voice/constants/liveVoice'
import { useVoiceCallSlaAchievementRateTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallSlaAchievementRateTrend'

export const VoiceCallSlaAchievementRateChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const slaAchievementRateTrend = useVoiceCallSlaAchievementRateTrend(
        cleanStatsFilters,
        userTimezone,
    )

    return (
        <VoiceCallVolumeMetric
            title={SLA_ACHIEVEMENT_RATE_METRIC_TITLE}
            hint={SLA_ACHIEVEMENT_RATE_METRIC_HINT}
            statsFilters={cleanStatsFilters}
            metricTrend={slaAchievementRateTrend}
            metricValueFormat="percent"
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
