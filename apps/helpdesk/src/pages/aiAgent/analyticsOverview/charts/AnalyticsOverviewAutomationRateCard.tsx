import { TrendCard } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

import { useAutomationRateMetric } from '../hooks/useAutomationRateMetric'
import { formatPreviousPeriod } from '../utils/formatPreviousPeriod'

export const AnalyticsOverviewAutomationRateCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const trend = useAutomationRateMetric()
    const { cleanStatsFilters } = useStatsFilters()
    const trendTooltipData = formatPreviousPeriod(cleanStatsFilters?.period)

    return (
        <TrendCard
            trend={trend}
            metricFormat="decimal-to-percent"
            isLoading={trend.isFetching}
            interpretAs="more-is-better"
            withBorder
            withFixedWidth={false}
            trendBadgeTooltipData={{ period: trendTooltipData }}
            hint={{
                title: 'Overall automation rate',
                caption:
                    'The number of interactions automated by all automation features as a % of total customer interactions.',
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
