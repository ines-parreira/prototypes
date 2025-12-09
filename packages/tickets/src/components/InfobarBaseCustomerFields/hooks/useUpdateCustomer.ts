import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { UpdateCustomerBody } from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useUpdateCustomer as useUpdateCustomerPrimitive,
} from '@gorgias/helpdesk-queries'

type UpdateCustomerBodyWithNote = UpdateCustomerBody & {
    note?: string | null
}

export function useUpdateCustomer(ticketId: string, customerId: number) {
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
            } catch (error) {
                throw error
            }
        },
        [
            mutateAsyncUpdateCustomer,
            queryClient,
            ticketQueryKey,
            customerQueryKey,
            customerId,
        ],
    )

    return {
        updateCustomer,
        isLoading,
    }
}
