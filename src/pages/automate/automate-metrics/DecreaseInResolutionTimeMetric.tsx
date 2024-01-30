import React from 'react'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import MetricCard from 'pages/stats/MetricCard'
import TrendBadge from 'pages/stats/TrendBadge'
import {BaseAutomateMetricProps} from './types'
import {getTrendProps, toDuration} from './utils'
import {DECREASE_IN_RESOLUTION_TIME} from './constants'

export const DecreaseInResolutionTimeMetric = ({
    trend: decreaseInResolutionTimeMetric,
}: BaseAutomateMetricProps) => {
    return (
        <MetricCard
            title={DECREASE_IN_RESOLUTION_TIME}
            hint={{
                title: 'How much faster Gorgias Automate is helping your team resolve interactions, based on your average resolution time.',
            }}
            isLoading={decreaseInResolutionTimeMetric.isFetching}
            trendBadge={
                <TrendBadge
                    {...getTrendProps(decreaseInResolutionTimeMetric)}
                />
            }
        >
            <BigNumberMetric
                isLoading={decreaseInResolutionTimeMetric.isFetching}
            >
                {toDuration(decreaseInResolutionTimeMetric)}
            </BigNumberMetric>
        </MetricCard>
    )
}
