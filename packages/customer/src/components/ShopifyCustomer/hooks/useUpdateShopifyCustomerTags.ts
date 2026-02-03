import { useQueryClient } from '@tanstack/react-query'
import hash from 'object-hash'

import {
    ObjectType,
    queryKeys,
    SourceType,
} from '@gorgias/ecommerce-storage-queries'
import { useExecuteAction } from '@gorgias/helpdesk-queries'
import type { ExecuteActionBody, HttpError } from '@gorgias/helpdesk-types'

type UpdateTagsParams = {
    integrationId: number
    userId: string
    externalId: string
    tagsList: string
    ticketId?: string
}

type MutationVariables = {
    data: ExecuteActionBody
    externalId: string
}

function generateActionId(
    actionName: string,
    userId: string,
    integrationId: number,
    payload: { tags_list: string },
): string {
    const identifier = [
        actionName,
        userId,
        String(integrationId),
        hash(payload),
    ]
    return identifier.join('-').replace(/\./g, '_')
}

type MutationContext = {
    previousData: unknown
    queryKey: ReturnType<
        typeof queryKeys.ecommerceData.getEcommerceDataByExternalId
    >
    externalId: string
    tagsList: string
}

export function useUpdateShopifyCustomerTags() {
    const queryClient = useQueryClient()

    const mutation = useExecuteAction<HttpError, MutationContext>({
        mutation: {
            onMutate: async (variables): Promise<MutationContext> => {
                const { data, externalId } = variables as MutationVariables
                const { integration_id, payload } = data
                const tagsList = (payload as { tags_list: string }).tags_list

                const queryKey =
                    queryKeys.ecommerceData.getEcommerceDataByExternalId(
                        ObjectType.Shopper,
                        SourceType.Shopify,
                        String(integration_id),
                        externalId,
                    )

                await queryClient.cancelQueries({ queryKey })

                const previousData = queryClient.getQueryData(queryKey)

                queryClient.setQueryData(queryKey, (old: unknown) => {
                    if (!old || typeof old !== 'object') return old
                    const oldData = old as {
                        data?: { data?: { tags?: string } }
                    }
                    if (!oldData.data?.data) return old

                    return {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            data: {
                                ...oldData.data.data,
                                tags: tagsList,
                            },
                        },
                    }
                })

                return { previousData, queryKey, externalId, tagsList }
            },
            onError: (_error, _variables, context) => {
                if (context?.previousData) {
                    queryClient.setQueryData(
                        context.queryKey,
                        context.previousData,
                    )
                }
            },
        },
    })

    const buildActionData = (params: UpdateTagsParams): ExecuteActionBody => {
        const payload = { tags_list: params.tagsList }
        const actionId = generateActionId(
            'shopifyUpdateCustomerTags',
            params.userId,
            params.integrationId,
            payload,
        )

        return {
            action_name: 'shopifyUpdateCustomerTags',
            action_id: actionId,
            user_id: params.userId,
            integration_id: String(params.integrationId),
            payload,
            ...(params.ticketId && { ticket_id: params.ticketId }),
        } as unknown as ExecuteActionBody
    }

    return {
        ...mutation,
        mutate: (params: UpdateTagsParams) => {
            mutation.mutate({
                data: buildActionData(params),
                externalId: params.externalId,
            } as MutationVariables)
        },
    }
}
