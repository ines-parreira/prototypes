import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router'

import type { DomainEventWithType } from '@gorgias/events'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type {
    HttpResponse,
    ListTicketMessageTranslations200,
    TicketLanguage,
    TicketMessageTranslation,
} from '@gorgias/helpdesk-types'

import { useTicket } from '../../../hooks/useTicket'
import { DisplayedContent, FetchingState } from '../../store/constants'
import { useTicketMessageTranslationDisplay } from '../../store/useTicketMessageTranslationDisplay'
import { KeyPrefixes } from '../constants'
import type { TicketTranslationsQueryKeyParams } from '../types'

type CachedData = HttpResponse<ListTicketMessageTranslations200> | undefined

export function useTicketMessageTranslationCompleteEventHandler() {
    const { ticketId } = useParams<{ ticketId: string }>()
    const { data: ticket } = useTicket(Number(ticketId))

    const queryClient = useQueryClient()
    const {
        setTicketMessageTranslationDisplay,
        getTicketMessageTranslationDisplay,
    } = useTicketMessageTranslationDisplay()

    const handleTicketMessageTranslationCompleted = useCallback(
        (
            event: DomainEventWithType<'//helpdesk/ticket-message-translation.completed'>,
        ) => {
            if (!ticket) {
                return
            }

            const { messages } = ticket.data

            const { ticket_id, ticket_message_id, language } = event.data

            const queryKey = queryKeys.tickets.listTicketMessageTranslations({
                language: language as TicketLanguage,
                ticket_id,
            })

            queryClient.setQueryData(queryKey, (oldData: CachedData) => {
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
                    } as unknown as HttpResponse<ListTicketMessageTranslations200>
                }

                const ticketMessageTranslation = oldData.data.data.find(
                    (ticketMessage) =>
                        ticketMessage.ticket_message_id === ticket_message_id,
                )
                const otherTicketTranslations = oldData.data.data.filter(
                    (ticket) => ticket.ticket_message_id !== ticket_message_id,
                )

                const newTicketMessageTranslation = {
                    ...ticketMessageTranslation,
                    ...event.data,
                } as TicketMessageTranslation

                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        data: [
                            ...otherTicketTranslations,
                            newTicketMessageTranslation,
                        ],
                    },
                }
            })

            const displayType =
                getTicketMessageTranslationDisplay(ticket_message_id)

            setTicketMessageTranslationDisplay([
                {
                    messageId: ticket_message_id,
                    ...displayType,
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Completed,
                },
            ])

            const ticketFirstMessageId = messages[0]?.id
            if (ticketFirstMessageId !== ticket_message_id) {
                return
            }

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

            const keysToInvalidate = ticketTranslationsKeysToUpdate.map(
                (query) => query.queryKey,
            )
            for (const key of keysToInvalidate) {
                queryClient.invalidateQueries({
                    queryKey: key,
                })
            }
        },
        [
            queryClient,
            ticket,
            setTicketMessageTranslationDisplay,
            getTicketMessageTranslationDisplay,
        ],
    )
    return {
        handleTicketMessageTranslationCompleted,
    }
}
