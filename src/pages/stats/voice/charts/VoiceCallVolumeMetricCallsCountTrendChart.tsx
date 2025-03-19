import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { StatsFilters } from 'models/stat/types'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { isFilterEmpty } from 'pages/stats/utils'
import VoiceCallVolumeMetric from 'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import VoiceCallVolumeMetricEmpty from 'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetricEmpty'
import { useVoiceCallCountTrend } from 'pages/stats/voice/hooks/useVoiceCallCountTrend'

type CallsCountDashboardChartProps = DashboardChartProps & {
    title: string
    hint: string
    segment: VoiceCallSegment
    hideWithAgentsFilter?: boolean
}

export const VoiceCallVolumeMetricCallsCountTrendChart = ({
    chartId,
    dashboard,
    title,
    hint,
    segment,
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
        />
    )
}

type CallsCountDashboardChartFullProps = DashboardChartProps & {
    title: string
    hint: string
    segment: VoiceCallSegment
    statsFilters: StatsFilters
    userTimezone: string
}

const VoiceCallVolumeMetricCallsCountTrendChartFull = ({
    chartId,
    dashboard,
    title,
    hint,
    segment,
    statsFilters,
    userTimezone,
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
        />
    )
}
