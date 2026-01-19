import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { UpdateCustomerBody } from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useUpdateCustomer as useUpdateCustomerPrimitive,
} from '@gorgias/helpdesk-queries'
import type { Customer } from '@gorgias/helpdesk-types'

import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../utils/LegacyBridge/context'
import { similarCustomerQueryKeys } from '../../InfobarTicketCustomerDetails/hooks/useGetSimilarCustomer'

type UpdateCustomerBodyWithNote = UpdateCustomerBody & {
    note?: string | null
}

export function useUpdateCustomer(customerId: number, ticketId?: string) {
    const { dispatchNotification } = useTicketsLegacyBridge()
    const queryClient = useQueryClient()
    const ticketQueryKey = ticketId
        ? queryKeys.tickets.getTicket(Number(ticketId))
        : undefined
    const customerQueryKey = queryKeys.customers.getCustomer(customerId)

    const { mutateAsync: mutateAsyncUpdateCustomer, isLoading } =
        useUpdateCustomerPrimitive({
            mutation: {
                onMutate: async () => {
                    if (ticketQueryKey) {
                        await queryClient.cancelQueries({
                            queryKey: ticketQueryKey,
                        })
                    }
                },
            },
        })

    const updateCustomer = useCallback(
        async (data: UpdateCustomerBodyWithNote) => {
            try {
                await mutateAsyncUpdateCustomer({
                    id: customerId,
                    data,
                })

                if (ticketQueryKey) {
                    await queryClient.invalidateQueries({
                        queryKey: ticketQueryKey,
                    })
                }

                // only invalidate similar customer queries where the cached data
                // is the customer we just updated
                // there will only ever be one similar customer query per customer,
                // but we need to support the array format
                const queriesToInvalidate = queryClient
                    .getQueriesData<Customer | null>({
                        queryKey: similarCustomerQueryKeys.all,
                    })
                    .filter(([__queryKey, data]) => {
                        return data?.id === customerId
                    })
                    .map(([queryKey]) => queryKey)

                if (queriesToInvalidate.length > 0) {
                    await Promise.all(
                        queriesToInvalidate.map((queryKey) =>
                            queryClient.invalidateQueries({ queryKey }),
                        ),
                    )
                }

                await queryClient.invalidateQueries({
                    queryKey: customerQueryKey,
                })
            } catch {
                dispatchNotification({
                    status: NotificationStatus.Error,
                    message: 'Failed to update customer',
                })
            }
        },
        [
            mutateAsyncUpdateCustomer,
            queryClient,
            ticketQueryKey,
            customerQueryKey,
            customerId,
            dispatchNotification,
        ],
    )

    return {
        updateCustomer,
        isLoading,
    }
}
