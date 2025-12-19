import { useMemo } from 'react'

import { TrendCard } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useGmvInfluencedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

export const AnalyticsAiAgentTotalSalesCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const gmvTrend = useGmvInfluencedTrend(cleanStatsFilters, userTimezone)

    const trend = useMemo(() => {
        return {
            isFetching: gmvTrend.isFetching,
            isError: gmvTrend.isError,
            data: gmvTrend.data
                ? {
                      label: 'Total sales',
                      value: gmvTrend.data.value,
                      prevValue: gmvTrend.data.prevValue,
                  }
                : undefined,
        }
    }, [gmvTrend])

    const trendTooltipData = formatPreviousPeriod(cleanStatsFilters?.period)

    return (
        <TrendCard
            trend={trend}
            metricFormat="currency-precision-1"
            interpretAs="more-is-better"
            isLoading={trend.isFetching}
            withBorder
            withFixedWidth={false}
            trendBadgeTooltipData={{ period: trendTooltipData }}
            hint={{
                title: 'Total sales',
                caption:
                    'The revenue influenced by a Shopping Assistant interaction, measured from orders placed within 3 days of the interaction',
            }}
            actionMenu={
                chartId ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        dashboard={dashboard}
                        chartName={trend.data?.label}
                    />
                ) : undefined
            }
        />
    )
}
