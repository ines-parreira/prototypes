import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import type {
    MergeCustomersBody,
    MergeCustomersParams,
} from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useMergeCustomers as useMergeCustomersPrimitive,
} from '@gorgias/helpdesk-queries'

export function useMergeCustomers(ticketId?: number) {
    const queryClient = useQueryClient()

    const { mutateAsync: mutateAsyncMergeCustomers, isLoading } =
        useMergeCustomersPrimitive()

    const mergeCustomers = useCallback(
        async (data: MergeCustomersBody, params: MergeCustomersParams) => {
            try {
                await mutateAsyncMergeCustomers({ data, params })
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.customers.getCustomer(params.target_id),
                })
                queryClient.removeQueries({
                    queryKey: queryKeys.customers.getCustomer(params.source_id),
                })

                if (ticketId) {
                    await queryClient.invalidateQueries({
                        queryKey: queryKeys.tickets.getTicket(ticketId),
                    })
                }

                toast.success('Customers successfully merged.')
            } catch (error) {
                toast.error('Could not merge customers')
                throw error
            }
        },
        [mutateAsyncMergeCustomers, queryClient, ticketId],
    )

    return { mergeCustomers, isLoading }
}
