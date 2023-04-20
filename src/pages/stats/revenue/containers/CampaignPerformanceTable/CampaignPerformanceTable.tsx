import React, {useEffect, useMemo, useState} from 'react'
import _get from 'lodash/get'
import DashboardGridCell from 'pages/stats/DashboardGridCell'

import {useGetTableStat} from 'pages/stats/revenue/hooks/stats/useGetTableStat'

import {useCampaignStatsFilters} from '../../hooks/useCampaignStatsFilters'
import {useGetChatForStore} from '../../hooks/useGetChatForStore'
import {useGetCurrencyForStore} from '../../hooks/useGetCurrencyForStore'

import {CampaignTableStats} from '../../components/CampaignTableStats'

import {ITEMS_PER_PAGE} from '../../constants/campaignPerformanceTable'

import {CampaignTableContentCell} from '../../types/CampaignTableContentCell'
import {useGetNamespacedShopNameForStore} from '../../hooks/useGetNamespacedShopNameForStore'

export const CampaignPerformanceTable = () => {
    const {campaigns, selectedIntegrations, selectedCampaigns, selectedPeriod} =
        useCampaignStatsFilters()

    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)

    const currency = useGetCurrencyForStore(selectedIntegrations)
    const chatIntegration = useGetChatForStore(selectedIntegrations[0])

    const [offset, setOffset] = useState(0)

    const campaignIds = useMemo(() => {
        return selectedCampaigns.length > 0
            ? selectedCampaigns
            : campaigns.map((campaign) => campaign.id)
    }, [campaigns, selectedCampaigns])

    const {isFetching, data} = useGetTableStat(
        namespacedShopName,
        campaignIds,
        selectedPeriod.start_datetime,
        selectedPeriod.end_datetime
    )

    const rows = useMemo<CampaignTableContentCell[]>(() => {
        const selectedCampaigns = campaigns.filter((campaign) =>
            campaignIds.includes(campaign.id)
        )

        return selectedCampaigns.map((campaign) => ({
            campaign,
            chatIntegration: chatIntegration,
            currency,
            metrics: _get(data, campaign.id, {}),
        }))
    }, [campaigns, campaignIds, chatIntegration, currency, data])

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
