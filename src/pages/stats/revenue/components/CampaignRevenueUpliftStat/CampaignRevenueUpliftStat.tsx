import React from 'react'
import {TooltipItem} from 'chart.js/dist/types'
import {useCampaignStatsFilters} from 'pages/stats/revenue/hooks/useCampaignStatsFilters'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/LineChart'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {useGetNamespacedShopNameForStore} from 'pages/stats/revenue/hooks/useGetNamespacedShopNameForStore'
import {useGetRevenueUpliftChart} from 'pages/stats/revenue/hooks/stats/useGetRevenueUpliftChart'
import {formatPercentage} from 'pages/common/utils/numbers'

const title = 'Revenue uplift'
const hint = `Evolution rate of your total store revenue thanks to the campaigns,
    calculated as: (Campaign revenue)/(Total store revenue - Campaign Revenue)`

const renderTooltipLabel = (context: TooltipItem<'line'>) => {
    let label = context.dataset.label || ''
    if (context.parsed.y !== null) {
        label += `: ${formatPercentage(context.parsed.y)}`
    }
    return label
}

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
                        hasBackground={true}
                        _displayLegacyTooltip
                        _renderLegacyTooltipLabel={renderTooltipLabel}
                    />
                </ChartCard>
            )}
            {!statsVisible && <Skeleton height={300} />}
        </DashboardGridCell>
    )
}
