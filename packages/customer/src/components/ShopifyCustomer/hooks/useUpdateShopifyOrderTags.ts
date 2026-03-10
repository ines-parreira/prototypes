import { useQueryClient } from '@tanstack/react-query'

import {
    ObjectType,
    queryKeys,
    SourceType,
} from '@gorgias/ecommerce-storage-queries'
import { useExecuteAction } from '@gorgias/helpdesk-queries'
import type { ExecuteActionBody, HttpError } from '@gorgias/helpdesk-types'

import type { OrderEcommerceData } from '../types'

type UpdateOrderTagsParams = {
    integrationId: number
    orderId: number | string
    tagsList: string
    ticketId?: string
}

type MutationVariables = {
    data: ExecuteActionBody
    orderId: number | string
}

type MutationContext = {
    previousQueries: [unknown, unknown][]
}

export function useUpdateShopifyOrderTags() {
    const queryClient = useQueryClient()

    const mutation = useExecuteAction<HttpError, MutationContext>({
        mutation: {
            onMutate: async (variables): Promise<MutationContext> => {
                const { data, orderId } = variables as MutationVariables
                const { payload } = data
                const tagsList = (payload as { tags_list: string }).tags_list

                const listQueryKey = queryKeys.ecommerceData.listEcommerceData(
                    ObjectType.Order,
                    SourceType.Shopify,
                )

                await queryClient.cancelQueries({ queryKey: listQueryKey })

                const previousQueries = queryClient.getQueriesData(
                    listQueryKey,
                ) as [unknown, unknown][]

                queryClient.setQueriesData(listQueryKey, (old: unknown) => {
                    if (!old || typeof old !== 'object') return old
                    const oldData = old as {
                        data?: { data?: OrderEcommerceData[] }
                    }
                    if (!Array.isArray(oldData.data?.data)) return old

                    return {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            data: oldData.data!.data!.map((order) => {
                                if (String(order.data.id) === String(orderId)) {
                                    return {
                                        ...order,
                                        data: {
                                            ...order.data,
                                            tags: tagsList,
                                        },
                                    }
                                }
                                return order
                            }),
                        },
                    }
                })

                return { previousQueries }
            },
            onError: (_error, _variables, context) => {
                if (context?.previousQueries) {
                    context.previousQueries.forEach(([queryKey, data]) => {
                        queryClient.setQueryData(
                            queryKey as Parameters<
                                typeof queryClient.setQueryData
                            >[0],
                            data,
                        )
                    })
                }
            },
        },
    })

    const buildActionData = (
        params: UpdateOrderTagsParams,
    ): ExecuteActionBody => {
        const payload = {
            tags_list: params.tagsList,
            order_id: params.orderId,
        }

        return {
            action_name: 'shopifyUpdateOrderTags',
            integration_id: params.integrationId,
            payload,
            ...(params.ticketId && { ticket_id: Number(params.ticketId) }),
        } as unknown as ExecuteActionBody
    }

    return {
        ...mutation,
        mutate: (params: UpdateOrderTagsParams) => {
            mutation.mutate({
                data: buildActionData(params),
                orderId: params.orderId,
            } as MutationVariables)
        },
    }
}
