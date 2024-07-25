import React, {ReactNode, useCallback, useEffect, useMemo} from 'react'

import {useParams} from 'react-router-dom'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'

import {mergeStatsFilters} from 'state/stats/statsSlice'
import {
    getStatsFilters,
    getStoreIntegrationsStatsFilter,
} from 'state/stats/selectors'

import {Value} from 'pages/common/forms/SelectField/types'

import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'
import {getIntegrationById} from 'state/integrations/selectors'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import {useShopifyIntegrations} from '../../hooks/useShopifyIntegrations'
import {useGetCampaignsForStore} from '../../hooks/useGetCampaignsForStore'

import {FiltersContext} from './context'

type Props = {
    children: ReactNode
}

export const CampaignStatsFilters = ({children}: Props) => {
    const {[CONVERT_ROUTE_PARAM_NAME]: chatIntegrationId} =
        useParams<ConvertRouteParams>()

    const chatIntegration = useAppSelector(
        getIntegrationById(parseInt(chatIntegrationId))
    )
    const storeIntegrationId = useMemo(
        () =>
            parseInt(
                chatIntegration.getIn(['meta', 'shop_integration_id']) ?? 0
            ),
        [chatIntegration]
    )

    const dispatch = useAppDispatch()

    const storeStatsFilter = useAppSelector(getStoreIntegrationsStatsFilter)
    const statsFilters = useAppSelector(getStatsFilters)
    useCleanStatsFilters(statsFilters)

    const integrations = useShopifyIntegrations()

    const selectedIntegrations = useMemo(() => {
        if (storeIntegrationId) return [storeIntegrationId]

        const fallback = integrations?.[0]?.id ? [integrations[0].id] : []
        return storeStatsFilter.length ? storeStatsFilter : fallback
    }, [storeIntegrationId, integrations, storeStatsFilter])

    const {campaigns, channelConnectionExternalIds} = useGetCampaignsForStore(
        selectedIntegrations,
        chatIntegration.getIn(['meta', 'app_id']),
        true
    )

    const selectedCampaigns = useMemo(() => {
        return statsFilters.campaigns ?? []
    }, [statsFilters])

    const selectedCampaignStatuses = useMemo(() => {
        return statsFilters.campaignStatuses ?? []
    }, [statsFilters])

    const selectedCampaignIds = useMemo(() => {
        // no filter is selected, don't specify campaignIds
        if (!selectedCampaigns.length && !selectedCampaignStatuses.length) {
            return []
        }

        const campaignIds = campaigns
            .filter((campaign) => {
                const isMatchingStatus =
                    selectedCampaignStatuses.includes(campaign.status) ||
                    !selectedCampaignStatuses.length
                const isMatchingCampaignId =
                    selectedCampaigns.includes(campaign.id) ||
                    !selectedCampaigns.length

                return isMatchingStatus && isMatchingCampaignId
            })
            .map((campaign) => campaign.id)

        // if no campaign passed the selected filters, we shouldn't fetch any data
        return campaignIds.length ? campaignIds : null
    }, [campaigns, selectedCampaignStatuses, selectedCampaigns])

    useEffect(() => {
        // Reset campaigns when chat integration is changed
        if (chatIntegration) {
            dispatch(
                mergeStatsFilters({
                    campaigns: [],
                    campaignStatuses: [],
                })
            )
        }
    }, [chatIntegration, dispatch])

    const selectedPeriod = useMemo(() => {
        return statsFilters.period
    }, [statsFilters])

    const handleChangeIntegration = useCallback(
        (integrationIds: Value[]) => {
            dispatch(
                mergeStatsFilters({
                    integrations: integrationIds as number[],
                    campaigns: [],
                    campaignStatuses: [],
                })
            )
        },
        [dispatch]
    )

    const handleChangeCampaigns = useCallback(
        (campaignIds: Value[]) => {
            dispatch(
                mergeStatsFilters({
                    campaigns: campaignIds as string[],
                })
            )
        },
        [dispatch]
    )

    const handleChangeCampaignsByStatus = useCallback(
        (statuses: Value[]) => {
            dispatch(
                mergeStatsFilters({
                    campaignStatuses: statuses as string[],
                })
            )
        },
        [dispatch]
    )

    return (
        <FiltersContext.Provider
            value={{
                campaigns,
                integrations,
                isStorePreSelected: !!storeIntegrationId,
                selectedCampaignIds,
                selectedCampaigns: selectedCampaigns,
                selectedCampaignStatuses,
                selectedIntegrations,
                selectedPeriod,
                channelConnectionExternalIds:
                    channelConnectionExternalIds || [],
                onChangeCampaigns: handleChangeCampaigns,
                onChangeCampaignsByStatus: handleChangeCampaignsByStatus,
                onChangeIntegration: handleChangeIntegration,
            }}
        >
            {children}
        </FiltersContext.Provider>
    )
}
