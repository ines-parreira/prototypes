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

    const integrations = useShopifyIntegrations()

    const selectedIntegrations = useMemo(() => {
        if (storeIntegrationId) return [storeIntegrationId]

        const fallback = integrations?.[0]?.id ? [integrations[0].id] : []
        return storeStatsFilter.length ? storeStatsFilter : fallback
    }, [storeIntegrationId, integrations, storeStatsFilter])

    const campaigns = useGetCampaignsForStore(
        selectedIntegrations,
        chatIntegration.getIn(['meta', 'app_id'])
    )

    const selectedCampaigns = useMemo(() => {
        return statsFilters.campaigns ?? []
    }, [statsFilters])

    useEffect(() => {
        // Reset campaigns when chat integration is changed
        if (chatIntegration) {
            dispatch(
                mergeStatsFilters({
                    campaigns: [],
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

    return (
        <FiltersContext.Provider
            value={{
                campaigns,
                integrations,
                isStorePreSelected: !!storeIntegrationId,
                selectedCampaigns: selectedCampaigns,
                selectedIntegrations,
                selectedPeriod,
                onChangeCampaigns: handleChangeCampaigns,
                onChangeIntegration: handleChangeIntegration,
            }}
        >
            {children}
        </FiltersContext.Provider>
    )
}
