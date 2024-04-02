import React, {useMemo} from 'react'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import {useGetCurrencyForStore} from 'pages/stats/convert/hooks/useGetCurrencyForStore'
import {useGetNamespacedShopNameForStore} from 'pages/stats/convert/hooks/useGetNamespacedShopNameForStore'
import MetricCard from 'pages/stats/MetricCard'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {CampaignsTotalsMetricNames} from 'pages/stats/convert/services/constants'
import {useGetTotalsStat} from 'pages/stats/convert/hooks/stats/useGetTotalsStat'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {DEFAULT_TIMEZONE} from 'pages/stats/convert/constants/components'

import css from './CampaignTotalsStat.less'

const FIRST_ROW_SIZE = 6
const GRID_SIZE = 4

const METRICS = {
    [CampaignsTotalsMetricNames.influencedRevenueShare]: {
        title: 'Total store revenue share influenced by campaigns',
        hint: `Impact of campaigns on your store revenue, calculated as:
        Campaign revenue / Total store revenue`,
    },
    [CampaignsTotalsMetricNames.revenue]: {
        title: 'Campaign revenue',
        hint: `Sum of the revenue generated from all campaigns selected,
        from both tickets converted, clicks on campaigns converted,
        and discount codes displayed on campaigns applied to orders.`,
    },
    [CampaignsTotalsMetricNames.impressions]: {
        title: 'Impressions',
        hint: `How often the selected campaigns were displayed.`,
    },
    [CampaignsTotalsMetricNames.engagement]: {
        title: 'Engagement',
        hint: `How often shoppers interacted with the selected campaigns.
        Campaign interactions include:
        (1) tickets created after a campaign,
        (2) clicks on a link displayed in a campaign,
        (3) clicks on product recommendations displayed in a campaign
        (clicks on the product link or direct add to cart),
        (4) discount code displayed in a campaign applied to an order`,
    },
    [CampaignsTotalsMetricNames.campaignSalesCount]: {
        title: 'Orders',
        hint: `Number of orders following one of the interactions counted as an engagement`,
    },
}

export const CampaignTotalsStat = () => {
    const {campaigns, selectedIntegrations, selectedCampaigns, selectedPeriod} =
        useCampaignStatsFilters()
    const currency = useGetCurrencyForStore(selectedIntegrations)
    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )

    const allCampaignIds = useMemo(() => {
        return campaigns.map((campaign) => campaign.id)
    }, [campaigns])

    const {isFetching, isError, data} = useGetTotalsStat(
        namespacedShopName,
        selectedCampaigns,
        allCampaignIds,
        currency,
        selectedPeriod.start_datetime,
        selectedPeriod.end_datetime,
        userTimezone
    )

    const isLoading = isFetching || isError || data === null

    return (
        <React.Fragment>
            <DashboardGridCell size={FIRST_ROW_SIZE}>
                <MetricCard
                    title={METRICS.revenue.title}
                    hint={{title: METRICS.revenue.hint}}
                >
                    {isLoading ? (
                        <Skeleton height={32} />
                    ) : (
                        <div className={css.wrapper}>
                            <BigNumberMetric className={css.metric}>
                                {data?.revenue}
                            </BigNumberMetric>
                            {data?.gmv && (
                                <span
                                    className={css.subText}
                                >{`from total store revenue: ${data.gmv}`}</span>
                            )}
                        </div>
                    )}
                </MetricCard>
            </DashboardGridCell>
            <DashboardGridCell size={FIRST_ROW_SIZE}>
                <MetricCard
                    title={METRICS.influencedRevenueShare.title}
                    hint={{title: METRICS.influencedRevenueShare.hint}}
                >
                    <BigNumberMetric isLoading={isLoading}>
                        {data?.influencedRevenueShare}
                    </BigNumberMetric>
                </MetricCard>
            </DashboardGridCell>
            <DashboardGridCell size={GRID_SIZE}>
                <MetricCard
                    title={METRICS.impressions.title}
                    hint={{title: METRICS.impressions.hint}}
                >
                    <BigNumberMetric isLoading={isLoading}>
                        {data?.impressions}
                    </BigNumberMetric>
                </MetricCard>
            </DashboardGridCell>
            <DashboardGridCell size={GRID_SIZE}>
                <MetricCard
                    title={METRICS.engagement.title}
                    hint={{title: METRICS.engagement.hint}}
                >
                    <BigNumberMetric isLoading={isLoading}>
                        {data?.engagement}
                    </BigNumberMetric>
                </MetricCard>
            </DashboardGridCell>
            <DashboardGridCell size={GRID_SIZE}>
                <MetricCard
                    title={METRICS.campaignSalesCount.title}
                    hint={{title: METRICS.campaignSalesCount.hint}}
                >
                    <BigNumberMetric isLoading={isLoading}>
                        {data?.campaignSalesCount}
                    </BigNumberMetric>
                </MetricCard>
            </DashboardGridCell>
        </React.Fragment>
    )
}
