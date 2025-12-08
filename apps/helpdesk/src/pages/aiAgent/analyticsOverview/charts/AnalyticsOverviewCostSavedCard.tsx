import { TrendCard } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

import { useCostSavedMetric } from '../hooks/useCostSavedMetric'

export const AnalyticsOverviewCostSavedCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const trend = useCostSavedMetric()

    return (
        <TrendCard
            trend={trend}
            metricFormat="currency-precision-1"
            interpretAs="more-is-better"
            withBorder
            withFixedWidth={false}
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
