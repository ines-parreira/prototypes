import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import { OverviewMetricConfig } from 'domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig'
import { usePerformanceTotalStats } from 'domains/reporting/pages/convert/hooks/usePerformanceTotalStats'
import { CampaignsTotalsMetricNames } from 'domains/reporting/pages/convert/services/constants'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const PerformanceImpressionsKpiChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { isLoading, totalStatsData } = usePerformanceTotalStats()

    return (
        <MetricCard
            {...OverviewMetricConfig[CampaignsTotalsMetricNames.impressions]}
            chartId={chartId}
            dashboard={dashboard}
        >
            <BigNumberMetric isLoading={isLoading}>
                {totalStatsData?.impressions}
            </BigNumberMetric>
        </MetricCard>
    )
}
