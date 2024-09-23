import React from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {getTimezone} from 'state/currentUser/selectors'

import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import DashboardGridCell from 'pages/stats/DashboardGridCell'

import useGetCampaignRevenue from 'pages/stats/convert/hooks/stats/useGetCampaignRevenue'

import {DEFAULT_TIMEZONE} from 'pages/stats/convert/constants/components'
import {useGetNamespacedShopNameForStore} from 'pages/stats/convert/hooks/useGetNamespacedShopNameForStore'

const HINT =
    'Sum of the revenue generated from all campaigns selected, from both tickets converted, clicks on campaigns converted, and discount codes displayed on campaigns applied to orders.'

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

    const {isFetching, isError, data} = useGetCampaignRevenue(
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
            <ChartCard title={'Campaign Revenue'} hint={{title: HINT}}>
                <LineChart
                    data={[
                        {
                            label: 'Revenue',
                            values: data || [],
                        },
                    ]}
                    isLoading={isLoading}
                />
            </ChartCard>
        </DashboardGridCell>
    )
}

export default CampaignRevenueChart
