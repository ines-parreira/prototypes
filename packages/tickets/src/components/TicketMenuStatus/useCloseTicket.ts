import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { HttpResponse, Ticket } from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

import { useTicketViewNavigation } from '../../hooks/useTicketViewNavigation'
import { useTicketsLegacyBridge } from '../../utils/LegacyBridge'
import { NotificationStatus } from '../../utils/LegacyBridge/context'
import { patchTicketInViewListCache } from '../../utils/optimisticUpdates/viewListCache'
import { useTicketFieldsValidation } from '../InfobarTicketDetails/components/InfobarTicketFields/hooks/useTicketFieldsValidation'
import { TicketStatus } from './utils'

export function useCloseTicket(ticketId: number) {
    const { dispatchNotification } = useTicketsLegacyBridge()
    const { handleGoToNextViewTicket } = useTicketViewNavigation()
    const queryClient = useQueryClient()
    const queryKey = queryKeys.tickets.getTicket(Number(ticketId))

    const { mutateAsync: mutateAsyncUpdateTicket } = useUpdateTicket({
        mutation: {
            onMutate: async () => {
                await queryClient.cancelQueries({ queryKey })
                queryClient.setQueryData<HttpResponse<Ticket> | undefined>(
                    queryKey,
                    (old) => {
                        if (!old) return old
                        const previousTicket = old.data
                        return {
                            ...old,
                            data: {
                                ...previousTicket,
                                status: TicketStatus.Closed,
                                snooze_datetime: null,
                            },
                        }
                    },
                )
            },
        },
    })
    const { validateTicketFields, isValidating } =
        useTicketFieldsValidation(ticketId)

    const closeTicket = useCallback(async () => {
        const { hasErrors } = validateTicketFields()

        if (hasErrors) {
            dispatchNotification({
                status: NotificationStatus.Error,
                message:
                    'This ticket cannot be closed. Please fill the required fields.',
            })
            return
        }

        try {
            const data = {
                status: TicketStatus.Closed,
                snooze_datetime: null,
            }
            await mutateAsyncUpdateTicket({
                id: ticketId,
                data,
            })
            patchTicketInViewListCache(queryClient, ticketId, data)
            await queryClient.invalidateQueries({
                queryKey,
            })

            handleGoToNextViewTicket()
        } catch {
            dispatchNotification({
                status: NotificationStatus.Error,
                message: 'Failed to close ticket',
            })
        }
    }, [
        validateTicketFields,
        mutateAsyncUpdateTicket,
        ticketId,
        queryClient,
        queryKey,
        dispatchNotification,
        handleGoToNextViewTicket,
    ])

    return {
        closeTicket,
        isValidating,
    }
}
