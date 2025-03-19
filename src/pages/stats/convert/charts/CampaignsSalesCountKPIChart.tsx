import BigNumberMetric from 'pages/stats/BigNumberMetric'
import { METRICS } from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import { useCampaignTotalStats } from 'pages/stats/convert/hooks/useCampaignTotalStats'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { DrillDownModalTrigger } from 'pages/stats/DrillDownModalTrigger'
import MetricCard from 'pages/stats/MetricCard'
import { ConvertMetric } from 'state/ui/stats/types'

export const CampaignsSalesCountKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const {
        data,
        isLoading,
        namespacedShopName,
        selectedCampaignIds,
        selectedCampaignsOperator,
        channelConnectionExternalIds,
    } = useCampaignTotalStats()

    return (
        <MetricCard
            title={METRICS.campaignSalesCount.title}
            hint={METRICS.campaignSalesCount.hint}
            chartId={chartId}
            dashboard={dashboard}
        >
            <BigNumberMetric isLoading={isLoading}>
                <DrillDownModalTrigger
                    enabled={
                        !!data?.campaignSalesCount &&
                        data?.campaignSalesCount !== '0'
                    }
                    metricData={{
                        title: METRICS.campaignSalesCount.title,
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
                    {data?.campaignSalesCount}
                </DrillDownModalTrigger>
            </BigNumberMetric>
        </MetricCard>
    )
}
