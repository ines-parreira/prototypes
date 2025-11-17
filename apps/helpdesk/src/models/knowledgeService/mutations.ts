import { useQueryClient } from '@tanstack/react-query'

import type {
    FindFeedbackParams,
    FindFeedbackResult,
} from '@gorgias/knowledge-service-queries'
import {
    queryKeys,
    useUpsertFeedback as useUpsertFeedbackMutation,
    useUpsertRulesProductRecommendation as useUpsertRulesProductRecommendationMutation,
} from '@gorgias/knowledge-service-queries'

import { optimisticallyUpdateFeedback } from './utils'

export const useUpsertFeedback = (
    params: FindFeedbackParams,
    { onSettled }: { onSettled?: () => void } = {},
) => {
    const queryClient = useQueryClient()
    const queryKey = queryKeys.feedback.findFeedback(params)

    return useUpsertFeedbackMutation({
        mutation: {
            mutationKey: queryKey,
            onSettled: () => {
                onSettled?.()
                if (queryClient.isMutating({ mutationKey: queryKey }) === 1) {
                    queryClient.invalidateQueries({ queryKey })
                }
            },
            onMutate: async (data) => {
                await queryClient.cancelQueries({ queryKey })

                // Optimistically update the feedback
                queryClient.setQueryData<FindFeedbackResult>(
                    queryKeys.feedback.findFeedback(params),
                    optimisticallyUpdateFeedback(params, data.data),
                )
            },
        },
    })
}

export const useUpsertRulesProductRecommendation = (
    integrationId: number,
    { onSettled }: { onSettled?: () => void } = {},
) => {
    const queryClient = useQueryClient()
    const queryKey =
        queryKeys.productRecommendation.getRulesProductRecommendation(
            integrationId,
        )

    return useUpsertRulesProductRecommendationMutation({
        mutation: {
            mutationKey: queryKey,
            onSettled: () => {
                onSettled?.()
                if (queryClient.isMutating({ mutationKey: queryKey }) === 1) {
                    queryClient.invalidateQueries({ queryKey })
                }
            },
            onMutate: async () => {
                await queryClient.cancelQueries({ queryKey })
            },
        },
    })
}
