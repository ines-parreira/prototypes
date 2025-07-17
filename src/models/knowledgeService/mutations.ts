import { useQueryClient } from '@tanstack/react-query'

import {
    FindFeedbackParams,
    FindFeedbackResult,
    queryKeys,
    useUpsertFeedback as useUpsertFeedbackMutation,
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
