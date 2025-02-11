import {Skeleton} from '@gorgias/merchant-ui-kit'
import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {useGridSize} from 'hooks/useGridSize'
import {ReportingGranularity} from 'models/reporting/types'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import {formatTimeSeriesData} from 'pages/stats/common/utils'
import CampaignRevenueChart from 'pages/stats/convert/components/CampaignRevenueChart'
import {DEFAULT_TIMEZONE} from 'pages/stats/convert/constants/components'
import {OverviewMetricConfig} from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import {
    IMPRESSIONS_LABEL,
    ORDER_COUNT_LABEL,
} from 'pages/stats/convert/constants/labels'
import useCampaignPerformanceTimeSeries from 'pages/stats/convert/hooks/stats/useCampaignPerformanceTimeSeries'
import {useGetTotalsStat} from 'pages/stats/convert/hooks/stats/useGetTotalsStat'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import {useGetCurrencyForStore} from 'pages/stats/convert/hooks/useGetCurrencyForStore'
import {useGetNamespacedShopNameForStore} from 'pages/stats/convert/hooks/useGetNamespacedShopNameForStore'
import {CampaignsTotalsMetricNames} from 'pages/stats/convert/services/constants'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import MetricCard from 'pages/stats/MetricCard'
import {getTimezone} from 'state/currentUser/selectors'

import {ConvertMetric} from 'state/ui/stats/types'

import css from './CampaignPerformanceCharts.less'

const CampaignPerformanceCharts = () => {
    const {
        selectedIntegrations,
        selectedCampaignIds,
        selectedCampaignsOperator,
        selectedPeriod,
        channelConnectionExternalIds,
        granularity,
    } = useCampaignStatsFilters()

    const currency = useGetCurrencyForStore(selectedIntegrations)

    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)

    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )

    const getGridCellSize = useGridSize()

    // one request multiple stats
    const {
        isFetching: totalStatsIsFetching,
        isError: totalStatsIsError,
        data: totalStatsData,
    } = useGetTotalsStat(
        namespacedShopName,
        selectedCampaignIds,
        selectedCampaignsOperator,
        currency,
        selectedPeriod.start_datetime,
        selectedPeriod.end_datetime,
        userTimezone
    )

    const {
        isFetching: campaignPerformanceIsFetching,
        data: campaignPerformanceSeries,
        isError: campaignPerformanceIsError,
    } = useCampaignPerformanceTimeSeries(
        namespacedShopName,
        selectedCampaignIds,
        selectedCampaignsOperator,
        selectedPeriod.start_datetime,
        selectedPeriod.end_datetime,
        userTimezone,
        granularity
    )

    const isLoading =
        totalStatsIsFetching ||
        campaignPerformanceIsFetching ||
        totalStatsIsError ||
        campaignPerformanceIsError

    return (
        <>
            <DashboardSection title="Revenue Performance">
                <DashboardGridCell size={getGridCellSize(6)}>
                    <MetricCard
                        {...OverviewMetricConfig[
                            CampaignsTotalsMetricNames.revenue
                        ]}
                    >
                        {isLoading ? (
                            <Skeleton height={32} />
                        ) : (
                            <div className={css.wrapper}>
                                <BigNumberMetric className={css.metric}>
                                    {totalStatsData?.revenue}
                                </BigNumberMetric>
                                {totalStatsData?.gmv &&
                                    totalStatsData.gmv !== '0' && (
                                        <span
                                            className={css.subText}
                                        >{`from total store revenue: ${totalStatsData.gmv}`}</span>
                                    )}
                            </div>
                        )}
                    </MetricCard>
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(6)}>
                    <MetricCard
                        {...OverviewMetricConfig[
                            CampaignsTotalsMetricNames.influencedRevenueShare
                        ]}
                    >
                        <BigNumberMetric isLoading={isLoading}>
                            {totalStatsData?.influencedRevenueShare}
                        </BigNumberMetric>
                    </MetricCard>
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(12)}>
                    <CampaignRevenueChart />
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection title="Campaign Performance">
                <DashboardGridCell size={getGridCellSize(4)}>
                    <MetricCard
                        {...OverviewMetricConfig[
                            CampaignsTotalsMetricNames.impressions
                        ]}
                    >
                        <BigNumberMetric isLoading={isLoading}>
                            {totalStatsData?.impressions}
                        </BigNumberMetric>
                    </MetricCard>
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(4)}>
                    <MetricCard
                        {...OverviewMetricConfig[
                            CampaignsTotalsMetricNames.engagement
                        ]}
                    >
                        <BigNumberMetric isLoading={isLoading}>
                            {totalStatsData?.engagement}
                        </BigNumberMetric>
                    </MetricCard>
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(4)}>
                    <MetricCard
                        {...OverviewMetricConfig[
                            CampaignsTotalsMetricNames.campaignSalesCount
                        ]}
                    >
                        <BigNumberMetric isLoading={isLoading}>
                            <DrillDownModalTrigger
                                enabled={
                                    !!totalStatsData?.campaignSalesCount &&
                                    totalStatsData?.campaignSalesCount !== '0'
                                }
                                metricData={{
                                    title: OverviewMetricConfig
                                        .campaignSalesCount.title,
                                    metricName:
                                        ConvertMetric.CampaignSalesCount,
                                    shopName: namespacedShopName,
                                    selectedCampaignIds:
                                        selectedCampaignIds || [],
                                    campaignsOperator:
                                        selectedCampaignsOperator,
                                    context: {
                                        channel_connection_external_ids:
                                            channelConnectionExternalIds,
                                    },
                                }}
                            >
                                {totalStatsData?.campaignSalesCount}
                            </DrillDownModalTrigger>
                        </BigNumberMetric>
                    </MetricCard>
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(6)}>
                    <ChartCard
                        {...OverviewMetricConfig[
                            CampaignsTotalsMetricNames.impressions
                        ]}
                    >
                        <LineChart
                            isLoading={isLoading}
                            data={formatTimeSeriesData(
                                campaignPerformanceSeries?.impressionsSeries,
                                IMPRESSIONS_LABEL,
                                ReportingGranularity.Day
                            )}
                            _displayLegacyTooltip
                        />
                    </ChartCard>
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(6)}>
                    <ChartCard
                        {...OverviewMetricConfig[
                            CampaignsTotalsMetricNames.campaignSalesCount
                        ]}
                    >
                        <LineChart
                            isLoading={isLoading}
                            data={formatTimeSeriesData(
                                campaignPerformanceSeries?.ordersCountSeries,
                                ORDER_COUNT_LABEL,
                                ReportingGranularity.Day
                            )}
                            _displayLegacyTooltip
                        />
                    </ChartCard>
                </DashboardGridCell>
            </DashboardSection>
        </>
    )
}

export default CampaignPerformanceCharts
