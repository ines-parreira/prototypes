import React, {useEffect, useMemo, useState} from 'react'
import _get from 'lodash/get'
import {useParams} from 'react-router-dom'
import DashboardGridCell from 'pages/stats/DashboardGridCell'

import {useGetTableStat} from 'pages/stats/convert/hooks/stats/useGetTableStat'

import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {DEFAULT_TIMEZONE} from 'pages/stats/convert/constants/components'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'
import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'
import {getIntegrationByIdAndType} from 'state/integrations/selectors'
import {ConvertMetric} from 'state/ui/stats/types'
import {CAMPAIGN_TABLE_COLUMN_TITLES} from 'pages/stats/convert/components/CampaignTableStats/constants'
import {CampaignTableKeys} from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'
import {useCampaignStatsFilters} from '../../hooks/useCampaignStatsFilters'
import {useGetChatForStore} from '../../hooks/useGetChatForStore'
import {useGetCurrencyForStore} from '../../hooks/useGetCurrencyForStore'

import {CampaignTableStats} from '../../components/CampaignTableStats'

import {ITEMS_PER_PAGE} from '../../constants/campaignPerformanceTable'

import {CampaignTableContentCell} from '../../types/CampaignTableContentCell'
import {useGetNamespacedShopNameForStore} from '../../hooks/useGetNamespacedShopNameForStore'

export const CampaignPerformanceTable = () => {
    const {
        campaigns,
        selectedIntegrations,
        selectedCampaignIds,
        selectedPeriod,
        channelConnectionExternalIds,
    } = useCampaignStatsFilters()

    const {[CONVERT_ROUTE_PARAM_NAME]: chatIntegrationId} =
        useParams<ConvertRouteParams>()

    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)

    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )

    const currency = useGetCurrencyForStore(selectedIntegrations)

    const storeChatIntegration = useGetChatForStore(selectedIntegrations[0])
    const routeChatIntegration = useAppSelector(
        getIntegrationByIdAndType<GorgiasChatIntegration>(
            parseInt(chatIntegrationId),
            IntegrationType.GorgiasChat
        )
    )
    const chatIntegration = useMemo(
        () => routeChatIntegration || storeChatIntegration,
        [routeChatIntegration, storeChatIntegration]
    )

    const [offset, setOffset] = useState(0)

    const campaignIds = useMemo(() => {
        // no filter is selected, use all campaigns
        if (selectedCampaignIds !== null && !selectedCampaignIds.length) {
            return campaigns.map((campaign) => campaign.id)
        }
        return selectedCampaignIds
    }, [campaigns, selectedCampaignIds])

    const {isFetching, data} = useGetTableStat(
        namespacedShopName,
        campaignIds,
        selectedPeriod.start_datetime,
        selectedPeriod.end_datetime,
        userTimezone
    )

    const rows = useMemo<CampaignTableContentCell[]>(() => {
        const selectedCampaigns = campaigns.filter((campaign) =>
            campaignIds?.includes(campaign.id)
        )

        return selectedCampaigns.map((campaign) => ({
            campaign,
            chatIntegration: chatIntegration,
            currency,
            metrics: _get(data, campaign.id, {}),
            drillDownMetricData: {
                [ConvertMetric.CampaignSalesCount]: {
                    title: CAMPAIGN_TABLE_COLUMN_TITLES[
                        CampaignTableKeys.Conversions
                    ],
                    metricName: ConvertMetric.CampaignSalesCount,
                    shopName: namespacedShopName,
                    selectedCampaignIds: [campaign.id],
                    context: {
                        channel_connection_external_ids:
                            channelConnectionExternalIds,
                    },
                },
            },
        }))
    }, [
        campaigns,
        campaignIds,
        chatIntegration,
        currency,
        data,
        namespacedShopName,
        channelConnectionExternalIds,
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
        <DashboardGridCell size={12}>
            <CampaignTableStats
                chatIntegrationId={chatIntegration?.id}
                isLoading={isFetching}
                rows={rows}
                offset={offset}
                onClickNextPage={handleClickNextPage}
                onClickPrevPage={handleClickPrevPage}
            />
        </DashboardGridCell>
    )
}
