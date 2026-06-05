import type { InfiniteData, QueryClient } from '@tanstack/react-query'

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

type TicketMessagesPage<TMessage extends PersistedTicketMessage> = {
    data: {
        data: TMessage[]
        meta?: {
            next_cursor?: string | null
            prev_cursor?: string | null
            total_resources?: number
        }
    }
}

const TICKET_THREAD_MESSAGES_PAGE_LIMIT = 100

function sortMessagesByDateAsc<TMessage extends PersistedTicketMessage>(
    messageA: TMessage,
    messageB: TMessage,
): number {
    return messageA.created_datetime.localeCompare(messageB.created_datetime)
}

function sortMessagesByDateDesc<TMessage extends PersistedTicketMessage>(
    messageA: TMessage,
    messageB: TMessage,
): number {
    return messageB.created_datetime.localeCompare(messageA.created_datetime)
}

function upsertTicketMessageInListAllMessagesCache<
    TMessage extends PersistedTicketMessage,
>(queryClient: QueryClient, message: TMessage, ticketId: number): void {
    queryClient.setQueryData<InfiniteData<TicketMessagesPage<TMessage>>>(
        queryKeys.ticketMessages.listAllMessages({
            ticket_id: ticketId,
            limit: TICKET_THREAD_MESSAGES_PAGE_LIMIT,
        }),
        (cache) => {
            const existingMessages =
                cache?.pages.flatMap((page) => page.data.data) ?? []

            if (
                message.id &&
                existingMessages.some(
                    (currentMessage) => currentMessage.id === message.id,
                )
            ) {
                return cache
            }

            if (!cache?.pages.length) {
                return cache
            }

            const [firstPage, ...remainingPages] = cache.pages
            const nextFirstPageMessages = [
                message,
                ...firstPage.data.data,
            ].sort(sortMessagesByDateDesc)

            return {
                ...cache,
                pages: [
                    {
                        ...firstPage,
                        data: {
                            ...firstPage.data,
                            data: nextFirstPageMessages,
                            meta: {
                                ...firstPage.data.meta,
                                total_resources:
                                    typeof firstPage.data.meta
                                        ?.total_resources === 'number'
                                        ? firstPage.data.meta.total_resources +
                                          1
                                        : firstPage.data.meta?.total_resources,
                            },
                        },
                    },
                    ...remainingPages,
                ],
            }
        },
    )
}

export function upsertTicketMessageInListMessagesCache<
    TMessage extends PersistedTicketMessage,
>(queryClient: QueryClient, message: TMessage): void {
    const ticketId = Number(message.ticket_id)

    if (!ticketId) {
        return
    }

    upsertTicketMessageInListAllMessagesCache(queryClient, message, ticketId)

    queryClient.setQueryData(
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

            const nextMessages = [...currentMessages, message].sort(
                sortMessagesByDateAsc,
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
