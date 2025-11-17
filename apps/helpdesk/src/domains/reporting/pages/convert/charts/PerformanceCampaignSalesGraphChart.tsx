import { ReportingGranularity } from 'domains/reporting/models/types'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { formatTimeSeriesData } from 'domains/reporting/pages/common/utils'
import { OverviewMetricConfig } from 'domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig'
import { ORDER_COUNT_LABEL } from 'domains/reporting/pages/convert/constants/labels'
import { usePerformanceCampaignPerformanceStats } from 'domains/reporting/pages/convert/hooks/usePerformanceCampaignPerformanceStats'
import { CampaignsTotalsMetricNames } from 'domains/reporting/pages/convert/services/constants'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const PerformanceCampaignSalesGraphChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { isLoading, campaignPerformanceSeries } =
        usePerformanceCampaignPerformanceStats()

    return (
        <ChartCard
            {...OverviewMetricConfig[
                CampaignsTotalsMetricNames.campaignSalesCount
            ]}
            chartId={chartId}
            dashboard={dashboard}
        >
            <LineChart
                isLoading={isLoading}
                data={formatTimeSeriesData(
                    campaignPerformanceSeries?.ordersCountSeries,
                    ORDER_COUNT_LABEL,
                    ReportingGranularity.Day,
                )}
                _displayLegacyTooltip
            />
        </ChartCard>
    )
}
