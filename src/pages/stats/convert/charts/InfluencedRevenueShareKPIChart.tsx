import BigNumberMetric from 'pages/stats/common/components/BigNumberMetric'
import MetricCard from 'pages/stats/common/components/MetricCard'
import { METRICS } from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import { useCampaignTotalStats } from 'pages/stats/convert/hooks/useCampaignTotalStats'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

export const InfluencedRevenueShareKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { data, isLoading } = useCampaignTotalStats()

    return (
        <MetricCard
            title={METRICS.influencedRevenueShare.title}
            hint={METRICS.influencedRevenueShare.hint}
            chartId={chartId}
            dashboard={dashboard}
        >
            <BigNumberMetric isLoading={isLoading}>
                {data?.influencedRevenueShare}
            </BigNumberMetric>
        </MetricCard>
    )
}
