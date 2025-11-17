import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { OverviewMetricConfig } from 'domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig'
import { usePerformanceTotalStats } from 'domains/reporting/pages/convert/hooks/usePerformanceTotalStats'
import { CampaignsTotalsMetricNames } from 'domains/reporting/pages/convert/services/constants'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { ConvertMetric } from 'domains/reporting/state/ui/stats/types'

export const PerformanceCampaignSalesKpiChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const {
        isLoading,
        totalStatsData,
        namespacedShopName,
        selectedCampaignIds,
        selectedCampaignsOperator,
        channelConnectionExternalIds,
    } = usePerformanceTotalStats()

    return (
        <MetricCard
            {...OverviewMetricConfig[
                CampaignsTotalsMetricNames.campaignSalesCount
            ]}
            chartId={chartId}
            dashboard={dashboard}
        >
            <BigNumberMetric isLoading={isLoading}>
                <DrillDownModalTrigger
                    enabled={
                        !!totalStatsData?.campaignSalesCount &&
                        totalStatsData?.campaignSalesCount !== '0'
                    }
                    metricData={{
                        title: OverviewMetricConfig.campaignSalesCount.title,
                        metricName: ConvertMetric.CampaignSalesCount,
                        shopName: namespacedShopName,
                        selectedCampaignIds: selectedCampaignIds || [],
                        campaignsOperator: selectedCampaignsOperator,
                        context: {
                            channel_connection_external_ids:
                                channelConnectionExternalIds,
                        },
                    }}
                >
                    {totalStatsData?.campaignSalesCount}
                </DrillDownModalTrigger>
            </BigNumberMetric>
        </MetricCard>
    )
}
