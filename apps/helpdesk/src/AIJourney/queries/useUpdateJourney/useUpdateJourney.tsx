import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
    JourneyConfigurationApiDTO,
    patchJourney,
    UpdateJourneyApiDTO,
} from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers'
import { aiJourneyKeys } from 'AIJourney/queries/utils'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const updateJourney = async (
    journeyId: string,
    params: UpdateJourneyApiDTO,
    accessToken: string,
    journeyConfigs?: JourneyConfigurationApiDTO,
) => {
    const requestBody = {
        ...params,
        ...(journeyConfigs && { configuration: journeyConfigs }), // Only include configuration if journeyConfigs is defined
    }

    return patchJourney(journeyId, requestBody, {
        baseURL: getGorgiasRevenueAddonApiBaseUrl(),
        headers: { Authorization: accessToken },
    })
}

export const useUpdateJourney = () => {
    const accessToken = useAccessToken()
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
            if (!accessToken) {
                throw new Error('Unauthorized: Access token is required')
            }

            return updateJourney(journeyId, params, accessToken, journeyConfigs)
        },
    })
}
