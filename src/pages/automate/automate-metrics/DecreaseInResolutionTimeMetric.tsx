import React from 'react'

import BigNumberMetric from 'pages/stats/BigNumberMetric'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import MetricCard from 'pages/stats/MetricCard'

import {DECREASE_IN_RESOLUTION_TIME} from './constants'
import {BaseAutomateMetricProps} from './types'
import {getTrendProps, toDuration} from './utils'

export const DECREASE_IN_RESOLUTION_TIME_TOOLTIP = (
    <>
        How much faster Gorgias Automate is helping your team resolve
        interactions, based on your average resolution time.{' '}
        <a target="_blank" href="https://link.gorgias.com/ec5" rel="noreferrer">
            How is it calculated?
        </a>
    </>
)

export const DecreaseInResolutionTimeMetric = ({
    trend: decreaseInResolutionTimeMetric,
}: BaseAutomateMetricProps) => {
    return (
        <MetricCard
            title={DECREASE_IN_RESOLUTION_TIME}
            hint={{
                title: DECREASE_IN_RESOLUTION_TIME_TOOLTIP,
            }}
            isLoading={decreaseInResolutionTimeMetric.isFetching}
        >
            <BigNumberMetric
                isLoading={decreaseInResolutionTimeMetric.isFetching}
                trendBadge={
                    <TrendBadge
                        {...getTrendProps(decreaseInResolutionTimeMetric)}
                    />
                }
            >
                {toDuration(decreaseInResolutionTimeMetric)}
            </BigNumberMetric>
        </MetricCard>
    )
}
