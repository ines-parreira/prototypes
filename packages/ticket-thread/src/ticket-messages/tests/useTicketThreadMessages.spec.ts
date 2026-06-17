import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListMessagesHandler,
    mockListMessagesResponse,
    mockTicketMessage,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '#tests/render.utils'
import { server } from '#tests/server'
import { TicketThreadItemTag } from '#thread/itemTags'
import { useTicketThreadMessages } from '#ticket-messages/hooks/useTicketThreadMessages'
import { TicketThreadPendingState } from '#ticket-messages/types'
import type {
    TicketThreadMessageItem,
    TicketThreadSingleMessageItem,
} from '#ticket-messages/types'

function createMessage(overrides?: Record<string, unknown>) {
    const id = overrides?.id ?? 'default'

    return mockTicketMessage({
        body_html: `<p>message-${id}</p>`,
        body_text: `message-${id}`,
        channel: 'email',
        from_agent: false,
        via: 'email',
        created_datetime: '2024-03-21T11:00:00Z',
        sender: {
            id: 1,
            name: 'Alice',
            firstname: 'Alice',
            lastname: '',
            email: 'alice@example.com',
            meta: {},
        },
        ...overrides,
    } as any)
}

function getTicketMessagesHandler(messages: unknown[]) {
    return mockListMessagesHandler(async () =>
        HttpResponse.json(
            mockListMessagesResponse({
                data: messages as any[],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                    total_resources: messages.length,
                },
            }),
        ),
    )
}

function getMessageIds(items: TicketThreadMessageItem[]): number[] {
    return items.flatMap((item) => {
        if (item._tag === TicketThreadItemTag.Messages.GroupedMessages) {
            return item.data.map((message) => message.data.id as number)
        }

        return [item.data.id as number]
    })
}

function findMessageItemById(
    items: TicketThreadMessageItem[],
    id: number,
): TicketThreadSingleMessageItem | undefined {
    for (const item of items) {
        if (item._tag === TicketThreadItemTag.Messages.GroupedMessages) {
            const groupedItem = item.data.find(
                (message) => message.data.id === id,
            )

            if (groupedItem) {
                return groupedItem
            }

            continue
        }

        if (item.data.id === id) {
            return item
        }
    }

    return undefined
}

describe('useTicketThreadMessages', () => {
    it('keeps legacy ordering between persisted/failed and active pending buckets', async () => {
        const mockListTicketMessages = getTicketMessagesHandler([
            createMessage({
                id: 10,
                created_datetime: '2024-03-21T10:00:00Z',
            }),
            createMessage({
                id: 20,
                created_datetime: '2024-03-21T10:01:00Z',
                meta: { hidden: true },
            }),
            createMessage({
                id: 30,
                created_datetime: '2024-03-21T10:02:00Z',
                meta: { type: 'signal' },
            }),
        ])
        server.use(mockListTicketMessages.handler)

        const pendingMessages: unknown[] = [
            createMessage({
                id: 40,
                created_datetime: '2024-03-21T10:20:00Z',
                failed_datetime: '2024-03-21T10:21:00Z',
            }),
            createMessage({
                id: 50,
                created_datetime: '2024-03-21T10:30:00Z',
                failed_datetime: null,
            }),
        ]

        const { result } = renderHook(() =>
            useTicketThreadMessages({
                ticketId: 123,
                pendingMessages,
            }),
        )

        await waitFor(() => {
            expect(getMessageIds(result.current.messages)).toEqual([10, 40])
        })
        expect(getMessageIds(result.current.activePendingMessages)).toEqual([
            50,
        ])
        expect(
            findMessageItemById(result.current.messages, 10)?.pendingState,
        ).toBe(undefined)
        expect(
            findMessageItemById(result.current.messages, 40)?.pendingState,
        ).toBe(TicketThreadPendingState.Failed)
        expect(
            findMessageItemById(result.current.activePendingMessages, 50)
                ?.pendingState,
        ).toBe(TicketThreadPendingState.Active)
    })

    it('marks the group containing the latest customer message for last-seen status', async () => {
        server.use(
            getTicketMessagesHandler([
                createMessage({
                    id: 10,
                    channel: 'chat',
                    public: true,
                    created_datetime: '2024-03-21T10:00:00Z',
                }),
                createMessage({
                    id: 20,
                    channel: 'chat',
                    public: true,
                    created_datetime: '2024-03-21T10:03:00Z',
                }),
                createMessage({
                    id: 30,
                    created_datetime: '2024-03-21T10:05:00Z',
                    from_agent: true,
                }),
            ]).handler,
        )

        const { result } = renderHook(() =>
            useTicketThreadMessages({
                ticketId: 123,
            }),
        )

        await waitFor(() => {
            expect(getMessageIds(result.current.messages)).toEqual([10, 20, 30])
        })

        const groupedCustomerMessages = result.current.messages[0]
        const agentMessage = result.current.messages[1]

        expect(groupedCustomerMessages).toMatchObject({
            _tag: TicketThreadItemTag.Messages.GroupedMessages,
            shouldShowCustomerLastSeenStatus: true,
        })
        expect(
            findMessageItemById(result.current.messages, 10)
                ?.shouldShowCustomerLastSeenStatus,
        ).toBe(undefined)
        expect(
            findMessageItemById(result.current.messages, 20)
                ?.shouldShowCustomerLastSeenStatus,
        ).toBe(true)
        expect(agentMessage.shouldShowCustomerLastSeenStatus).toBe(undefined)
    })

    it('ignores non-ticket pending payloads', async () => {
        server.use(getTicketMessagesHandler([]).handler)

        const pendingMessages: unknown[] = [
            {
                id: 'invalid',
                created_datetime: '2024-03-21T10:30:00Z',
            },
        ]

        const { result } = renderHook(() =>
            useTicketThreadMessages({
                ticketId: 123,
                pendingMessages,
            }),
        )

        await waitFor(() => {
            expect(getMessageIds(result.current.messages)).toEqual([])
        })
        expect(result.current.activePendingMessages).toEqual([])
    })

    it('does not render pending messages that already exist in the persisted list', async () => {
        server.use(
            getTicketMessagesHandler([
                createMessage({
                    id: 10,
                    body_html: '<p>Hello there</p>',
                    body_text: 'Hello there',
                    created_datetime: '2024-03-21T10:00:00Z',
                    from_agent: true,
                    source: {
                        type: 'email',
                        from: {
                            address: 'agent@gorgias.com',
                            name: 'Agent',
                        },
                        to: [
                            {
                                address: 'customer@example.com',
                                name: 'Customer',
                            },
                        ],
                        extra: {
                            include_thread: false,
                        },
                    },
                }),
            ]).handler,
        )

        const pendingMessages: unknown[] = [
            createMessage({
                id: 50,
                body_html: '<p>Hello there</p>',
                body_text: 'Hello there',
                created_datetime: '2024-03-21T10:30:00Z',
                failed_datetime: null,
                from_agent: true,
                source: {
                    type: 'email',
                    from: {
                        address: 'agent@gorgias.com',
                        name: 'Agent',
                    },
                    to: [
                        {
                            address: 'customer@example.com',
                            name: 'Customer',
                        },
                    ],
                    extra: {
                        include_thread: false,
                    },
                },
            }),
        ]

        const { result } = renderHook(() =>
            useTicketThreadMessages({
                ticketId: 123,
                pendingMessages,
            }),
        )

        await waitFor(() => {
            expect(getMessageIds(result.current.messages)).toEqual([10])
        })
        expect(result.current.activePendingMessages).toEqual([])
    })

    it('keeps pending internal notes ungrouped on grouped channels', async () => {
        server.use(getTicketMessagesHandler([]).handler)

        const pendingMessages: unknown[] = [
            createMessage({
                id: 50,
                channel: 'whatsapp-message',
                via: 'helpdesk',
                public: false,
                from_agent: true,
                source: {
                    type: 'internal-note',
                    from: {
                        address: 'agent@gorgias.com',
                        name: 'Agent',
                    },
                    to: [],
                },
                sender: {
                    id: 99,
                    email: 'agent@gorgias.com',
                    name: 'Agent',
                    firstname: 'Agent',
                    lastname: '',
                    meta: {},
                },
                created_datetime: '2024-03-21T10:30:00Z',
                failed_datetime: null,
            }),
            createMessage({
                id: 60,
                channel: 'whatsapp-message',
                via: 'helpdesk',
                public: false,
                from_agent: true,
                source: {
                    type: 'internal-note',
                    from: {
                        address: 'agent@gorgias.com',
                        name: 'Agent',
                    },
                    to: [],
                },
                sender: {
                    id: 99,
                    email: 'agent@gorgias.com',
                    name: 'Agent',
                    firstname: 'Agent',
                    lastname: '',
                    meta: {},
                },
                created_datetime: '2024-03-21T10:33:00Z',
                failed_datetime: null,
            }),
        ]

        const { result } = renderHook(() =>
            useTicketThreadMessages({
                ticketId: 123,
                pendingMessages,
            }),
        )

        await waitFor(() => {
            expect(getMessageIds(result.current.activePendingMessages)).toEqual(
                [50, 60],
            )
        })

        expect(result.current.activePendingMessages).toHaveLength(2)
        expect(result.current.activePendingMessages[0]).toMatchObject({
            _tag: TicketThreadItemTag.Messages.InternalNote,
            pendingState: TicketThreadPendingState.Active,
        })
        expect(result.current.activePendingMessages[1]).toMatchObject({
            _tag: TicketThreadItemTag.Messages.InternalNote,
            pendingState: TicketThreadPendingState.Active,
        })
    })
})
