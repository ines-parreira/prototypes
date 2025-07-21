import { useMutation } from '@tanstack/react-query'

import {
    CartAbandonedJourneyConfigurationApiDTO,
    patchJourney,
    UpdateJourneyApiDTO,
} from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const updateJourney = async (
    journeyId: string,
    params: UpdateJourneyApiDTO,
    accessToken: string,
    journeyConfigs?: CartAbandonedJourneyConfigurationApiDTO,
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

    return useMutation({
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
            journeyConfigs?: CartAbandonedJourneyConfigurationApiDTO
        }) => {
            if (!accessToken) {
                throw new Error('Unauthorized: Access token is required')
            }

            if (journeyConfigs) {
                return updateJourney(
                    journeyId,
                    {
                        ...params,
                    },
                    accessToken,
                    {
                        ...journeyConfigs,
                    },
                )
            }
            return updateJourney(
                journeyId,
                {
                    ...params,
                },
                accessToken,
            )
        },
    })
}
