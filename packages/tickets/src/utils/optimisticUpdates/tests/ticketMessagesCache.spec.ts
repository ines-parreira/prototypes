import type { InfiniteData } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'

import { mockTicketMessage } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { upsertTicketMessageInListMessagesCache } from '../ticketMessagesCache'

type TestTicketMessage = {
    id: number
    ticket_id: number
    created_datetime: string
}

type TicketMessagesPage = {
    data: {
        data: TestTicketMessage[]
        meta?: {
            next_cursor?: string | null
            prev_cursor?: string | null
            total_resources?: number
        }
    }
}

const TICKET_ID = 123
const LIST_ALL_MESSAGES_KEY = queryKeys.ticketMessages.listAllMessages({
    ticket_id: TICKET_ID,
    limit: 100,
})

function createQueryClient() {
    return new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
}

function createMessage(
    overrides: Partial<TestTicketMessage>,
): TestTicketMessage {
    return mockTicketMessage({
        id: overrides.id ?? 1,
        ticket_id: overrides.ticket_id ?? TICKET_ID,
        created_datetime: overrides.created_datetime ?? '2026-05-01T10:00:00Z',
    } as any) as TestTicketMessage
}

function makeListAllMessagesCache(
    pages: TestTicketMessage[][],
): InfiniteData<TicketMessagesPage> {
    return {
        pageParams: pages.map((_, index) =>
            index === 0 ? undefined : `cursor-${index}`,
        ),
        pages: pages.map((messages, index) => ({
            data: {
                data: messages,
                meta: {
                    next_cursor:
                        index < pages.length - 1 ? `cursor-${index + 1}` : null,
                    prev_cursor: index === 0 ? null : `cursor-${index - 1}`,
                    total_resources: pages.flat().length,
                },
            },
        })),
    }
}

describe('upsertTicketMessageInListMessagesCache', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        queryClient = createQueryClient()
    })

    it('does not create a list-all messages cache for an unopened ticket', () => {
        upsertTicketMessageInListMessagesCache(
            queryClient,
            createMessage({
                id: 10,
                created_datetime: '2026-05-01T10:03:00Z',
            }),
        )

        expect(queryClient.getQueryData(LIST_ALL_MESSAGES_KEY)).toBeUndefined()
    })

    it('does not accumulate realtime-created messages into a synthetic list-all cache', () => {
        upsertTicketMessageInListMessagesCache(
            queryClient,
            createMessage({
                id: 10,
                created_datetime: '2026-05-01T10:03:00Z',
            }),
        )
        upsertTicketMessageInListMessagesCache(
            queryClient,
            createMessage({
                id: 20,
                created_datetime: '2026-05-01T10:04:00Z',
            }),
        )
        upsertTicketMessageInListMessagesCache(
            queryClient,
            createMessage({
                id: 30,
                created_datetime: '2026-05-01T10:05:00Z',
            }),
        )

        expect(queryClient.getQueryData(LIST_ALL_MESSAGES_KEY)).toBeUndefined()
    })

    it('upserts into an existing list-all messages cache', () => {
        queryClient.setQueryData(
            LIST_ALL_MESSAGES_KEY,
            makeListAllMessagesCache([
                [
                    createMessage({
                        id: 10,
                        created_datetime: '2026-05-01T10:00:00Z',
                    }),
                ],
            ]),
        )

        upsertTicketMessageInListMessagesCache(
            queryClient,
            createMessage({
                id: 20,
                created_datetime: '2026-05-01T10:03:00Z',
            }),
        )

        const cache = queryClient.getQueryData<
            InfiniteData<TicketMessagesPage>
        >(LIST_ALL_MESSAGES_KEY)

        expect(cache?.pages[0].data.data.map((message) => message.id)).toEqual([
            20, 10,
        ])
        expect(cache?.pages[0].data.meta?.total_resources).toBe(2)
    })

    it('still updates the regular list messages cache when list-all is absent', () => {
        upsertTicketMessageInListMessagesCache(
            queryClient,
            createMessage({
                id: 10,
                created_datetime: '2026-05-01T10:03:00Z',
            }),
        )

        const cache = queryClient.getQueryData<{
            data: { data: TestTicketMessage[] }
        }>(
            queryKeys.ticketMessages.listMessages({
                ticket_id: TICKET_ID,
            }),
        )

        expect(cache?.data.data.map((message) => message.id)).toEqual([10])
    })
})
