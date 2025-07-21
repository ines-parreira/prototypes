import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { isFilterEmpty } from 'domains/reporting/pages/utils'
import VoiceCallVolumeMetric from 'domains/reporting/pages/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import VoiceCallVolumeMetricEmpty from 'domains/reporting/pages/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetricEmpty'
import { useVoiceCallCountTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallCountTrend'

type CallsCountDashboardChartProps = DashboardChartProps & {
    title: string
    hint: string
    segment: VoiceCallSegment
    hideWithAgentsFilter?: boolean
    multiFormat?: boolean
}

export const VoiceCallVolumeMetricCallsCountTrendChart = ({
    chartId,
    dashboard,
    title,
    hint,
    segment,
    multiFormat,
    hideWithAgentsFilter = false,
}: CallsCountDashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const shouldHide =
        hideWithAgentsFilter && !isFilterEmpty(cleanStatsFilters.agents)

    return shouldHide ? (
        <VoiceCallVolumeMetricEmpty
            title={title}
            hint={hint}
            chartId={chartId}
            dashboard={dashboard}
        />
    ) : (
        <VoiceCallVolumeMetricCallsCountTrendChartFull
            title={title}
            hint={hint}
            segment={segment}
            statsFilters={cleanStatsFilters}
            userTimezone={userTimezone}
            chartId={chartId}
            dashboard={dashboard}
            multiFormat={multiFormat}
        />
    )
}

type CallsCountDashboardChartFullProps = DashboardChartProps & {
    title: string
    hint: string
    segment: VoiceCallSegment
    statsFilters: StatsFilters
    userTimezone: string
    multiFormat?: boolean
}

const VoiceCallVolumeMetricCallsCountTrendChartFull = ({
    chartId,
    dashboard,
    title,
    hint,
    segment,
    statsFilters,
    userTimezone,
    multiFormat,
}: CallsCountDashboardChartFullProps) => {
    const callsCountTrend = useVoiceCallCountTrend(
        statsFilters,
        userTimezone,
        segment,
    )

    return (
        <VoiceCallVolumeMetric
            title={title}
            hint={hint}
            statsFilters={statsFilters}
            metricTrend={callsCountTrend}
            chartId={chartId}
            dashboard={dashboard}
            moreIsBetter={false}
            multiFormat={multiFormat}
        />
    )
}
