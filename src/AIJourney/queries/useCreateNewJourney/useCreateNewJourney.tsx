import { useMutation } from '@tanstack/react-query'

import {
    CartAbandonedJourneyConfigurationApiDTO,
    createJourney,
    CreateJourneyApiDTO,
} from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const createNewJourney = async (
    params: CreateJourneyApiDTO,
    accessToken: string,
    journeyConfigs: CartAbandonedJourneyConfigurationApiDTO,
) => {
    return createJourney(
        {
            ...params,
            configuration: journeyConfigs,
        },
        {
            baseURL: getGorgiasRevenueAddonApiBaseUrl(),
            headers: { Authorization: accessToken },
        },
    ).then((res) => res.data)
}

export const useCreateNewJourney = () => {
    const accessToken = useAccessToken()
    return useMutation(
        ({
            params,
            journeyConfigs,
        }: {
            params: Omit<
                CreateJourneyApiDTO,
                'type' | 'store_type' | 'account_id'
            >
            journeyConfigs: CartAbandonedJourneyConfigurationApiDTO
        }) => {
            if (!accessToken) {
                throw new Error('Access token is required to create a journey')
            }
            return createNewJourney(
                { ...params, type: 'cart_abandoned', store_type: 'shopify' },
                accessToken,
                journeyConfigs,
            )
        },
    )
}
