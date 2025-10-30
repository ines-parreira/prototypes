import React, { createContext, useContext, useMemo } from 'react'

import { matchPath, useLocation, useParams } from 'react-router-dom'

import {
    JourneyApiDTO,
    JourneyDetailApiDTO,
    JourneyTypeEnum,
} from '@gorgias/convert-client'
import { Integration } from '@gorgias/helpdesk-types'

import { JOURNEY_TYPES } from 'AIJourney/constants'
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
    isLoadingJourneyData: boolean
    journeyType: string
    storeConfiguration: StoreConfiguration | undefined
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined)

type JourneyProviderProps = {
    children: React.ReactNode
}

export const JourneyProvider = ({ children }: JourneyProviderProps) => {
    const { shopName } = useParams<{ shopName: string }>()
    const { pathname } = useLocation()

    const match = useMemo(
        () =>
            matchPath<{ journeyType: string }>(pathname, {
                path: `/app/ai-journey/:shopName/:journeyType`,
            }),
        [pathname],
    )

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
    const journeyType = useMemo(() => {
        const journeyTypeParam = match?.params.journeyType
        const availableJourneys = Object.values(JOURNEY_TYPES)
        if (journeyTypeParam && availableJourneys.includes(journeyTypeParam))
            return journeyTypeParam

        return JOURNEY_TYPES.CART_ABANDONMENT
    }, [match?.params.journeyType])

    const { data: journeys, isLoading: isLoadingJourneys } = useJourneys(
        integrationId,
        [JourneyTypeEnum.CartAbandoned, JourneyTypeEnum.SessionAbandoned],
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

    const { data: journeyData, isLoading: isLoadingJourneyData } =
        useJourneyData(currentJourney?.id, {
            enabled: currentJourney && !!integrationId && !!currentJourney?.id,
        })

    const isLoading =
        isLoadingIntegrations ||
        isLoadingJourneys ||
        isStoreConfigurationLoading ||
        (!!currentJourney?.id && isLoadingJourneyData)

    const contextValue = useMemo(
        () => ({
            currentJourney,
            journeys,
            journeyData,
            currentIntegration,
            shopName,
            isLoading,
            isLoadingJourneys,
            isLoadingJourneyData,
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
            isLoadingJourneyData,
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
