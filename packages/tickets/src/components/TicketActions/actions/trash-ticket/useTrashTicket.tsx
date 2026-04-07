import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Button, toast } from '@gorgias/axiom'
import type { HttpResponse, Ticket } from '@gorgias/helpdesk-queries'
import { queryKeys, useUpdateTicket } from '@gorgias/helpdesk-queries'

import { useTicketViewNavigation } from '../../../../hooks/useTicketViewNavigation'
import {
    patchTicketInViewListCache,
    removeTicketFromViewListCache,
} from '../../../../utils/optimisticUpdates/viewListCache'

export function useTrashTicket(ticketId: number) {
    const { handleGoToNextViewTicket, navigateToTicket } =
        useTicketViewNavigation()
    const queryClient = useQueryClient()
    const queryKey = queryKeys.tickets.getTicket(Number(ticketId))

    const { mutateAsync: mutateAsyncUpdateTicket } = useUpdateTicket({
        mutation: {
            onMutate: async (data) => {
                await queryClient.cancelQueries({ queryKey })
                queryClient.setQueryData<HttpResponse<Ticket> | undefined>(
                    queryKey,
                    (old) => {
                        if (!old) return old
                        const previousTicket = old.data
                        const nextTrashed = data.data.trashed_datetime ?? null
                        return {
                            ...old,
                            data: {
                                ...previousTicket,
                                trashed_datetime: nextTrashed,
                            },
                        }
                    },
                )
            },
        },
    })

    const trashTicket = useCallback(
        async (ticketId: number, data: { trashed_datetime: string | null }) => {
            try {
                await mutateAsyncUpdateTicket({
                    id: ticketId,
                    data,
                })
                if (data.trashed_datetime) {
                    removeTicketFromViewListCache(queryClient, ticketId)
                } else {
                    patchTicketInViewListCache(queryClient, ticketId, {
                        trashed_datetime: null,
                    })
                }
                await queryClient.invalidateQueries({
                    queryKey,
                })

                // Un deleting a ticket doesn't show a notification
                if (!data.trashed_datetime) {
                    return
                }

                const trashNotificationId = `trash-${ticketId}`
                toast.success('Ticket has been moved to trash', {
                    id: trashNotificationId,
                    inlineActions: ({ id }) => (
                        <Button
                            size="sm"
                            variant="tertiary"
                            onClick={() => {
                                toast.dismiss(id)
                                navigateToTicket(ticketId)
                                trashTicket(ticketId, {
                                    trashed_datetime: null,
                                })
                            }}
                        >
                            Undo
                        </Button>
                    ),
                })
                handleGoToNextViewTicket()
            } catch {
                toast.error('Failed to move to trash')
            }
        },
        [
            mutateAsyncUpdateTicket,
            queryClient,
            queryKey,
            handleGoToNextViewTicket,
            navigateToTicket,
        ],
    )

    return {
        trashTicket,
    }
}
