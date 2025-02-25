import React from 'react'

import BigNumberMetric from 'pages/stats/BigNumberMetric'
import { OverviewMetricConfig } from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import { usePerformanceTotalStats } from 'pages/stats/convert/hooks/usePerformanceTotalStats'
import { CampaignsTotalsMetricNames } from 'pages/stats/convert/services/constants'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import { DrillDownModalTrigger } from 'pages/stats/DrillDownModalTrigger'
import MetricCard from 'pages/stats/MetricCard'
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
