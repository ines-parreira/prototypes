import type { ReactNode } from 'react'

import type { InfiniteData } from '@tanstack/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { HttpResponse } from 'msw'

import type { DomainEventWithType } from '@gorgias/events'
import {
    mockGetTicketMessageHandler,
    mockListMessagesResponse,
    mockTicketMessage,
} from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { ListMessages200, TicketMessage } from '@gorgias/helpdesk-types'

import { server } from '../../../tests/server'
import { TICKET_THREAD_MESSAGES_PAGE_LIMIT } from '../../shared/useListTicketMessages'
import { useTicketMessageCreatedSignalHandler } from '../useTicketMessageCreatedSignalHandler'

function createMessage(
    overrides?: Partial<TicketMessage> & Record<string, unknown>,
) {
    return mockTicketMessage({
        id: 10,
        ticket_id: 123,
        channel: 'email',
        from_agent: false,
        via: 'email',
        created_datetime: '2024-03-21T11:00:00Z',
        ...overrides,
    } as any)
}

function createCachedThreadMessages(
    messages: TicketMessage[],
): InfiniteData<{ data: ListMessages200 }> {
    return {
        pageParams: [undefined],
        pages: [
            {
                data: mockListMessagesResponse({
                    data: messages,
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: messages.length,
                    },
                }),
            },
        ],
    }
}

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    })
}

function createWrapper(queryClient: QueryClient) {
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }
}

function createTicketMessageCreatedSignalEvent(
    overrides?: Partial<
        DomainEventWithType<'//helpdesk/ui.ticket-message.created-signal'>['data']
    >,
): DomainEventWithType<'//helpdesk/ui.ticket-message.created-signal'> {
    return {
        id: 'event-1',
        dataschema: '//helpdesk/ui.ticket-message.created-signal/1.0.0',
        type: 'ui.ticket-message.created-signal',
        source: 'helpdesk',
        subject: 'ticket-123',
        data: {
            id: 10,
            ticket_id: 123,
            user_id: 1,
            ...overrides,
        },
    }
}

describe('useTicketMessageCreatedSignalHandler', () => {
    it('fetches the message and patches the active ticket messages query when the signal matches the ticket', async () => {
        const queryClient = createQueryClient()
        const queryKey = queryKeys.ticketMessages.listAllMessages({
            ticket_id: 123,
            limit: TICKET_THREAD_MESSAGES_PAGE_LIMIT,
        })
        const existingMessage = createMessage({ id: 1 })
        const fetchedMessage = createMessage({
            id: 2,
            body_text: 'Fresh incoming message',
            stripped_text: 'Fresh incoming message',
        })

        queryClient.setQueryData(
            queryKey,
            createCachedThreadMessages([existingMessage]),
        )

        server.use(
            mockGetTicketMessageHandler(async () =>
                HttpResponse.json(fetchedMessage),
            ).handler,
        )

        const { result } = renderHook(
            () => useTicketMessageCreatedSignalHandler({ ticketId: 123 }),
            { wrapper: createWrapper(queryClient) },
        )

        await act(async () => {
            await result.current.handleTicketMessageCreatedSignal(
                createTicketMessageCreatedSignalEvent({ id: 2 }),
            )
        })

        const cachedMessages =
            queryClient.getQueryData<InfiniteData<{ data: ListMessages200 }>>(
                queryKey,
            )
        const cachedMessage = queryClient.getQueryData(
            queryKeys.ticketMessages.getTicketMessage(123, 2),
        )

        expect(cachedMessages?.pages[0]?.data.data).toEqual([
            expect.objectContaining({
                id: 2,
                ticket_id: 123,
                body_text: 'Fresh incoming message',
                stripped_text: 'Fresh incoming message',
            }),
            existingMessage,
        ])
        expect(cachedMessages?.pages[0]?.data.meta.total_resources).toBe(2)
        expect(cachedMessage).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    id: 2,
                    ticket_id: 123,
                    body_text: 'Fresh incoming message',
                }),
            }),
        )
    })

    it('skips fetching when the message already exists in cache', async () => {
        const queryClient = createQueryClient()
        const queryKey = queryKeys.ticketMessages.listAllMessages({
            ticket_id: 123,
            limit: TICKET_THREAD_MESSAGES_PAGE_LIMIT,
        })
        const existingMessage = createMessage({
            id: 22,
            body_text: 'Old body',
        })
        const getTicketMessageSpy = vi.fn()

        queryClient.setQueryData(
            queryKey,
            createCachedThreadMessages([existingMessage]),
        )

        server.use(
            mockGetTicketMessageHandler(async () => {
                getTicketMessageSpy()

                return HttpResponse.json(existingMessage)
            }).handler,
        )

        const { result } = renderHook(
            () => useTicketMessageCreatedSignalHandler({ ticketId: 123 }),
            { wrapper: createWrapper(queryClient) },
        )

        await act(async () => {
            await result.current.handleTicketMessageCreatedSignal(
                createTicketMessageCreatedSignalEvent({ id: 22 }),
            )
        })

        const cachedMessages =
            queryClient.getQueryData<InfiniteData<{ data: ListMessages200 }>>(
                queryKey,
            )

        expect(cachedMessages?.pages[0]?.data.data).toEqual([existingMessage])
        expect(cachedMessages?.pages[0]?.data.meta.total_resources).toBe(1)
        expect(getTicketMessageSpy).not.toHaveBeenCalled()
        expect(
            queryClient.getQueryData(
                queryKeys.ticketMessages.getTicketMessage(123, 22),
            ),
        ).toBeUndefined()
    })

    it('ignores signals for other tickets', async () => {
        const queryClient = createQueryClient()
        const queryKey = queryKeys.ticketMessages.listAllMessages({
            ticket_id: 123,
            limit: TICKET_THREAD_MESSAGES_PAGE_LIMIT,
        })
        const existingMessage = createMessage({ id: 1 })

        queryClient.setQueryData(
            queryKey,
            createCachedThreadMessages([existingMessage]),
        )

        const { result } = renderHook(
            () => useTicketMessageCreatedSignalHandler({ ticketId: 123 }),
            { wrapper: createWrapper(queryClient) },
        )

        await act(async () => {
            await result.current.handleTicketMessageCreatedSignal(
                createTicketMessageCreatedSignalEvent({
                    id: 2,
                    ticket_id: 999,
                    user_id: 999,
                }),
            )
        })

        const cachedMessages =
            queryClient.getQueryData<InfiniteData<{ data: ListMessages200 }>>(
                queryKey,
            )

        expect(cachedMessages?.pages[0]?.data.data).toEqual([existingMessage])
        expect(cachedMessages?.pages[0]?.data.meta.total_resources).toBe(1)
    })

    it('does not seed the thread cache when the thread query has not been loaded yet', async () => {
        const queryClient = createQueryClient()
        const queryKey = queryKeys.ticketMessages.listAllMessages({
            ticket_id: 123,
            limit: TICKET_THREAD_MESSAGES_PAGE_LIMIT,
        })
        const fetchedMessage = createMessage({
            id: 2,
            body_text: 'Fresh incoming message',
            stripped_text: 'Fresh incoming message',
        })

        server.use(
            mockGetTicketMessageHandler(async () =>
                HttpResponse.json(fetchedMessage),
            ).handler,
        )

        const { result } = renderHook(
            () => useTicketMessageCreatedSignalHandler({ ticketId: 123 }),
            { wrapper: createWrapper(queryClient) },
        )

        await act(async () => {
            await result.current.handleTicketMessageCreatedSignal(
                createTicketMessageCreatedSignalEvent({ id: 2 }),
            )
        })

        expect(queryClient.getQueryData(queryKey)).toBeUndefined()
        expect(
            queryClient.getQueryData(
                queryKeys.ticketMessages.getTicketMessage(123, 2),
            ),
        ).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    id: 2,
                    ticket_id: 123,
                }),
            }),
        )
    })
})
