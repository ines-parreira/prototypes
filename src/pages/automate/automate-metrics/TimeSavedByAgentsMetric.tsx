import React from 'react'

import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import MetricCard from 'pages/stats/MetricCard'

import {TIME_SAVED_BY_AGENTS} from './constants'
import {getTrendProps, toDuration} from './utils'

type Props = {
    timeSavedByAgentsTrend: MetricTrend
} & DashboardChartProps

export const TIME_SAVED_BY_AGENTS_TOOLTIP = {
    title: 'How much time agents would have spent resolving customer inquiries without Gorgias Automate.',
    link: 'https://link.gorgias.com/jax',
    linkText: 'How is it calculated?',
}

export const TimeSavedByAgentsMetric: React.FC<Props> = ({
    timeSavedByAgentsTrend,
    chartId,
    dashboard,
}) => {
    return (
        <MetricCard
            title={TIME_SAVED_BY_AGENTS}
            hint={TIME_SAVED_BY_AGENTS_TOOLTIP}
            isLoading={timeSavedByAgentsTrend.isFetching}
            dashboard={dashboard}
            chartId={chartId}
        >
            <BigNumberMetric
                isLoading={timeSavedByAgentsTrend.isFetching}
                trendBadge={
                    <TrendBadge {...getTrendProps(timeSavedByAgentsTrend)} />
                }
            >
                {toDuration(timeSavedByAgentsTrend)}
            </BigNumberMetric>
        </MetricCard>
    )
}
