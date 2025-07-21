import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import VoiceCallVolumeMetric from 'domains/reporting/pages/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import {
    TOTAL_CALLS_METRIC_HINT,
    TOTAL_CALLS_METRIC_TITLE,
} from 'domains/reporting/pages/voice/constants/voiceOverview'
import { useVoiceCallCountTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallCountTrend'

export const VoiceCallVolumeTotalCallCountTrendChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const totalCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
    )

    return (
        <VoiceCallVolumeMetric
            title={TOTAL_CALLS_METRIC_TITLE}
            hint={TOTAL_CALLS_METRIC_HINT}
            statsFilters={cleanStatsFilters}
            metricTrend={totalCallsCountTrend}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
