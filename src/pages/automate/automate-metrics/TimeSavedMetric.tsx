import React from 'react'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import MetricCard from 'pages/stats/MetricCard'
import TrendBadge from 'pages/stats/TrendBadge'
import {TIME_SAVED} from './constants'
import {BaseAutomateMetricProps} from './types'
import {getTrendProps, toDuration} from './utils'

export const TimeSavedMetric = ({
    trend: resolutionTimeTrend,
}: BaseAutomateMetricProps) => {
    return (
        <MetricCard
            title={TIME_SAVED}
            hint={{
                title: 'How much time agents would have spent resolving your automated interactions, based on your average resolution time.',
            }}
            isLoading={resolutionTimeTrend.isFetching}
            trendBadge={<TrendBadge {...getTrendProps(resolutionTimeTrend)} />}
        >
            <BigNumberMetric isLoading={resolutionTimeTrend.isFetching}>
                {toDuration(resolutionTimeTrend)}
            </BigNumberMetric>
        </MetricCard>
    )
}
