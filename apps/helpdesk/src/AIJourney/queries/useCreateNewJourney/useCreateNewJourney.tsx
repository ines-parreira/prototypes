import { useMutation, useQueryClient } from '@tanstack/react-query'

import type {
    CreateJourneyApiDTO,
    JourneyConfigurationApiDTO,
} from '@gorgias/convert-client'
import { createJourney } from '@gorgias/convert-client'

import { aiJourneyKeys } from 'AIJourney/queries/utils'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const createNewJourney = async (
    params: CreateJourneyApiDTO,
    journeyConfigs: JourneyConfigurationApiDTO,
) => {
    return createJourney(
        {
            ...params,
            configuration: journeyConfigs,
        },
        {
            baseURL: getGorgiasRevenueAddonApiBaseUrl(),
        },
    ).then((res) => res.data)
}

export const useCreateNewJourney = () => {
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
            params: Omit<CreateJourneyApiDTO, 'store_type' | 'account_id'>
            journeyConfigs: JourneyConfigurationApiDTO
        }) => {
            return createNewJourney(
                { ...params, store_type: 'shopify' },
                journeyConfigs,
            )
        },
    })
}
