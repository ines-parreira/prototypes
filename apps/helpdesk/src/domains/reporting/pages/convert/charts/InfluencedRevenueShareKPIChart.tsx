import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import { METRICS } from 'domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig'
import { useCampaignTotalStats } from 'domains/reporting/pages/convert/hooks/useCampaignTotalStats'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

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
