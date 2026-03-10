import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { DomainEventWithType } from '@gorgias/events'
import type {
    HttpResponse,
    ListTicketTranslations200,
} from '@gorgias/helpdesk-types'

import { KeyPrefixes } from '../constants'
import type { TicketTranslationsQueryKeyParams } from '../types'

export function useTicketTranslationCompleteEventHandler() {
    const queryClient = useQueryClient()

    const handleTicketTranslationCompleted = useCallback(
        (
            event: DomainEventWithType<'//helpdesk/ticket-translation.completed'>,
        ) => {
            const { ticket_id } = event.data
            const queryCache = queryClient.getQueryCache()

            const ticketTranslationsKeys = queryCache.findAll({
                queryKey: KeyPrefixes.ticketTranslations,
            })
            const ticketTranslationsKeysToUpdate =
                ticketTranslationsKeys.filter((query) => {
                    const queryParams = query
                        .queryKey[2] as TicketTranslationsQueryKeyParams

                    if (!Array.isArray(queryParams.queryParams.ticket_ids)) {
                        return false
                    }

                    return queryParams.queryParams.ticket_ids.some(
                        (id) => id === ticket_id,
                    )
                })

            for (const query of ticketTranslationsKeysToUpdate) {
                queryClient.setQueryData(
                    query.queryKey,
                    (
                        oldData:
                            | HttpResponse<ListTicketTranslations200>
                            | undefined,
                    ) => {
                        if (!oldData) {
                            return {
                                status: 200,
                                statusText: 'OK',
                                config: {},
                                headers: {},
                                data: {
                                    uri: '',
                                    object: 'list',
                                    data: [event.data],
                                    meta: {
                                        next_cursor: null,
                                        prev_cursor: null,
                                        total_resources: 0,
                                    },
                                },
                            } as unknown as HttpResponse<ListTicketTranslations200>
                        }

                        const ticketTranslation = oldData.data.data.find(
                            (ticket) => ticket.ticket_id === ticket_id,
                        )

                        const otherTicketTranslations =
                            oldData.data.data.filter(
                                (ticket) => ticket.ticket_id !== ticket_id,
                            )

                        const newTicketTranslation = {
                            excerpt: null,
                            ticket_translation_id: null,
                            ...ticketTranslation,
                            ...event.data,
                        }

                        return {
                            ...oldData,
                            data: {
                                ...oldData.data,
                                data: [
                                    ...otherTicketTranslations,
                                    newTicketTranslation,
                                ],
                            },
                        }
                    },
                )
            }
        },
        [queryClient],
    )
    return {
        handleTicketTranslationCompleted,
    }
}
