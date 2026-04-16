import { appQueryClient } from '@repo/api-resources'

import { queryKeys } from '@gorgias/helpdesk-queries'

type PersistedTicketMessage = {
    id?: number
    ticket_id?: number | string
    created_datetime: string
}

type TicketMessagesCache<TMessage extends PersistedTicketMessage> = {
    data?: {
        data?: TMessage[]
    }
}

export function upsertTicketMessageInListMessagesCache<
    TMessage extends PersistedTicketMessage,
>(message: TMessage): void {
    const ticketId = Number(message.ticket_id)

    if (!ticketId) {
        return
    }

    appQueryClient.setQueryData(
        queryKeys.ticketMessages.listMessages({
            ticket_id: ticketId,
        }),
        (cache: TicketMessagesCache<TMessage> | undefined) => {
            const currentMessages = cache?.data?.data ?? []

            if (
                message.id &&
                currentMessages.some(
                    (currentMessage) => currentMessage.id === message.id,
                )
            ) {
                return cache
            }

            const nextMessages = [...currentMessages, message].sort((a, b) =>
                a.created_datetime.localeCompare(b.created_datetime),
            )

            if (!cache) {
                return {
                    data: {
                        data: nextMessages,
                    },
                }
            }

            return {
                ...cache,
                data: {
                    ...cache.data,
                    data: nextMessages,
                },
            }
        },
    )
}
