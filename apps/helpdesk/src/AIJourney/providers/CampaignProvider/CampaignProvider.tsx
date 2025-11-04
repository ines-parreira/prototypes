import React, { createContext, useContext, useMemo } from 'react'

import { useParams } from 'react-router-dom'

import { JourneyApiDTO, JourneyTypeEnum } from '@gorgias/convert-client'
import { Integration } from '@gorgias/helpdesk-types'

import { useJourneys } from 'AIJourney/queries/useJourneys/useJourneys'
import useAppSelector from 'hooks/useAppSelector'
import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'
import { StoreConfiguration } from 'models/aiAgent/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { useIntegrations } from '../IntegrationsProvider/IntegrationsProvider'

type CampaignContextType = {
    campaigns: JourneyApiDTO[] | undefined
    currentIntegration: Integration | undefined
    shopName: string
    isLoading: boolean
    isLoadingCampaigns: boolean
    storeConfiguration: StoreConfiguration | undefined
}

const CampaignContext = createContext<CampaignContextType | undefined>(
    undefined,
)

type JourneyProviderProps = {
    children: React.ReactNode
}

export const CampaignProvider = ({ children }: JourneyProviderProps) => {
    const { shopName } = useParams<{ shopName: string }>()

    const { currentIntegration, isLoading: isLoadingIntegrations } =
        useIntegrations(shopName)

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = useMemo(
        () => currentAccount.get('domain'),
        [currentAccount],
    )
    const integrationId = useMemo(
        () => currentIntegration?.id,
        [currentIntegration?.id],
    )

    const { data: campaigns, isLoading: isLoadingCampaigns } = useJourneys(
        integrationId,
        [JourneyTypeEnum.Campaign],
        {
            enabled: !!integrationId,
        },
    )

    const { isLoading: isStoreConfigurationLoading, data: storeConfiguration } =
        useGetStoresConfigurationForAccount(
            {
                accountDomain,
            },
            {
                retry: 1,
                refetchOnWindowFocus: false,
                enabled: !shopName,
                staleTime: Infinity,
                cacheTime: Infinity,
                select: (storeConfigurationData) =>
                    storeConfigurationData?.storeConfigurations.find(
                        (storeConfig) => storeConfig.storeName === shopName,
                    ),
            },
        )

    const isLoading =
        isLoadingIntegrations ||
        isStoreConfigurationLoading ||
        isLoadingCampaigns

    const contextValue = useMemo(
        () => ({
            campaigns,
            currentIntegration,
            shopName,
            isLoading,
            isLoadingCampaigns,
            storeConfiguration,
        }),
        [
            campaigns,
            currentIntegration,
            shopName,
            isLoading,
            isLoadingCampaigns,
            storeConfiguration,
        ],
    )

    return (
        <CampaignContext.Provider value={contextValue}>
            {children}
        </CampaignContext.Provider>
    )
}

export const useCampaignContext = () => {
    const ctx = useContext(CampaignContext)
    if (!ctx) {
        throw new Error(
            'useCampaignContext must be used within CampaignProvider',
        )
    }
    return ctx
}
