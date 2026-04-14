import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListTicketTagsHandler,
    mockListTicketTagsResponse,
    mockTicketMessage,
} from '@gorgias/helpdesk-mocks'
import { TicketStatus } from '@gorgias/helpdesk-queries'
import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { createTestQueryClient, renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import type {
    TicketThreadAiAgentMessageItem,
    TicketThreadRegularMessageItem,
} from '../../messages/types'
import { TicketThreadItemTag } from '../../types'
import { useTicketThreadAiAgentPseudoEvents } from '../useTicketThreadAiAgentPseudoEvents'

function createAiAgentMessage(
    message: TicketMessage,
): TicketThreadAiAgentMessageItem {
    return {
        _tag: TicketThreadItemTag.Messages.AiAgentMessage,
        data: message as TicketThreadAiAgentMessageItem['data'],
        datetime: message.created_datetime,
    }
}

function createRegularMessage(
    message: TicketMessage,
): TicketThreadRegularMessageItem {
    return {
        _tag: TicketThreadItemTag.Messages.Message,
        data: message as TicketThreadRegularMessageItem['data'],
        datetime: message.created_datetime,
    }
}

function getTicketIdFromRequest(request: Request): number {
    return Number(new URL(request.url).pathname.split('/').at(-2))
}

describe('useTicketThreadAiAgentPseudoEvents', () => {
    it('decorates AI messages from ticket tags when ticket events are hidden', async () => {
        const visibleTag = {
            id: 2,
            name: 'customer-follow-up',
            decoration: { color: 'red' },
        }
        const onRequest = vi.fn()
        const message = createAiAgentMessage(
            mockTicketMessage({
                id: 7,
                created_datetime: '2024-03-21T11:00:00Z',
                channel: 'chat',
                public: true,
                from_agent: true,
                via: 'api',
                actions: [
                    {
                        name: 'addTags',
                        arguments: { tags: 'customer-follow-up' },
                    },
                    {
                        name: 'setStatus',
                        arguments: { status: TicketStatus.Closed },
                    },
                ],
            }) as TicketMessage,
        )

        server.use(
            mockListTicketTagsHandler(async ({ request }) => {
                onRequest({ ticketId: getTicketIdFromRequest(request) })

                return HttpResponse.json(
                    mockListTicketTagsResponse({
                        data: [visibleTag],
                    }),
                )
            }).handler,
        )

        const { result } = renderHook(
            () =>
                useTicketThreadAiAgentPseudoEvents({
                    ticketId: 7,
                    messages: [message],
                    persistedItems: [message],
                    showTicketEvents: false,
                }),
            { queryClient: createTestQueryClient() },
        )

        await waitFor(() => {
            expect(result.current).toEqual([
                {
                    ...message,
                    data: {
                        ...message.data,
                        decorations: {
                            aiAgentPseudoEvent: {
                                action: 'close',
                                tags: [visibleTag],
                            },
                        },
                    },
                },
            ])
        })
        expect(onRequest).toHaveBeenCalledTimes(1)
        expect(onRequest).toHaveBeenCalledWith({ ticketId: 7 })
    })

    it('uses the query select mapper to filter nameless tags before decorating messages', async () => {
        const onRequest = vi.fn()
        const message = createAiAgentMessage(
            mockTicketMessage({
                id: 8,
                created_datetime: '2024-03-21T11:00:00Z',
                channel: 'chat',
                public: true,
                from_agent: true,
                via: 'api',
                actions: [
                    {
                        name: 'addTags',
                        arguments: { tags: 'customer-follow-up' },
                    },
                ],
            }) as TicketMessage,
        )

        server.use(
            mockListTicketTagsHandler(async ({ request }) => {
                onRequest({ ticketId: getTicketIdFromRequest(request) })

                return HttpResponse.json(
                    mockListTicketTagsResponse({
                        data: [
                            {
                                id: 1,
                                decoration: { color: 'blue' },
                            },
                            {
                                id: 2,
                                name: 'customer-follow-up',
                            },
                        ],
                    }),
                )
            }).handler,
        )

        const { result } = renderHook(
            () =>
                useTicketThreadAiAgentPseudoEvents({
                    ticketId: 8,
                    messages: [message],
                    persistedItems: [message],
                    showTicketEvents: false,
                }),
            { queryClient: createTestQueryClient() },
        )

        await waitFor(() => {
            expect(result.current[0]).toHaveProperty(
                'data.decorations.aiAgentPseudoEvent.tags',
                [{ id: 2, name: 'customer-follow-up', decoration: null }],
            )
        })
        expect(onRequest).toHaveBeenCalledTimes(1)
        expect(onRequest).toHaveBeenCalledWith({ ticketId: 8 })
    })

    it('falls back to raw tag names when the ticket tags response has no nested data payload', async () => {
        const onRequest = vi.fn()
        const message = createAiAgentMessage(
            mockTicketMessage({
                id: 10,
                created_datetime: '2024-03-21T11:00:00Z',
                channel: 'chat',
                public: true,
                from_agent: true,
                via: 'api',
                actions: [
                    {
                        name: 'addTags',
                        arguments: { tags: 'customer-follow-up' },
                    },
                ],
            }) as TicketMessage,
        )

        server.use(
            mockListTicketTagsHandler(async ({ request }) => {
                onRequest({ ticketId: getTicketIdFromRequest(request) })

                return HttpResponse.json({ data: null } as never)
            }).handler,
        )

        const { result } = renderHook(
            () =>
                useTicketThreadAiAgentPseudoEvents({
                    ticketId: 10,
                    messages: [message],
                    persistedItems: [message],
                    showTicketEvents: false,
                }),
            { queryClient: createTestQueryClient() },
        )

        await waitFor(() => {
            expect(result.current[0]).toHaveProperty(
                'data.decorations.aiAgentPseudoEvent.tags',
                [{ name: 'customer-follow-up', decoration: null }],
            )
        })
        expect(onRequest).toHaveBeenCalledTimes(1)
        expect(onRequest).toHaveBeenCalledWith({ ticketId: 10 })
    })

    it('returns the original messages and disables the tag query when ticket events are visible', () => {
        const message = createAiAgentMessage(
            mockTicketMessage({
                id: 7,
                created_datetime: '2024-03-21T11:00:00Z',
                channel: 'chat',
                public: true,
                from_agent: true,
                via: 'api',
                actions: [
                    {
                        name: 'setStatus',
                        arguments: { status: TicketStatus.Closed },
                    },
                ],
            }) as TicketMessage,
        )

        const { result } = renderHook(
            () =>
                useTicketThreadAiAgentPseudoEvents({
                    ticketId: 7,
                    messages: [message],
                    persistedItems: [message],
                    showTicketEvents: true,
                }),
            { queryClient: createTestQueryClient() },
        )

        expect(result.current).toEqual([message])
    })

    it('returns the original messages and disables the tag query when there are no AI messages', () => {
        const message = createRegularMessage(
            mockTicketMessage({
                id: 9,
                created_datetime: '2024-03-21T11:00:00Z',
                channel: 'chat',
                public: true,
                from_agent: true,
                via: 'api',
            }) as TicketMessage,
        )

        const { result } = renderHook(
            () =>
                useTicketThreadAiAgentPseudoEvents({
                    ticketId: 9,
                    messages: [message],
                    persistedItems: [message],
                    showTicketEvents: false,
                }),
            { queryClient: createTestQueryClient() },
        )

        expect(result.current).toEqual([message])
    })

    it('still decorates action-only pseudo-events when ticket id is missing', () => {
        const message = createAiAgentMessage(
            mockTicketMessage({
                id: 11,
                created_datetime: '2024-03-21T11:00:00Z',
                channel: 'chat',
                public: true,
                from_agent: true,
                via: 'api',
                actions: [
                    {
                        name: 'setStatus',
                        arguments: { status: TicketStatus.Closed },
                    },
                ],
            }) as TicketMessage,
        )

        const { result } = renderHook(
            () =>
                useTicketThreadAiAgentPseudoEvents({
                    ticketId: 0,
                    messages: [message],
                    persistedItems: [message],
                    showTicketEvents: false,
                }),
            { queryClient: createTestQueryClient() },
        )

        expect(result.current[0]).toHaveProperty(
            'data.decorations.aiAgentPseudoEvent.action',
            'close',
        )
    })

    it('skips AI messages without numeric ids when building pseudo-events', async () => {
        const onRequest = vi.fn()
        const message = createAiAgentMessage(
            mockTicketMessage({
                id: 'not-a-number' as never,
                created_datetime: '2024-03-21T11:00:00Z',
                channel: 'chat',
                public: true,
                from_agent: true,
                via: 'api',
                actions: [
                    {
                        name: 'setStatus',
                        arguments: { status: TicketStatus.Closed },
                    },
                ],
            }) as TicketMessage,
        )

        server.use(
            mockListTicketTagsHandler(async ({ request }) => {
                onRequest({ ticketId: getTicketIdFromRequest(request) })

                return HttpResponse.json(mockListTicketTagsResponse())
            }).handler,
        )

        const { result } = renderHook(
            () =>
                useTicketThreadAiAgentPseudoEvents({
                    ticketId: 12,
                    messages: [message],
                    persistedItems: [message],
                    showTicketEvents: false,
                }),
            { queryClient: createTestQueryClient() },
        )

        await waitFor(() => {
            expect(result.current).toEqual([message])
        })
        expect(onRequest).toHaveBeenCalledTimes(1)
        expect(onRequest).toHaveBeenCalledWith({ ticketId: 12 })
    })
})
