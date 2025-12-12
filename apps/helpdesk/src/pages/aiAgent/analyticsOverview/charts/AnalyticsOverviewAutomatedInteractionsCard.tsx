import { TrendCard } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

import { useAutomatedInteractionsMetric } from '../hooks/useAutomatedInteractionsMetric'
import { formatPreviousPeriod } from '../utils/formatPreviousPeriod'

export const AnalyticsOverviewAutomatedInteractionsCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters } = useStatsFilters()
    const trend = useAutomatedInteractionsMetric()

    const trendTooltipData = formatPreviousPeriod(cleanStatsFilters?.period)

    return (
        <TrendCard
            trend={trend}
            metricFormat="decimal"
            interpretAs="more-is-better"
            isLoading={trend.isFetching}
            withBorder
            withFixedWidth={false}
            hint={{
                title: 'Automated interactions',
                caption:
                    'The number of fully automated interactions solved without any human agent intervention.',
            }}
            trendBadgeTooltipData={{ period: trendTooltipData }}
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
