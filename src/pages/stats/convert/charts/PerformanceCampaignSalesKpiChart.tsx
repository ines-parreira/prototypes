import BigNumberMetric from 'pages/stats/common/components/BigNumberMetric'
import MetricCard from 'pages/stats/common/components/MetricCard'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import { OverviewMetricConfig } from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import { usePerformanceTotalStats } from 'pages/stats/convert/hooks/usePerformanceTotalStats'
import { CampaignsTotalsMetricNames } from 'pages/stats/convert/services/constants'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { ConvertMetric } from 'state/ui/stats/types'

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
