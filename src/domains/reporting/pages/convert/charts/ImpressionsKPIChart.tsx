import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import { METRICS } from 'domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig'
import { useCampaignTotalStats } from 'domains/reporting/pages/convert/hooks/useCampaignTotalStats'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const ImpressionsKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { data, isLoading } = useCampaignTotalStats()

    return (
        <MetricCard
            title={METRICS.impressions.title}
            hint={METRICS.impressions.hint}
            chartId={chartId}
            dashboard={dashboard}
        >
            <BigNumberMetric isLoading={isLoading}>
                {data?.impressions}
            </BigNumberMetric>
        </MetricCard>
    )
}
