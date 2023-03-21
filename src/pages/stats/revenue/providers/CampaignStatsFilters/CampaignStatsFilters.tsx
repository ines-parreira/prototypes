import React, {ReactNode, useCallback, useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'

import {mergeStatsFilters} from 'state/stats/actions'
import {
    getStatsFilters,
    getStoreIntegrationsStatsFilter,
} from 'state/stats/selectors'

import {Value} from 'pages/common/forms/SelectField/types'

import {useShopifyIntegrations} from '../../hooks/useShopifyIntegrations'
import {useGetCampaignsForStore} from '../../hooks/useGetCampaignsForStore'

import {FiltersContext} from './context'

type Props = {
    children: ReactNode
}

export const CampaignStatsFilters = ({children}: Props) => {
    const dispatch = useAppDispatch()

    const storeStatsFilter = useAppSelector(getStoreIntegrationsStatsFilter)
    const statsFilters = useAppSelector(getStatsFilters)

    const integrations = useShopifyIntegrations()

    const selectedIntegrations = useMemo(() => {
        const fallback = integrations?.[0]?.id ? [integrations[0].id] : []
        return storeStatsFilter.length ? storeStatsFilter : fallback
    }, [storeStatsFilter, integrations])

    const campaigns = useGetCampaignsForStore(selectedIntegrations)

    const selectedCampaigns = useMemo(() => {
        return statsFilters.campaigns ?? []
    }, [statsFilters])

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
