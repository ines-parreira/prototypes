import React from 'react'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import MetricCard from 'pages/stats/MetricCard'
import TrendBadge from 'pages/stats/TrendBadge'
import {TIME_SAVED_ON_FIRST_RESPONSE} from './constants'
import {BaseAutomateMetricProps} from './types'
import {getTrendProps, toDuration} from './utils'

export const DecreaseInFirstResponseTimeMetric = ({
    trend: firstResponseTimeTrend,
}: BaseAutomateMetricProps) => {
    return (
        <MetricCard
            title={TIME_SAVED_ON_FIRST_RESPONSE}
            hint={{
                title: 'How much longer customers would have had to wait for a first response if you were not using Gorgias Automate, based on your average first response time.',
            }}
            isLoading={firstResponseTimeTrend.isFetching}
            trendBadge={
                <TrendBadge {...getTrendProps(firstResponseTimeTrend)} />
            }
        >
            <BigNumberMetric isLoading={firstResponseTimeTrend.isFetching}>
                {toDuration(firstResponseTimeTrend)}
            </BigNumberMetric>
        </MetricCard>
    )
}
