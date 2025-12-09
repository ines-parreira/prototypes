import { useMutation, useQueryClient } from '@tanstack/react-query'

import type {
    JourneyConfigurationApiDTO,
    UpdateJourneyApiDTO,
} from '@gorgias/convert-client'
import { patchJourney } from '@gorgias/convert-client'

import { aiJourneyKeys } from 'AIJourney/queries/utils'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const updateJourney = async (
    journeyId: string,
    params: UpdateJourneyApiDTO,
    journeyConfigs?: JourneyConfigurationApiDTO,
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
            params: Omit<
                UpdateJourneyApiDTO,
                'type' | 'store_type' | 'account_id'
            >
            journeyConfigs?: JourneyConfigurationApiDTO
        }) => {
            return updateJourney(journeyId, params, journeyConfigs)
        },
    })
}
