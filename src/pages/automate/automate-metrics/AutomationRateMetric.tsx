import React, {useMemo} from 'react'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import MetricCard from 'pages/stats/MetricCard'
import PerformanceTip from 'pages/stats/PerformanceTip'
import TrendBadge from 'pages/stats/TrendBadge'
import {formatMetricValue} from 'pages/stats/common/utils'
import {AUTOMATION_RATE_FIXED_STATS, AUTOMATION_RATE_LABEL} from './constants'
import {AutomationMetricProps} from './types'
import {getTrendProps, toPercentage} from './utils'

export const AutomationRateMetric = ({
    trend: automationRateTrend,
    showTips,
}: AutomationMetricProps) => {
    const automationRateValue = automationRateTrend.data?.value || 0

    const automationRateSentiment = useMemo(() => {
        if (automationRateValue > AUTOMATION_RATE_FIXED_STATS.top10P)
            return 'success'
        else if (automationRateValue > AUTOMATION_RATE_FIXED_STATS.avg)
            return 'light-success'
        else if (automationRateValue > 0) return 'light-error'
        return 'neutral'
    }, [automationRateValue])

    return (
        <MetricCard
            title={AUTOMATION_RATE_LABEL}
            hint={{
                title: 'Automated interactions as a percent of all customer interactions handled without any agent intervention using Automate features.',
            }}
            isLoading={automationRateTrend.isFetching}
            trendBadge={<TrendBadge {...getTrendProps(automationRateTrend)} />}
            tip={
                showTips && (
                    <PerformanceTip
                        topTen={toPercentage(
                            AUTOMATION_RATE_FIXED_STATS.top10P
                        )}
                        avgMerchant={toPercentage(
                            AUTOMATION_RATE_FIXED_STATS.avg
                        )}
                        type={automationRateSentiment}
                    >
                        Set up all{' '}
                        <a target="blank" href="https://link.gorgias.com/aut">
                            Automate features
                        </a>{' '}
                        to improve your automation rate across all of your
                        channels.
                    </PerformanceTip>
                )
            }
        >
            <BigNumberMetric isLoading={automationRateTrend.isFetching}>
                {automationRateValue
                    ? formatMetricValue(automationRateValue * 100, 'percent')
                    : '-'}
            </BigNumberMetric>
        </MetricCard>
    )
}
