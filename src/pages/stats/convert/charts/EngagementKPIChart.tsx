import BigNumberMetric from 'pages/stats/common/components/BigNumberMetric'
import MetricCard from 'pages/stats/common/components/MetricCard'
import { METRICS } from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import { useCampaignTotalStats } from 'pages/stats/convert/hooks/useCampaignTotalStats'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

export const EngagementKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { data, isLoading } = useCampaignTotalStats()

    return (
        <MetricCard
            title={METRICS.engagement.title}
            hint={METRICS.engagement.hint}
            chartId={chartId}
            dashboard={dashboard}
        >
            <BigNumberMetric isLoading={isLoading}>
                {data?.engagement}
            </BigNumberMetric>
        </MetricCard>
    )
}
