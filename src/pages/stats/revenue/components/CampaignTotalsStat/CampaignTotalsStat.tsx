import React from 'react'
import {useCampaignStatsFilters} from 'pages/stats/revenue/hooks/useCampaignStatsFilters'
import {useGetCurrencyForStore} from 'pages/stats/revenue/hooks/useGetCurrencyForStore'
import {useGetNamespacedShopNameForStore} from 'pages/stats/revenue/hooks/useGetNamespacedShopNameForStore'
import MetricCard from 'pages/stats/MetricCard'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {CampaignsTotalsMetricNames} from 'pages/stats/revenue/services/constants'
import {useGetTotalsStat} from 'pages/stats/revenue/hooks/stats/useGetTotalsStat'

const GRID_SIZE = 4
const SKELETON_HEIGHT = 100

const METRICS = {
    [CampaignsTotalsMetricNames.gmv]: {
        title: 'Total store revenue',
        hint: `Sum of the order amount for all your store sales
        during the selected period (including taxes, fees, and refunds).`,
    },
    [CampaignsTotalsMetricNames.influencedRevenueUplift]: {
        title: 'Revenue uplift',
        hint: `Evolution rate of your total store revenue thanks to the campaigns,
        calculated as: (Campaign revenue)/(Total store revenue - Campaign Revenue).`,
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
    const {selectedIntegrations, selectedCampaigns, selectedPeriod} =
        useCampaignStatsFilters()
    const currency = useGetCurrencyForStore(selectedIntegrations)
    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)

    const {isFetching, isError, data} = useGetTotalsStat(
        namespacedShopName,
        selectedCampaigns,
        currency,
        selectedPeriod.start_datetime,
        selectedPeriod.end_datetime
    )

    const statsVisible = !isFetching && !isError && data !== null

    return (
        <React.Fragment>
            <DashboardGridCell size={GRID_SIZE}>
                {statsVisible && (
                    <MetricCard
                        title={METRICS.revenue.title}
                        hint={METRICS.revenue.hint}
                    >
                        <BigNumberMetric>{data?.revenue}</BigNumberMetric>
                    </MetricCard>
                )}
                {!statsVisible && <Skeleton height={SKELETON_HEIGHT} />}
            </DashboardGridCell>
            <DashboardGridCell size={GRID_SIZE}>
                {statsVisible && (
                    <MetricCard
                        title={METRICS.influencedRevenueUplift.title}
                        hint={METRICS.influencedRevenueUplift.hint}
                    >
                        <BigNumberMetric>
                            {data?.influencedRevenueUplift}
                        </BigNumberMetric>
                    </MetricCard>
                )}
                {!statsVisible && <Skeleton height={SKELETON_HEIGHT} />}
            </DashboardGridCell>
            <DashboardGridCell size={GRID_SIZE}>
                {statsVisible && (
                    <MetricCard
                        title={METRICS.gmv.title}
                        hint={METRICS.gmv.hint}
                    >
                        <BigNumberMetric>{data?.gmv}</BigNumberMetric>
                    </MetricCard>
                )}
                {!statsVisible && <Skeleton height={SKELETON_HEIGHT} />}
            </DashboardGridCell>
            <DashboardGridCell size={GRID_SIZE}>
                {statsVisible && (
                    <MetricCard
                        title={METRICS.impressions.title}
                        hint={METRICS.impressions.hint}
                    >
                        <BigNumberMetric>{data?.impressions}</BigNumberMetric>
                    </MetricCard>
                )}
                {!statsVisible && <Skeleton height={SKELETON_HEIGHT} />}
            </DashboardGridCell>
            <DashboardGridCell size={GRID_SIZE}>
                {statsVisible && (
                    <MetricCard
                        title={METRICS.engagement.title}
                        hint={METRICS.engagement.hint}
                    >
                        <BigNumberMetric>{data?.engagement}</BigNumberMetric>
                    </MetricCard>
                )}
                {!statsVisible && <Skeleton height={SKELETON_HEIGHT} />}
            </DashboardGridCell>
            <DashboardGridCell size={GRID_SIZE}>
                {statsVisible && (
                    <MetricCard
                        title={METRICS.campaignSalesCount.title}
                        hint={METRICS.campaignSalesCount.hint}
                    >
                        <BigNumberMetric>
                            {data?.campaignSalesCount}
                        </BigNumberMetric>
                    </MetricCard>
                )}
                {!statsVisible && <Skeleton height={SKELETON_HEIGHT} />}
            </DashboardGridCell>
        </React.Fragment>
    )
}
