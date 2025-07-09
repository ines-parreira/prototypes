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
    journeyConfigs: CartAbandonedJourneyConfigurationApiDTO,
) => {
    return patchJourney(
        journeyId,
        {
            ...params,
            configuration: journeyConfigs,
        },
        {
            baseURL: getGorgiasRevenueAddonApiBaseUrl(),
            headers: { Authorization: accessToken },
        },
    )
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
            journeyConfigs: CartAbandonedJourneyConfigurationApiDTO
        }) => {
            if (!accessToken) {
                throw new Error('Unauthorized: Access token is required')
            }

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
        },
    })
}
