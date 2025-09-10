import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@gorgias/helpdesk-queries'
import {
    HttpResponse,
    ListTicketMessageTranslations200,
    TicketLanguage,
    TicketMessageTranslation,
} from '@gorgias/helpdesk-types'

import {
    DisplayedContent,
    FetchingState,
} from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/ticketMessageTranslationDisplayContext'
import { useTicketMessageTranslationDisplay } from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/useTicketMessageTranslationDisplay'

import type { ExtractEvent } from '../types'

type CachedData = HttpResponse<ListTicketMessageTranslations200> | undefined

export function useTicketMessageTranslationCompleteEventHandler() {
    const queryClient = useQueryClient()
    const {
        setTicketMessageTranslationDisplay,
        getTicketMessageTranslationDisplay,
    } = useTicketMessageTranslationDisplay()

    const handleTicketMessageTranslationCompleted = useCallback(
        (
            event: ExtractEvent<'//helpdesk/ticket-message-translation.completed/1.0.0'>,
        ) => {
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
        },
        [
            queryClient,
            setTicketMessageTranslationDisplay,
            getTicketMessageTranslationDisplay,
        ],
    )
    return {
        handleTicketMessageTranslationCompleted,
    }
}
