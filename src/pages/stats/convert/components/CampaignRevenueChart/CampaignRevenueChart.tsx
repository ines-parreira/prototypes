import React from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {getTimezone} from 'state/currentUser/selectors'
import {useGetCurrencyForStore} from 'pages/stats/convert/hooks/useGetCurrencyForStore'

import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import useGetCampaignRevenueTimeSeries from 'pages/stats/convert/hooks/stats/useGetCampaignRevenueTimeSeries'
import {OverviewMetricConfig} from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import {DEFAULT_TIMEZONE} from 'pages/stats/convert/constants/components'
import {CAMPAIGN_REVENUE_LABEL} from 'pages/stats/convert/constants/labels'
import {useGridSize} from 'hooks/useGridSize'
import {useGetNamespacedShopNameForStore} from 'pages/stats/convert/hooks/useGetNamespacedShopNameForStore'

const CampaignRevenueChart = () => {
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

    const currency = useGetCurrencyForStore(selectedIntegrations)

    const {isFetching, isError, data} = useGetCampaignRevenueTimeSeries(
        namespacedShopName,
        selectedCampaignIds,
        selectedCampaignsOperator,
        selectedPeriod.start_datetime,
        selectedPeriod.end_datetime,
        userTimezone
    )

    const isLoading = isFetching || isError

    const getGridCellSize = useGridSize()

    return (
        <>
            <DashboardGridCell size={getGridCellSize(12)}>
                <ChartCard
                    title={OverviewMetricConfig.revenue.title}
                    hint={OverviewMetricConfig.revenue.hint}
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
            </DashboardGridCell>
        </>
    )
}

export default CampaignRevenueChart
