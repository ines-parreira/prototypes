import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import { DEFAULT_TIMEZONE } from 'pages/stats/convert/constants/components'
import { useGetRevenueShareChart } from 'pages/stats/convert/hooks/stats/useGetRevenueShareChart'
import { useCampaignStatsFilters } from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import { useGetNamespacedShopNameForStore } from 'pages/stats/convert/hooks/useGetNamespacedShopNameForStore'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import {
    renderTickLabelAsPercentage,
    renderTooltipLabelAsPercentage,
} from 'pages/stats/utils'
import { getTimezone } from 'state/currentUser/selectors'

export const title = 'Total store revenue share influenced by campaigns'
const yAxisLabel = 'Revenue share influenced by campaigns'
export const hint = `Impact of campaigns on your store revenue, by day, calculated as:
Campaign revenue / Total store revenue`

export const CampaignRevenueShareStat = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const {
        selectedIntegrations,
        selectedCampaignIds,
        selectedCampaignsOperator,
        selectedPeriod,
        granularity,
    } = useCampaignStatsFilters()
    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE,
    )

    const { isFetching, isError, data } = useGetRevenueShareChart(
        namespacedShopName,
        selectedCampaignIds,
        selectedCampaignsOperator,
        selectedPeriod.start_datetime,
        selectedPeriod.end_datetime,
        userTimezone,
        granularity,
    )

    const isLoading = isFetching || isError

    return (
        <ChartCard
            title={title}
            hint={{ title: hint }}
            chartId={chartId}
            dashboard={dashboard}
        >
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
    )
}
