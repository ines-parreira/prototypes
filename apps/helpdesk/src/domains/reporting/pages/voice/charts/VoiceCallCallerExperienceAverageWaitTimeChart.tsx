import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import VoiceCallCallerExperienceMetric from 'domains/reporting/pages/voice/components/VoiceCallerExperienceMetric/VoiceCallCallerExperienceMetric'
import {
    AVERAGE_WAIT_TIME_METRIC_HINT,
    AVERAGE_WAIT_TIME_METRIC_TITLE,
} from 'domains/reporting/pages/voice/constants/voiceOverview'
import { useVoiceCallAverageTimeTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallAverageTimeTrend'
import { VoiceCallAverageTimeMetric } from 'domains/reporting/pages/voice/models/types'
import { VoiceMetric } from 'domains/reporting/state/ui/stats/types'

export const VoiceCallCallerExperienceAverageWaitTimeChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const averageWaitTimeTrend = useVoiceCallAverageTimeTrend(
        VoiceCallAverageTimeMetric.WaitTime,
        cleanStatsFilters,
        userTimezone,
    )

    return (
        <VoiceCallCallerExperienceMetric
            chartId={chartId}
            dashboard={dashboard}
            title={AVERAGE_WAIT_TIME_METRIC_TITLE}
            hint={AVERAGE_WAIT_TIME_METRIC_HINT}
            statsFilters={cleanStatsFilters}
            metricTrend={averageWaitTimeTrend}
            metricData={{
                metricName: VoiceMetric.AverageWaitTime,
                title: AVERAGE_WAIT_TIME_METRIC_TITLE,
            }}
        />
    )
}
