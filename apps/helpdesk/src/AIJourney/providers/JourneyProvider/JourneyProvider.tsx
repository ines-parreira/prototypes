import React, { createContext, useContext, useMemo } from 'react'

import { useParams } from 'react-router-dom'

import { JourneyApiDTO, JourneyDetailApiDTO } from '@gorgias/convert-client'
import { Integration } from '@gorgias/helpdesk-types'

import { useJourneyData } from 'AIJourney/queries/useJourneyData/useJourneyData'
import { useJourneys } from 'AIJourney/queries/useJourneys/useJourneys'
import useAppSelector from 'hooks/useAppSelector'
import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'
import { StoreConfiguration } from 'models/aiAgent/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { useIntegrations } from '../IntegrationsProvider/IntegrationsProvider'

type JourneyContextType = {
    journey: JourneyApiDTO | undefined
    journeyData: JourneyDetailApiDTO | undefined
    currentIntegration: Integration | undefined
    shopName: string
    isLoading: boolean
    journeyType: string
    storeConfiguration: StoreConfiguration | undefined
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined)

type JourneyProviderProps = {
    children: React.ReactNode
    journeyType?: string
}

export const JourneyProvider = ({
    children,
    journeyType = 'cart_abandoned',
}: JourneyProviderProps) => {
    const { shopName } = useParams<{ shopName: string }>()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { currentIntegration, isLoading: isLoadingIntegrations } =
        useIntegrations(shopName)

    const integrationId = currentIntegration?.id

    const { data: journey, isLoading: isLoadingJourneys } = useJourneys(
        integrationId,
        {
            enabled: !!integrationId,
            select: (journeys) => journeys.find((j) => j.type === journeyType),
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

    const { data: journeyData, isLoading: isLoadingJourneyConfiguration } =
        useJourneyData(journey?.id, {
            enabled: !!integrationId && !!journey?.id,
        })

    const isLoading =
        isLoadingIntegrations ||
        isLoadingJourneys ||
        isStoreConfigurationLoading ||
        (!!journey?.id && isLoadingJourneyConfiguration)

    const contextValue = useMemo(
        () => ({
            journey,
            journeyData,
            currentIntegration,
            shopName,
            isLoading,
            journeyType,
            storeConfiguration,
        }),
        [
            journey,
            journeyData,
            currentIntegration,
            shopName,
            isLoading,
            journeyType,
            storeConfiguration,
        ],
    )

    return (
        <JourneyContext.Provider value={contextValue}>
            {children}
        </JourneyContext.Provider>
    )
}

export const useJourneyContext = () => {
    const ctx = useContext(JourneyContext)
    if (!ctx) {
        throw new Error('useJourneyContext must be used within JourneyProvider')
    }
    return ctx
}
