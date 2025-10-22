import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
    createJourney,
    CreateJourneyApiDTO,
    JourneyConfigurationApiDTO,
} from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers'
import { aiJourneyKeys } from 'AIJourney/queries/utils'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const createNewJourney = async (
    params: CreateJourneyApiDTO,
    accessToken: string,
    journeyConfigs: JourneyConfigurationApiDTO,
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
    const queryClient = useQueryClient()

    return useMutation({
        onSuccess: async (_, { params: { store_integration_id } }) => {
            await queryClient.invalidateQueries({
                queryKey: aiJourneyKeys.journeys(store_integration_id),
            })
        },
        mutationFn: async ({
            params,
            journeyConfigs,
        }: {
            params: Omit<
                CreateJourneyApiDTO,
                'type' | 'store_type' | 'account_id'
            >
            journeyConfigs: JourneyConfigurationApiDTO
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
    })
}
