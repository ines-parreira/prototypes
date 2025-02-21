import React from 'react'

import BigNumberMetric from 'pages/stats/BigNumberMetric'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import {formatMetricValue} from 'pages/stats/common/utils'
import MetricCard from 'pages/stats/MetricCard'
import PerformanceTip from 'pages/stats/PerformanceTip'

import {
    AUTOMATED_INTERACTION_TOOLTIP,
    AUTOMATED_INTERACTIONS_LABEL,
} from './constants'
import {AutomateMetricProps} from './types'
import {getTrendProps} from './utils'

export const AutomatedInteractionsMetric = ({
    trend: automatedInteractionsTrend,
    showTips,
    chartId,
    dashboard,
}: AutomateMetricProps) => {
    return (
        <MetricCard
            isLoading={automatedInteractionsTrend.isFetching}
            title={AUTOMATED_INTERACTIONS_LABEL}
            hint={AUTOMATED_INTERACTION_TOOLTIP}
            dashboard={dashboard}
            chartId={chartId}
            tip={
                showTips && (
                    <PerformanceTip
                        showBenchmark={false}
                        canduId="interactions"
                    >
                        Check out our{' '}
                        <a
                            target="blank"
                            href="https://link.gorgias.com/aut-playbook"
                        >
                            {' '}
                            Automation Playbook
                        </a>{' '}
                        for tactical tips on how to use Automate to its full
                        potential. Visit
                        <a target="blank" href="/app/settings/billing">
                            {' '}
                            billing
                        </a>{' '}
                        to make sure your Automate plan is the right size for
                        you.
                    </PerformanceTip>
                )
            }
        >
            <BigNumberMetric
                isLoading={automatedInteractionsTrend.isFetching}
                trendBadge={
                    <TrendBadge
                        {...getTrendProps(automatedInteractionsTrend)}
                    />
                }
            >
                {formatMetricValue(automatedInteractionsTrend.data?.value)}
            </BigNumberMetric>
        </MetricCard>
    )
}
