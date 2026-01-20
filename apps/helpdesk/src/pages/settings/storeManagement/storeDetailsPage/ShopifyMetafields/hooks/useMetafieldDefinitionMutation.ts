import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import {
    queryKeys,
    useUpdateMetafieldDefinition,
} from '@gorgias/helpdesk-queries'
import type {
    ListMetafieldDefinitionsResult,
    MetafieldDefinition,
    MetafieldDefinitionUpdate,
} from '@gorgias/helpdesk-types'

type OptimisticUpdateFn = (
    params: { id: string; data: MetafieldDefinitionUpdate },
    previousData: MetafieldDefinition[] | undefined,
) => MetafieldDefinition[] | undefined

type UseMetafieldDefinitionMutationOptions = {
    optimisticUpdate?: OptimisticUpdateFn
}

export function useIntegrationId(): number {
    const { id } = useParams<{ id: string }>()
    return Number(id)
}

export function useMetafieldDefinitionMutation(
    options?: UseMetafieldDefinitionMutationOptions,
) {
    const integrationId = useIntegrationId()
    const queryClient = useQueryClient()
    const pinnedQueryKey = queryKeys.integrations.listMetafieldDefinitions(
        integrationId,
        { pinned: true },
    )

    return useUpdateMetafieldDefinition({
        mutation: {
            onMutate: async (params) => {
                await queryClient.cancelQueries({ queryKey: pinnedQueryKey })

                const previousResponse =
                    queryClient.getQueryData<ListMetafieldDefinitionsResult>(
                        pinnedQueryKey,
                    )
                const previousData = previousResponse?.data?.data

                if (options?.optimisticUpdate && previousResponse) {
                    const updatedData = options.optimisticUpdate(
                        params,
                        previousData,
                    )
                    queryClient.setQueryData<ListMetafieldDefinitionsResult>(
                        pinnedQueryKey,
                        {
                            ...previousResponse,
                            data: {
                                ...previousResponse.data,
                                data: updatedData ?? [],
                            },
                        },
                    )
                }

                return { previousResponse }
            },
            onError: (_error, _params, context) => {
                if (context?.previousResponse !== undefined) {
                    queryClient.setQueryData<ListMetafieldDefinitionsResult>(
                        pinnedQueryKey,
                        context.previousResponse,
                    )
                }
            },
            onSettled: () => {
                queryClient.invalidateQueries({ queryKey: pinnedQueryKey })
                queryClient.invalidateQueries({
                    queryKey: queryKeys.integrations.listMetafieldDefinitions(
                        integrationId,
                        { pinned: false },
                    ),
                })
            },
        },
    })
}
