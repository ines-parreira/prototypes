import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import { OverviewMetricConfig } from 'domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig'
import { usePerformanceTotalStats } from 'domains/reporting/pages/convert/hooks/usePerformanceTotalStats'
import { CampaignsTotalsMetricNames } from 'domains/reporting/pages/convert/services/constants'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const PerformanceEngagementKpiChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { isLoading, totalStatsData } = usePerformanceTotalStats()

    return (
        <MetricCard
            {...OverviewMetricConfig[CampaignsTotalsMetricNames.engagement]}
            chartId={chartId}
            dashboard={dashboard}
        >
            <BigNumberMetric isLoading={isLoading}>
                {totalStatsData?.engagement}
            </BigNumberMetric>
        </MetricCard>
    )
}
