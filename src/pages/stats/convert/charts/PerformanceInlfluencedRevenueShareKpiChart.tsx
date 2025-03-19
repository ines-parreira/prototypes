import BigNumberMetric from 'pages/stats/BigNumberMetric'
import { OverviewMetricConfig } from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import { usePerformanceTotalStats } from 'pages/stats/convert/hooks/usePerformanceTotalStats'
import { CampaignsTotalsMetricNames } from 'pages/stats/convert/services/constants'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import MetricCard from 'pages/stats/MetricCard'

export const PerformanceInfluencedRevenueShareKpiChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { isLoading, totalStatsData } = usePerformanceTotalStats()

    return (
        <MetricCard
            {...OverviewMetricConfig[
                CampaignsTotalsMetricNames.influencedRevenueShare
            ]}
            chartId={chartId}
            dashboard={dashboard}
        >
            <BigNumberMetric isLoading={isLoading}>
                {totalStatsData?.influencedRevenueShare}
            </BigNumberMetric>
        </MetricCard>
    )
}
