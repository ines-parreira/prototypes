import React, { useEffect, useMemo, useState } from 'react'

import _get from 'lodash/get'
import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {
    GorgiasChatIntegration,
    IntegrationType,
} from 'models/integration/types'
import { CONVERT_ROUTE_PARAM_NAME } from 'pages/convert/common/constants'
import { useIsConvertPerformanceViewEnabled } from 'pages/convert/common/hooks/useIsConvertPerformanceViewEnabled'
import { ConvertRouteParams } from 'pages/convert/common/types'
import ChartCard from 'pages/stats/ChartCard'
import { SharedDimension } from 'pages/stats/convert/clients/constants'
import { CampaignPerformanceEditColumns } from 'pages/stats/convert/components/CampaignPerformanceEditColumns'
import { CampaignTableStats } from 'pages/stats/convert/components/CampaignTableStats'
import css from 'pages/stats/convert/components/CampaignTableStats/CampaignTableStats.less'
import { CAMPAIGN_TABLE_COLUMN_TITLES } from 'pages/stats/convert/components/CampaignTableStats/constants'
import { ITEMS_PER_PAGE } from 'pages/stats/convert/constants/campaignPerformanceTable'
import { DEFAULT_TIMEZONE } from 'pages/stats/convert/constants/components'
import { useGetTableStat } from 'pages/stats/convert/hooks/stats/useGetTableStat'
import { useCampaignStatsFilters } from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import { useGetChatForStore } from 'pages/stats/convert/hooks/useGetChatForStore'
import { useGetCurrencyForStore } from 'pages/stats/convert/hooks/useGetCurrencyForStore'
import { useGetNamespacedShopNameForStore } from 'pages/stats/convert/hooks/useGetNamespacedShopNameForStore'
import { CampaignTableContentCell } from 'pages/stats/convert/types/CampaignTableContentCell'
import { CampaignTableKeys } from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { getTimezone } from 'state/currentUser/selectors'
import { getIntegrationByIdAndType } from 'state/integrations/selectors'
import { ConvertMetric } from 'state/ui/stats/types'

export const CAMPAIGNS_PERFORMANCE_TABLE_TITLE = 'Campaigns performance'

export const CampaignPerformanceTable = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const isConvertPerformanceViewEnabled = useIsConvertPerformanceViewEnabled()
    const {
        campaigns,
        selectedIntegrations,
        selectedCampaignIds,
        selectedCampaignsOperator,
        selectedPeriod,
        channelConnectionExternalIds,
    } = useCampaignStatsFilters()

    const { [CONVERT_ROUTE_PARAM_NAME]: chatIntegrationId } =
        useParams<ConvertRouteParams>()

    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)

    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE,
    )

    const currency = useGetCurrencyForStore(selectedIntegrations)

    const storeChatIntegration = useGetChatForStore(selectedIntegrations[0])
    const routeChatIntegration = useAppSelector(
        getIntegrationByIdAndType<GorgiasChatIntegration>(
            parseInt(chatIntegrationId),
            IntegrationType.GorgiasChat,
        ),
    )
    const chatIntegration = useMemo(
        () => routeChatIntegration || storeChatIntegration,
        [routeChatIntegration, storeChatIntegration],
    )

    const [offset, setOffset] = useState(0)

    const campaignIds = useMemo(() => {
        // no filter is selected, use all campaigns
        if (selectedCampaignIds !== null && !selectedCampaignIds.length) {
            return campaigns.map((campaign) => campaign.id)
        }
        return selectedCampaignIds
    }, [campaigns, selectedCampaignIds])

    const hasVariants = useMemo(() => {
        if (!campaignIds) return false

        return campaigns.some((campaign) =>
            Boolean(campaignIds.includes(campaign.id) && campaign.variants),
        )
    }, [campaignIds, campaigns])

    const { isFetching, isError, data } = useGetTableStat({
        groupDimension: SharedDimension.campaignId,
        namespacedShopName,
        campaignIds,
        campaignsOperator: selectedCampaignsOperator,
        startDate: selectedPeriod.start_datetime,
        endDate: selectedPeriod.end_datetime,
        timezone: userTimezone,
    })

    const {
        isFetching: isVariantFetching,
        isError: isVariantError,
        data: variantData,
    } = useGetTableStat({
        groupDimension: SharedDimension.abVariant,
        namespacedShopName,
        campaignIds,
        campaignsOperator: selectedCampaignsOperator,
        startDate: selectedPeriod.start_datetime,
        endDate: selectedPeriod.end_datetime,
        timezone: userTimezone,
        enabled: hasVariants,
    })

    const rows = useMemo<CampaignTableContentCell[]>(() => {
        const selectedCampaigns = campaigns.filter((campaign) =>
            campaignIds?.includes(campaign.id),
        )

        return selectedCampaigns.map((campaign) => {
            const variantIds = (campaign.variants || [])
                .map((variant) => variant.id)
                .concat(campaign.id)

            return {
                campaign,
                chatIntegration: chatIntegration,
                currency,
                metrics: _get(data, campaign.id, {}),
                variantMetrics: variantIds.reduce(
                    (o, variantId) => ({
                        ...o,
                        [variantId]: _get(variantData, variantId, {}),
                    }),
                    {},
                ),
                drillDownMetricData: {
                    [ConvertMetric.CampaignSalesCount]: {
                        title: CAMPAIGN_TABLE_COLUMN_TITLES[
                            CampaignTableKeys.Conversions
                        ],
                        metricName: ConvertMetric.CampaignSalesCount,
                        campaignsOperator: selectedCampaignsOperator,
                        shopName: namespacedShopName,
                        selectedCampaignIds: [campaign.id],
                        context: {
                            channel_connection_external_ids:
                                channelConnectionExternalIds,
                        },
                    },
                },
            }
        })
    }, [
        campaigns,
        campaignIds,
        chatIntegration,
        currency,
        data,
        namespacedShopName,
        channelConnectionExternalIds,
        variantData,
        selectedCampaignsOperator,
    ])
    const handleClickNextPage = () => {
        let nextValue = offset + ITEMS_PER_PAGE
        if (nextValue >= campaigns.length) {
            nextValue = campaigns.length - 1
        }
        setOffset(nextValue)
    }
    const handleClickPrevPage = () => {
        let nextValue = offset - ITEMS_PER_PAGE
        if (nextValue < 0) {
            nextValue = 0
        }
        setOffset(nextValue)
    }

    useEffect(() => {
        setOffset(0)
    }, [selectedIntegrations, campaigns])

    return (
        <ChartCard
            title={CAMPAIGNS_PERFORMANCE_TABLE_TITLE}
            chartId={chartId}
            titleExtra={
                isConvertPerformanceViewEnabled && (
                    <div className={css.editColumns}>
                        <CampaignPerformanceEditColumns />
                    </div>
                )
            }
            dashboard={dashboard}
        >
            <CampaignTableStats
                chatIntegrationId={chatIntegration?.id}
                isLoading={
                    isFetching || isVariantFetching || isError || isVariantError
                }
                rows={rows}
                offset={offset}
                onClickNextPage={handleClickNextPage}
                onClickPrevPage={handleClickPrevPage}
            />
        </ChartCard>
    )
}
