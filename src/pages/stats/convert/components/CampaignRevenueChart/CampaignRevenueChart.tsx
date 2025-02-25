import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import { DEFAULT_TIMEZONE } from 'pages/stats/convert/constants/components'
import { OverviewMetricConfig } from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import { CAMPAIGN_REVENUE_LABEL } from 'pages/stats/convert/constants/labels'
import useGetCampaignRevenueTimeSeries from 'pages/stats/convert/hooks/stats/useGetCampaignRevenueTimeSeries'
import { useCampaignStatsFilters } from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import { useGetCurrencyForStore } from 'pages/stats/convert/hooks/useGetCurrencyForStore'
import { useGetNamespacedShopNameForStore } from 'pages/stats/convert/hooks/useGetNamespacedShopNameForStore'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import { getTimezone } from 'state/currentUser/selectors'

const CampaignRevenueChart = ({ chartId, dashboard }: DashboardChartProps) => {
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

    const currency = useGetCurrencyForStore(selectedIntegrations)

    const { isFetching, isError, data } = useGetCampaignRevenueTimeSeries(
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
            title={OverviewMetricConfig.revenue.title}
            hint={OverviewMetricConfig.revenue.hint}
            chartId={chartId}
            dashboard={dashboard}
        >
            <LineChart
                data={[
                    {
                        label: `${CAMPAIGN_REVENUE_LABEL} ${currency}`,
                        values: data || [],
                    },
                ]}
                isLoading={isLoading}
            />
        </ChartCard>
    )
}

export default CampaignRevenueChart
