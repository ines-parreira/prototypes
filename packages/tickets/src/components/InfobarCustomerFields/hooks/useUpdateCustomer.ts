import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { UpdateCustomerBody } from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useUpdateCustomer as useUpdateCustomerPrimitive,
} from '@gorgias/helpdesk-queries'

import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../utils/LegacyBridge/context'

type UpdateCustomerBodyWithNote = UpdateCustomerBody & {
    note?: string | null
}

export function useUpdateCustomer(ticketId: string, customerId: number) {
    const { dispatchNotification } = useTicketsLegacyBridge()
    const queryClient = useQueryClient()
    const ticketQueryKey = queryKeys.tickets.getTicket(Number(ticketId))
    const customerQueryKey = queryKeys.customers.getCustomer(customerId)

    const { mutateAsync: mutateAsyncUpdateCustomer, isLoading } =
        useUpdateCustomerPrimitive({
            mutation: {
                onMutate: async () => {
                    await queryClient.cancelQueries({
                        queryKey: ticketQueryKey,
                    })
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
                await queryClient.invalidateQueries({
                    queryKey: ticketQueryKey,
                })
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
