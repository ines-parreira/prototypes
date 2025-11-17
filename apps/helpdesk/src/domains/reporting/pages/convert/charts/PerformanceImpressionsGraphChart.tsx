import { ReportingGranularity } from 'domains/reporting/models/types'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { formatTimeSeriesData } from 'domains/reporting/pages/common/utils'
import { OverviewMetricConfig } from 'domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig'
import { IMPRESSIONS_LABEL } from 'domains/reporting/pages/convert/constants/labels'
import { usePerformanceCampaignPerformanceStats } from 'domains/reporting/pages/convert/hooks/usePerformanceCampaignPerformanceStats'
import { CampaignsTotalsMetricNames } from 'domains/reporting/pages/convert/services/constants'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const PerformanceImpressionsGraphChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { isLoading, campaignPerformanceSeries } =
        usePerformanceCampaignPerformanceStats()
    return (
        <ChartCard
            {...OverviewMetricConfig[CampaignsTotalsMetricNames.impressions]}
            chartId={chartId}
            dashboard={dashboard}
        >
            <LineChart
                isLoading={isLoading}
                data={formatTimeSeriesData(
                    campaignPerformanceSeries?.impressionsSeries,
                    IMPRESSIONS_LABEL,
                    ReportingGranularity.Day,
                )}
                _displayLegacyTooltip
            />
        </ChartCard>
    )
}
