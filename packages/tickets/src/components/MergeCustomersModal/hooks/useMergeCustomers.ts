import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type {
    MergeCustomersBody,
    MergeCustomersParams,
} from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useMergeCustomers as useMergeCustomersPrimitive,
} from '@gorgias/helpdesk-queries'

import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../utils/LegacyBridge/context'

export function useMergeCustomers(ticketId?: number) {
    const { dispatchNotification } = useTicketsLegacyBridge()
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

                dispatchNotification({
                    status: NotificationStatus.Success,
                    message: 'Customers successfully merged.',
                })
            } catch (error) {
                dispatchNotification({
                    status: NotificationStatus.Error,
                    message: 'Could not merge customers',
                })
                throw error
            }
        },
        [
            mutateAsyncMergeCustomers,
            queryClient,
            dispatchNotification,
            ticketId,
        ],
    )

    return { mergeCustomers, isLoading }
}
