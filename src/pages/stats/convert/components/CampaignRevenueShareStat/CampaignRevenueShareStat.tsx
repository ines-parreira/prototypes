import React from 'react'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {useGetNamespacedShopNameForStore} from 'pages/stats/convert/hooks/useGetNamespacedShopNameForStore'
import {useGetRevenueShareChart} from 'pages/stats/convert/hooks/stats/useGetRevenueShareChart'
import {
    renderTickLabelAsPercentage,
    renderTooltipLabelAsPercentage,
} from 'pages/stats/utils'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {DEFAULT_TIMEZONE} from 'pages/stats/convert/constants/components'

const title = 'Total store revenue share influenced by campaigns'
const yAxisLabel = 'Revenue share influenced by campaigns'
const hint = `Impact of campaigns on your store revenue, by day, calculated as:
Campaign revenue / Total store revenue`

export const CampaignRevenueShareStat = () => {
    const {
        selectedIntegrations,
        selectedCampaignIds,
        selectedCampaignsOperator,
        selectedPeriod,
    } = useCampaignStatsFilters()
    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )

    const {isFetching, isError, data} = useGetRevenueShareChart(
        namespacedShopName,
        selectedCampaignIds,
        selectedCampaignsOperator,
        selectedPeriod.start_datetime,
        selectedPeriod.end_datetime,
        userTimezone
    )

    const isLoading = isFetching || isError

    return (
        <DashboardGridCell size={12}>
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
                    _renderLegacyTooltipLabel={renderTooltipLabelAsPercentage}
                    isLoading={isLoading}
                />
            </ChartCard>
        </DashboardGridCell>
    )
}
