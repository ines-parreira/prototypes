import React, {useEffect, useMemo, useState} from 'react'
import useAsyncFn from 'react-use/lib/useAsyncFn'

import DashboardSection from 'pages/stats/DashboardSection'
import DashboardGridCell from 'pages/stats/DashboardGridCell'

import {getCampaignsPerformance} from '../../services/CampaignPerformanceService'
import {CampaignsPerformanceDataset} from '../../services/types'

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
    const [metrics, setMetrics] = useState<CampaignsPerformanceDataset>({})

    const campaignIds = useMemo(() => {
        return selectedCampaigns.length > 0
            ? selectedCampaigns
            : campaigns.map((campaign) => campaign.id)
    }, [campaigns, selectedCampaigns])

    const [{loading}, fetchMetrics] = useAsyncFn(async () => {
        const data = await getCampaignsPerformance(
            selectedPeriod.start_datetime,
            selectedPeriod.end_datetime,
            campaignIds,
            namespacedShopName
        )
        setMetrics(data)
    }, [selectedIntegrations, campaignIds, selectedPeriod])

    const rows = useMemo<CampaignTableContentCell[]>(() => {
        const selectedCampaigns = campaigns.filter((campaign) =>
            campaignIds.includes(campaign.id)
        )

        return selectedCampaigns.map((campaign) => ({
            campaign,
            chatIntegration: chatIntegration,
            currency,
            metrics: metrics[campaign.id] ?? {},
        }))
    }, [campaigns, campaignIds, chatIntegration, currency, metrics])

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

    useEffect(() => void fetchMetrics(), [fetchMetrics])

    return (
        <DashboardSection title="">
            <DashboardGridCell size={12}>
                <CampaignTableStats
                    chatIntegrationId={chatIntegration?.id}
                    isLoading={loading}
                    rows={rows}
                    offset={offset}
                    onClickNextPage={handleClickNextPage}
                    onClickPrevPage={handleClickPrevPage}
                />
            </DashboardGridCell>
        </DashboardSection>
    )
}
