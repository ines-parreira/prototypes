import { useMutation, useQueryClient } from '@tanstack/react-query'

import { getGorgiasKsApiClient } from 'rest_api/knowledge_service_api/client'
import {
    Components,
    Paths,
} from 'rest_api/knowledge_service_api/client.generated'

import { feedbackDefinitionKeys } from './queries'
import { optimisticallyUpdateFeedback } from './utils'

const mutationKeys = {
    all: ['mutation', 'feedback'] as const,
}

export const useUpsertFeedback = (
    params: Paths.FindFeedbackFeedback.QueryParameters,
    { onSettled }: { onSettled?: () => void } = {},
) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: mutationKeys.all,
        mutationFn: async (
            data: Components.Schemas.FeedbackUpsertRequestDto,
        ) => {
            const client = await getGorgiasKsApiClient()
            return client.upsertFeedbackFeedback({}, data)
        },
        onMutate: async (data: Components.Schemas.FeedbackUpsertRequestDto) => {
            await queryClient.cancelQueries({
                queryKey: feedbackDefinitionKeys.list(params),
            })
            // Optimistically update the feedback
            queryClient.setQueryData(
                feedbackDefinitionKeys.list(params),
                optimisticallyUpdateFeedback(params, data),
            )
        },
        onSettled: () => {
            onSettled?.()
            if (
                queryClient.isMutating({ mutationKey: mutationKeys.all }) === 1
            ) {
                queryClient.invalidateQueries({
                    queryKey: feedbackDefinitionKeys.list(params),
                })
            }
        },
    })
}
