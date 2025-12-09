import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteJourney } from '@gorgias/convert-client'

import { aiJourneyKeys } from 'AIJourney/queries/utils'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const deleteJourneyQuery = async (id: string) => {
    return deleteJourney(id, {
        baseURL: getGorgiasRevenueAddonApiBaseUrl(),
    }).then((res) => res.data)
}

export const useDeleteJourney = () => {
    const queryClient = useQueryClient()

    return useMutation({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: aiJourneyKeys.all(),
            })
        },
        mutationFn: async ({ id }: { id: string }) => {
            return deleteJourneyQuery(id)
        },
    })
}
