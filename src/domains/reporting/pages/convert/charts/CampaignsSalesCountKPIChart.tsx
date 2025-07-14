import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { METRICS } from 'domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig'
import { useCampaignTotalStats } from 'domains/reporting/pages/convert/hooks/useCampaignTotalStats'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { ConvertMetric } from 'domains/reporting/state/ui/stats/types'

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
