import { useMutation, useQueryClient } from '@tanstack/react-query'

import type {
    JourneyConfigurationApiDTO,
    PatchJourneyBody,
    WinbackJourneyConfigurationApiDTO,
} from '@gorgias/convert-client'
import { patchJourney } from '@gorgias/convert-client'

import { aiJourneyKeys } from 'AIJourney/queries/utils'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const updateJourney = async (
    journeyId: string,
    params: PatchJourneyBody,
    journeyConfigs?:
        | JourneyConfigurationApiDTO
        | WinbackJourneyConfigurationApiDTO,
) => {
    const requestBody = {
        ...params,
        ...(journeyConfigs && { configuration: journeyConfigs }), // Only include configuration if journeyConfigs is defined
    }

    return patchJourney(journeyId, requestBody, {
        baseURL: getGorgiasRevenueAddonApiBaseUrl(),
    })
}

export const useUpdateJourney = () => {
    const queryClient = useQueryClient()

    return useMutation({
        onSuccess: async (_, { journeyId }) => {
            await queryClient.invalidateQueries({
                queryKey: aiJourneyKeys.journeyConfiguration(journeyId),
            })
        },
        mutationFn: async ({
            journeyId,
            params,
            journeyConfigs,
        }: {
            journeyId: string
            params: Omit<PatchJourneyBody, 'type' | 'store_type' | 'account_id'>
            journeyConfigs?:
                | JourneyConfigurationApiDTO
                | WinbackJourneyConfigurationApiDTO
        }) => {
            return updateJourney(journeyId, params, journeyConfigs)
        },
    })
}
