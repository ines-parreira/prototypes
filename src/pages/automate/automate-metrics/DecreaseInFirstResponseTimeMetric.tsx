import React from 'react'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import MetricCard from 'pages/stats/MetricCard'
import TrendBadge from 'pages/stats/TrendBadge'
import {DECREASE_IN_FIRST_RESPONSE} from './constants'
import {BaseAutomateMetricProps} from './types'
import {getTrendProps, toDuration} from './utils'

export const DECREASE_IN_FIRST_RESPONSE_TOOLTIP = (
    <>
        How much longer customers would have had to wait for a first response if
        you were not using Gorgias Automate, based on your average first
        response time.{' '}
        <a target="_blank" href="https://link.gorgias.com/mal" rel="noreferrer">
            How is it calculated?
        </a>
    </>
)

export const DecreaseInFirstResponseTimeMetric = ({
    trend: firstResponseTimeTrend,
}: BaseAutomateMetricProps) => {
    return (
        <MetricCard
            title={DECREASE_IN_FIRST_RESPONSE}
            hint={{
                title: DECREASE_IN_FIRST_RESPONSE_TOOLTIP,
            }}
            isLoading={firstResponseTimeTrend.isFetching}
        >
            <BigNumberMetric
                isLoading={firstResponseTimeTrend.isFetching}
                trendBadge={
                    <TrendBadge {...getTrendProps(firstResponseTimeTrend)} />
                }
            >
                {toDuration(firstResponseTimeTrend)}
            </BigNumberMetric>
        </MetricCard>
    )
}
