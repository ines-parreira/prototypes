import React from 'react'

import moment from 'moment'

import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { StatsFilters } from 'models/stat/types'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import {
    comparedPeriodString,
    formatMetricValue,
    MetricTrendFormat,
} from 'pages/stats/common/utils'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import MetricCard from 'pages/stats/MetricCard'
import { getPreviousPeriod } from 'utils/reporting'

type VoiceCallVolumeMetricProps = {
    title: string
    hint: string
    statsFilters: StatsFilters
    moreIsBetter?: boolean
    metricTrend: MetricTrend
} & DashboardChartProps

const getTrendProps = (metricTrend: MetricTrend, moreIsBetter = true) => ({
    value: metricTrend.data?.value || 0,
    prevValue: metricTrend.data?.prevValue || 0,
    format: 'percent' as MetricTrendFormat,
    interpretAs: moreIsBetter
        ? ('more-is-better' as const)
        : ('less-is-better' as const),
})

function VoiceCallVolumeMetric({
    title,
    hint,
    metricTrend,
    statsFilters,
    moreIsBetter = true,
    dashboard,
    chartId,
}: VoiceCallVolumeMetricProps) {
    const voiceCallsCount = metricTrend.data?.value
    const previousPeriod = getPreviousPeriod(statsFilters.period)

    return (
        <MetricCard
            title={title}
            chartId={chartId}
            dashboard={dashboard}
            hint={{
                title: hint,
            }}
            isLoading={metricTrend.isFetching}
        >
            <BigNumberMetric
                isLoading={metricTrend.isFetching}
                trendBadge={
                    <TrendBadge
                        {...getTrendProps(metricTrend, moreIsBetter)}
                        tooltipData={{
                            period: comparedPeriodString(
                                moment(previousPeriod.start_datetime),
                                moment(previousPeriod.end_datetime),
                            ),
                        }}
                    />
                }
            >
                {voiceCallsCount !== undefined
                    ? formatMetricValue(voiceCallsCount, 'integer')
                    : '-'}
            </BigNumberMetric>
        </MetricCard>
    )
}

export default VoiceCallVolumeMetric
