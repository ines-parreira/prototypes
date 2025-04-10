import BigNumberMetric from 'pages/stats/common/components/BigNumberMetric'
import MetricCard from 'pages/stats/common/components/MetricCard'
import { OverviewMetricConfig } from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import { usePerformanceTotalStats } from 'pages/stats/convert/hooks/usePerformanceTotalStats'
import { CampaignsTotalsMetricNames } from 'pages/stats/convert/services/constants'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

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
