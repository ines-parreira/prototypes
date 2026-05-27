import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteJourney } from '@gorgias/convert-client'

import { flowsListKeys } from 'AIJourney/queries/useCustomFlows/useCustomFlows'
import { aiJourneyKeys } from 'AIJourney/queries/utils'
import { workflowsConfigurationDefinitionKeys } from 'models/workflows/queries'
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
        mutationFn: async ({ id }: { id: string }) => {
            return deleteJourneyQuery(id)
        },
    })
}
