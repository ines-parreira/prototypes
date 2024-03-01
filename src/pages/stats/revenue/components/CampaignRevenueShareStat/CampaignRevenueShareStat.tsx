import React from 'react'
import {useCampaignStatsFilters} from 'pages/stats/revenue/hooks/useCampaignStatsFilters'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {useGetNamespacedShopNameForStore} from 'pages/stats/revenue/hooks/useGetNamespacedShopNameForStore'
import {useGetRevenueShareChart} from 'pages/stats/revenue/hooks/stats/useGetRevenueShareChart'
import {
    renderTickLabelAsPercentage,
    renderTooltipLabelAsPercentage,
} from 'pages/stats/utils'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'

const title = 'Total store revenue share influenced by campaigns'
const yAxisLabel = 'Revenue share influenced by campaigns'
const hint = `Impact of campaigns on your store revenue, by day, calculated as:
Campaign revenue / Total store revenue`

export const CampaignRevenueShareStat = () => {
    const {selectedIntegrations, selectedCampaigns, selectedPeriod} =
        useCampaignStatsFilters()
    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )

    const {isFetching, isError, data} = useGetRevenueShareChart(
        namespacedShopName,
        selectedCampaigns,
        selectedPeriod.start_datetime,
        selectedPeriod.end_datetime,
        userTimezone
    )

    const statsVisible = !isFetching && !isError

    return (
        <DashboardGridCell size={12}>
            {statsVisible && (
                <ChartCard title={title} hint={{title: hint}}>
                    <LineChart
                        data={[
                            {
                                label: yAxisLabel,
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
