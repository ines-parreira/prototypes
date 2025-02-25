import React from 'react'

import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { StatsFilters, WithLogicalOperator } from 'models/stat/types'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import VoiceCallVolumeMetric from 'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import { useNewVoiceStatsFilters } from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import { useVoiceCallCountTrend } from 'pages/stats/voice/hooks/useVoiceCallCountTrend'

import VoiceCallVolumeMetricEmpty from '../components/VoiceCallVolumeMetric/VoiceCallVolumeMetricEmpty'

const isFilterEmpty = (
    filter: number[] | WithLogicalOperator<any> | undefined,
) => {
    if (filter === undefined) {
        return true
    }
    return filter.values.length === 0
}

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
    const { cleanStatsFilters, userTimezone } = useNewVoiceStatsFilters()
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
