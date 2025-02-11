import {Skeleton} from '@gorgias/merchant-ui-kit'
import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import {DEFAULT_TIMEZONE} from 'pages/stats/convert/constants/components'
import {METRICS} from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import {useGetTotalsStat} from 'pages/stats/convert/hooks/stats/useGetTotalsStat'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import {useGetCurrencyForStore} from 'pages/stats/convert/hooks/useGetCurrencyForStore'
import {useGetNamespacedShopNameForStore} from 'pages/stats/convert/hooks/useGetNamespacedShopNameForStore'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import MetricCard from 'pages/stats/MetricCard'
import {getTimezone} from 'state/currentUser/selectors'

import {ConvertMetric} from 'state/ui/stats/types'

import css from './CampaignTotalsStat.less'

const FIRST_ROW_SIZE = 6
const GRID_SIZE = 4

// Deprecated: it will be deleted soon
export const CampaignTotalsStat = () => {
    const {
        selectedIntegrations,
        selectedCampaignIds,
        selectedCampaignsOperator,
        selectedPeriod,
        channelConnectionExternalIds,
    } = useCampaignStatsFilters()
    const currency = useGetCurrencyForStore(selectedIntegrations)
    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )

    const {isFetching, isError, data} = useGetTotalsStat(
        namespacedShopName,
        selectedCampaignIds,
        selectedCampaignsOperator,
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
                    hint={METRICS.revenue.hint}
                >
                    {isLoading ? (
                        <Skeleton height={32} />
                    ) : (
                        <div className={css.wrapper}>
                            <BigNumberMetric className={css.metric}>
                                {data?.revenue}
                            </BigNumberMetric>
                            {data?.gmv && data.gmv !== '0' && (
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
                    hint={METRICS.influencedRevenueShare.hint}
                >
                    <BigNumberMetric isLoading={isLoading}>
                        {data?.influencedRevenueShare}
                    </BigNumberMetric>
                </MetricCard>
            </DashboardGridCell>
            <DashboardGridCell size={GRID_SIZE}>
                <MetricCard
                    title={METRICS.impressions.title}
                    hint={METRICS.impressions.hint}
                >
                    <BigNumberMetric isLoading={isLoading}>
                        {data?.impressions}
                    </BigNumberMetric>
                </MetricCard>
            </DashboardGridCell>
            <DashboardGridCell size={GRID_SIZE}>
                <MetricCard
                    title={METRICS.engagement.title}
                    hint={METRICS.engagement.hint}
                >
                    <BigNumberMetric isLoading={isLoading}>
                        {data?.engagement}
                    </BigNumberMetric>
                </MetricCard>
            </DashboardGridCell>
            <DashboardGridCell size={GRID_SIZE}>
                <MetricCard
                    title={METRICS.campaignSalesCount.title}
                    hint={METRICS.campaignSalesCount.hint}
                >
                    <BigNumberMetric isLoading={isLoading}>
                        <DrillDownModalTrigger
                            enabled={
                                !!data?.campaignSalesCount &&
                                data?.campaignSalesCount !== '0'
                            }
                            metricData={{
                                title: METRICS.campaignSalesCount.title,
                                metricName: ConvertMetric.CampaignSalesCount,
                                shopName: namespacedShopName,
                                selectedCampaignIds: selectedCampaignIds || [],
                                campaignsOperator: selectedCampaignsOperator,
                                context: {
                                    channel_connection_external_ids:
                                        channelConnectionExternalIds,
                                },
                            }}
                        >
                            {data?.campaignSalesCount}
                        </DrillDownModalTrigger>
                    </BigNumberMetric>
                </MetricCard>
            </DashboardGridCell>
        </React.Fragment>
    )
}
