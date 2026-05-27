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

import { flowsListKeys } from 'AIJourney/queries/useCustomFlows/useCustomFlows'
import { aiJourneyKeys } from 'AIJourney/queries/utils'
import { workflowsConfigurationDefinitionKeys } from 'models/workflows/queries'
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
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: aiJourneyKeys.all(),
                }),
                queryClient.invalidateQueries({
                    queryKey: workflowsConfigurationDefinitionKeys.all(),
                }),
                queryClient.invalidateQueries({
                    queryKey: flowsListKeys.all(),
                }),
            ])
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
            // Cast required: Omit on a discriminated union doesn't
            // distribute, so the spread reconstruction loses variant
            // identity and TS demands `name` from CreateCustomJourneyApiDTO
            // even on non-custom variants. Runtime shape is correct.
            return createNewJourney(
                { ...params, store_type: 'shopify' } as CreateJourneyBody,
                journeyConfigs,
            )
        },
    })
}
