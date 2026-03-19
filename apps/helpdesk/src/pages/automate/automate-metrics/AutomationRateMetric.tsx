import React, { useMemo } from 'react'

import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import PerformanceTip from 'domains/reporting/pages/common/components/PerformanceTip'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'
import type { TooltipData } from 'domains/reporting/pages/types'

import { AUTOMATION_RATE_FIXED_STATS, AUTOMATION_RATE_LABEL } from './constants'
import type { AutomateMetricProps } from './types'
import { getTrendProps, toPercentage } from './utils'

export const AUTOMATION_RATE_TOOLTIP: TooltipData = {
    title: 'The number of interactions automated and billed by an automation features as a % of total billed customer interactions (automated or not).',
    link: 'https://link.gorgias.com/mnp',
    linkText: 'How is it calculated?',
}

export const AutomationRateMetric = ({
    trend: automationRateTrend,
    showTips,
    dashboard,
    chartId,
    title,
}: AutomateMetricProps) => {
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
            title={title || AUTOMATION_RATE_LABEL}
            hint={AUTOMATION_RATE_TOOLTIP}
            dashboard={dashboard}
            chartId={chartId}
            isLoading={automationRateTrend.isFetching}
            tip={
                showTips && (
                    <PerformanceTip
                        topTen={toPercentage(
                            AUTOMATION_RATE_FIXED_STATS.top10P,
                        )}
                        avgMerchant={toPercentage(
                            AUTOMATION_RATE_FIXED_STATS.avg,
                        )}
                        type={automationRateSentiment}
                        canduId="rate"
                    >
                        Set up all{' '}
                        <a target="blank" href="https://link.gorgias.com/aut">
                            AI Agent features
                        </a>{' '}
                        to improve your automation rate across all of your
                        channels.
                    </PerformanceTip>
                )
            }
        >
            <BigNumberMetric
                isLoading={automationRateTrend.isFetching}
                trendBadge={
                    <TrendBadge {...getTrendProps(automationRateTrend)} />
                }
            >
                {automationRateValue
                    ? formatMetricValue(automationRateValue * 100, 'percent')
                    : '-'}
            </BigNumberMetric>
        </MetricCard>
    )
}
