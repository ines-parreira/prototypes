import { useMutation, useQueryClient } from '@tanstack/react-query'

import type {
    CampaignJourneyConfigurationApiDTO,
    CreateJourneyBody,
    JourneyConfigurationApiDTO,
    PostPurchaseJourneyConfigurationApiDTO,
    WelcomeFlowConfigurationApiDTO,
    WinbackJourneyConfigurationApiDTO,
} from '@gorgias/convert-client'
import { createJourney } from '@gorgias/convert-client'

import { aiJourneyKeys } from 'AIJourney/queries/utils'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const createNewJourney = async (
    params: CreateJourneyBody,
    journeyConfigs:
        | JourneyConfigurationApiDTO
        | WelcomeFlowConfigurationApiDTO
        | WinbackJourneyConfigurationApiDTO
        | PostPurchaseJourneyConfigurationApiDTO,
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
            params: Omit<CreateJourneyBody, 'store_type' | 'account_id'>
            journeyConfigs:
                | JourneyConfigurationApiDTO
                | WelcomeFlowConfigurationApiDTO
                | WinbackJourneyConfigurationApiDTO
                | PostPurchaseJourneyConfigurationApiDTO
                | CampaignJourneyConfigurationApiDTO
        }) => {
            return createNewJourney(
                { ...params, store_type: 'shopify' },
                journeyConfigs,
            )
        },
    })
}
