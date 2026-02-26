import type React from 'react'
import { createContext, useContext, useMemo } from 'react'

import { matchPath, useLocation, useParams } from 'react-router-dom'

import type {
    JourneyApiDTO,
    JourneyDetailApiDTO,
} from '@gorgias/convert-client'
import { JourneyTypeEnum } from '@gorgias/convert-client'
import type { Integration } from '@gorgias/helpdesk-types'

import { JOURNEY_TYPES } from 'AIJourney/constants'
import { useJourneyData } from 'AIJourney/queries/useJourneyData/useJourneyData'
import { useJourneys } from 'AIJourney/queries/useJourneys/useJourneys'
import useAppSelector from 'hooks/useAppSelector'
import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'
import type { StoreConfiguration } from 'models/aiAgent/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

type JourneyContextType = {
    journeys: JourneyApiDTO[] | undefined
    campaigns: JourneyApiDTO[] | undefined
    journeyData: JourneyDetailApiDTO | undefined
    currentIntegration: Integration | undefined
    currency: string
    shopName: string
    isLoading: boolean
    isLoadingJourneys: boolean
    isLoadingJourneyData: boolean
    journeyType: JOURNEY_TYPES
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
            matchPath<{ journeyType: string; journeyId?: string }>(pathname, {
                path: `/app/ai-journey/:shopName/:journeyType/:step/:journeyId?`,
            }),
        [pathname],
    )

    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)
    const currentIntegration = useMemo(() => {
        return storeIntegrations.find(
            (store) => getShopNameFromStoreIntegration(store) === shopName,
        )
    }, [storeIntegrations, shopName])

    const currency = useMemo(
        () => currentIntegration?.meta.currency as string,
        [currentIntegration],
    )

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
        if (
            journeyTypeParam &&
            availableJourneys.includes(journeyTypeParam as JOURNEY_TYPES)
        )
            return journeyTypeParam as JOURNEY_TYPES

        return JOURNEY_TYPES.CART_ABANDONMENT
    }, [match?.params.journeyType])

    const journeyId = useMemo(() => {
        return match?.params.journeyId
    }, [match?.params.journeyId])

    const { data: aggregatedJourneys, isLoading: isLoadingJourneys } =
        useJourneys(integrationId, [], {
            enabled: !!integrationId,
        })

    // TODO: rename it to 'flows' and rename the above declaration from 'aggregatedJourneys' to 'journeys'
    const journeys = aggregatedJourneys?.filter(
        (journey) => journey.type !== JourneyTypeEnum.Campaign,
    )

    const campaigns = aggregatedJourneys?.filter(
        (journey) => journey.type === JourneyTypeEnum.Campaign,
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
        useJourneyData(journeyId, {
            enabled: !!integrationId && !!journeyId,
        })

    const isLoading =
        isLoadingJourneys ||
        isStoreConfigurationLoading ||
        (!!journeyId && isLoadingJourneyData)

    const contextValue = useMemo(
        () => ({
            journeys,
            journeyData,
            campaigns,
            currency,
            currentIntegration,
            shopName,
            isLoading,
            isLoadingJourneys,
            isLoadingJourneyData,
            journeyType,
            storeConfiguration,
        }),
        [
            journeys,
            journeyData,
            campaigns,
            currency,
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
