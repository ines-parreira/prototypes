import React, {useEffect, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {useCampaignStatsFilters} from 'pages/stats/revenue/hooks/useCampaignStatsFilters'
import {CampaignsTotals} from 'pages/stats/revenue/services/types'
import {getTotals} from 'pages/stats/revenue/services/CampaignPerformanceService'
import {useGetCurrencyForStore} from 'pages/stats/revenue/hooks/useGetCurrencyForStore'
import {useGetNamespacedShopNameForStore} from 'pages/stats/revenue/hooks/useGetNamespacedShopNameForStore'
import DashboardSection from 'pages/stats/DashboardSection'
import MetricCard from 'pages/stats/MetricCard'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {CampaignsTotalsMetricNames} from 'pages/stats/revenue/services/constants'

type Props = {
    onError: (error: Error) => void
}

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

export const CampaignTotalsStat = ({onError}: Props) => {
    const [totals, setTotals] = useState<CampaignsTotals | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [statsVisible, setStatsVisible] = useState(false)

    const {selectedIntegrations, selectedCampaigns, selectedPeriod} =
        useCampaignStatsFilters()
    const currency = useGetCurrencyForStore(selectedIntegrations)
    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)

    const [{loading}, fetchTotals] = useAsyncFn(async () => {
        try {
            const data = await getTotals(
                namespacedShopName,
                selectedCampaigns,
                currency,
                selectedPeriod.start_datetime,
                selectedPeriod.end_datetime
            )
            setTotals(data)
        } catch (error) {
            onError(error)
            setError(error)
        }
    }, [namespacedShopName, selectedCampaigns, selectedPeriod, currency])

    useEffect(() => void fetchTotals(), [fetchTotals])

    useEffect(() => {
        setStatsVisible(!loading && !error && totals !== null)
    }, [loading, error, totals])

    return (
        <DashboardSection title="">
            <DashboardGridCell size={GRID_SIZE}>
                {statsVisible && (
                    <MetricCard
                        title={METRICS.revenue.title}
                        hint={METRICS.revenue.hint}
                    >
                        <BigNumberMetric>{totals?.revenue}</BigNumberMetric>
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
                            {totals?.influencedRevenueUplift}
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
                        <BigNumberMetric>{totals?.gmv}</BigNumberMetric>
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
                        <BigNumberMetric>{totals?.impressions}</BigNumberMetric>
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
                        <BigNumberMetric>{totals?.engagement}</BigNumberMetric>
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
                            {totals?.campaignSalesCount}
                        </BigNumberMetric>
                    </MetricCard>
                )}
                {!statsVisible && <Skeleton height={SKELETON_HEIGHT} />}
            </DashboardGridCell>
        </DashboardSection>
    )
}
