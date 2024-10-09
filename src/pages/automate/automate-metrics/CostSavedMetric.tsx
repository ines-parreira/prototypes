import React from 'react'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import MetricCard from 'pages/stats/MetricCard'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import {formatCurrency} from 'pages/stats/common/utils'
import {COST_SAVED} from './constants'
import {BaseAutomateMetricProps} from './types'
import {getTrendProps} from './utils'

export const COST_SAVED_TOOLTIP = (
    <>
        How much more it would have cost if these interactions were handled by
        an agent, based on Helpdesk ticket cost plus the benchmark agent cost of
        $3.1 per ticket.{' '}
        <a target="_blank" href="https://link.gorgias.com/cge" rel="noreferrer">
            How is it calculated?
        </a>
    </>
)

export const CostSavedMetric = ({
    trend: costSavedTrend,
}: BaseAutomateMetricProps) => {
    return (
        <MetricCard
            title={COST_SAVED}
            hint={{
                title: COST_SAVED_TOOLTIP,
            }}
            isLoading={costSavedTrend.isFetching}
        >
            <BigNumberMetric
                isLoading={costSavedTrend.isFetching}
                trendBadge={<TrendBadge {...getTrendProps(costSavedTrend)} />}
            >
                {formatCurrency(
                    Math.round(costSavedTrend.data?.value ?? 0),
                    'usd'
                )}
            </BigNumberMetric>
        </MetricCard>
    )
}
