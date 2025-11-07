import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteJourney } from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers'
import { aiJourneyKeys } from 'AIJourney/queries/utils'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const deleteJourneyQuery = async (id: string, accessToken: string) => {
    return deleteJourney(id, {
        baseURL: getGorgiasRevenueAddonApiBaseUrl(),
        headers: { Authorization: accessToken },
    }).then((res) => res.data)
}

export const useDeleteJourney = () => {
    const accessToken = useAccessToken()
    const queryClient = useQueryClient()

    return useMutation({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: aiJourneyKeys.all(),
            })
        },
        mutationFn: async ({ id }: { id: string }) => {
            if (!accessToken) {
                throw new Error('Access token is required to delete a journey')
            }
            return deleteJourneyQuery(id, accessToken)
        },
    })
}
