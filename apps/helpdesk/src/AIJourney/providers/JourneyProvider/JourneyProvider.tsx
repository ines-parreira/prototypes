import React, { createContext, useContext, useMemo } from 'react'

import { useParams } from 'react-router-dom'

import {
    JourneyApiDTO,
    JourneyDetailApiDTO,
    JourneyTypeEnum,
} from '@gorgias/convert-client'
import { Integration } from '@gorgias/helpdesk-types'

import { useJourneyData } from 'AIJourney/queries/useJourneyData/useJourneyData'
import { useJourneys } from 'AIJourney/queries/useJourneys/useJourneys'
import useAppSelector from 'hooks/useAppSelector'
import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'
import { StoreConfiguration } from 'models/aiAgent/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { useIntegrations } from '../IntegrationsProvider/IntegrationsProvider'

type JourneyContextType = {
    journeys: JourneyApiDTO[] | undefined
    currentJourney: JourneyApiDTO | undefined
    journeyData: JourneyDetailApiDTO | undefined
    currentIntegration: Integration | undefined
    shopName: string
    isLoading: boolean
    isLoadingJourneys: boolean
    journeyType: JourneyTypeEnum
    storeConfiguration: StoreConfiguration | undefined
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined)

type JourneyProviderProps = {
    children: React.ReactNode
    journeyType?: JourneyTypeEnum
}

export const JourneyProvider = ({
    children,
    journeyType = 'cart_abandoned',
}: JourneyProviderProps) => {
    const { shopName } = useParams<{ shopName: string }>()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = useMemo(
        () => currentAccount.get('domain'),
        [currentAccount],
    )

    const { currentIntegration, isLoading: isLoadingIntegrations } =
        useIntegrations(shopName)

    const integrationId = useMemo(
        () => currentIntegration?.id,
        [currentIntegration],
    )

    const { data: journeys, isLoading: isLoadingJourneys } = useJourneys(
        integrationId,
        {
            enabled: !!integrationId,
        },
    )

    const currentJourney = useMemo(
        () => journeys?.find((j) => j.type === journeyType?.replace('-', '_')),
        [journeys, journeyType],
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
        useJourneyData(currentJourney?.id, {
            enabled: currentJourney && !!integrationId && !!currentJourney?.id,
        })

    const isLoading =
        isLoadingIntegrations ||
        isLoadingJourneys ||
        isStoreConfigurationLoading ||
        (!!currentJourney?.id && isLoadingJourneyConfiguration)

    const contextValue = useMemo(
        () => ({
            currentJourney,
            journeys,
            journeyData,
            currentIntegration,
            shopName,
            isLoading,
            isLoadingJourneys,
            journeyType,
            storeConfiguration,
        }),
        [
            currentJourney,
            journeys,
            journeyData,
            currentIntegration,
            shopName,
            isLoading,
            isLoadingJourneys,
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
