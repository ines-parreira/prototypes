import React from 'react'
import {useCampaignStatsFilters} from 'pages/stats/revenue/hooks/useCampaignStatsFilters'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/LineChart'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {useGetNamespacedShopNameForStore} from 'pages/stats/revenue/hooks/useGetNamespacedShopNameForStore'
import {useGetRevenueUpliftChart} from 'pages/stats/revenue/hooks/stats/useGetRevenueUpliftChart'
import {
    renderTickLabelAsPercentage,
    renderTooltipLabelAsPercentage,
} from 'pages/stats/utils'

const title = 'Revenue uplift'
const yAxisLabel = 'Total store revenue growth rate'
const hint = `Evolution rate of your total store revenue thanks to the campaigns,
    calculated as: (Campaign revenue)/(Total store revenue - Campaign Revenue)`

export const CampaignRevenueUpliftStat = () => {
    const {selectedIntegrations, selectedCampaigns, selectedPeriod} =
        useCampaignStatsFilters()
    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)

    const {isFetching, isError, data} = useGetRevenueUpliftChart(
        namespacedShopName,
        selectedCampaigns,
        selectedPeriod.start_datetime,
        selectedPeriod.end_datetime
    )

    const statsVisible = !isFetching && !isError

    return (
        <DashboardGridCell size={12}>
            {statsVisible && (
                <ChartCard title={title} hint={hint}>
                    <LineChart
                        data={[
                            {
                                label: 'Revenue uplift',
                                values: data || [],
                            },
                        ]}
                        hasBackground
                        yLabel={yAxisLabel}
                        renderYTickLabel={renderTickLabelAsPercentage}
                        _displayLegacyTooltip
                        _renderLegacyTooltipLabel={
                            renderTooltipLabelAsPercentage
                        }
                    />
                </ChartCard>
            )}
            {!statsVisible && <Skeleton height={300} />}
        </DashboardGridCell>
    )
}
