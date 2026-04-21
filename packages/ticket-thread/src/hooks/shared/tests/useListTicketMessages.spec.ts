import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListMessagesHandler,
    mockListMessagesResponse,
    mockTicketMessage,
} from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { createTestQueryClient, renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { useListTicketMessages } from '../useListTicketMessages'

describe('useListTicketMessages', () => {
    it('returns an empty array before the query resolves and then exposes the fetched messages', async () => {
        const ticketMessage = mockTicketMessage({
            id: 901,
            created_datetime: '2024-03-21T11:00:00Z',
        } as any)
        const mockListTicketMessages = mockListMessagesHandler(async () =>
            HttpResponse.json(
                mockListMessagesResponse({
                    data: [ticketMessage],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                        total_resources: 1,
                    },
                }),
            ),
        )
        const waitForListMessagesRequest =
            mockListTicketMessages.waitForRequest(server)

        server.use(mockListTicketMessages.handler)

        const { result } = renderHook(() =>
            useListTicketMessages({ ticketId: 123 }),
        )

        expect(result.current).toEqual([])

        await waitForListMessagesRequest((request) => {
            const url = new URL(request.url)

            expect(url.searchParams.get('ticket_id')).toBe('123')
        })

        await waitFor(() => {
            expect(result.current).toHaveLength(1)
        })
        expect(result.current[0]?.id).toBe(901)
    })

    it('returns an empty array when the API has no messages', async () => {
        const mockListTicketMessages = mockListMessagesHandler(async () =>
            HttpResponse.json(
                mockListMessagesResponse({
                    data: [],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                        total_resources: 0,
                    },
                }),
            ),
        )

        server.use(mockListTicketMessages.handler)

        const { result } = renderHook(() =>
            useListTicketMessages({ ticketId: 999 }),
        )

        await waitFor(() => {
            expect(result.current).toEqual([])
        })
    })

    it('fetches every messages page so older ticket messages are not dropped', async () => {
        const newestMessage = mockTicketMessage({
            id: 902,
            created_datetime: '2024-03-21T12:00:00Z',
        } as any)
        const oldestMessage = mockTicketMessage({
            id: 901,
            created_datetime: '2024-03-21T11:00:00Z',
        } as any)
        const seenCursors: string[] = []
        const mockListTicketMessages = mockListMessagesHandler(
            async ({ request }) => {
                const url = new URL(request.url)
                const cursor = url.searchParams.get('cursor') ?? 'initial'

                expect(url.searchParams.get('ticket_id')).toBe('321')
                expect(url.searchParams.get('limit')).toBe('100')

                seenCursors.push(cursor)

                if (cursor === 'cursor-2') {
                    return HttpResponse.json(
                        mockListMessagesResponse({
                            data: [oldestMessage],
                            meta: {
                                prev_cursor: 'cursor-1',
                                next_cursor: null,
                                total_resources: 2,
                            },
                        }),
                    )
                }

                return HttpResponse.json(
                    mockListMessagesResponse({
                        data: [newestMessage],
                        meta: {
                            prev_cursor: null,
                            next_cursor: 'cursor-2',
                            total_resources: 2,
                        },
                    }),
                )
            },
        )

        server.use(mockListTicketMessages.handler)

        const { result } = renderHook(() =>
            useListTicketMessages({ ticketId: 321 }),
        )

        await waitFor(() => {
            expect(result.current.map((message) => message.id)).toEqual([
                902, 901,
            ])
        })

        expect(seenCursors).toEqual(['initial', 'cursor-2'])
    })

    it('keeps pending handoff messages visible when the exhausted cache is updated', async () => {
        const persistedMessage = mockTicketMessage({
            id: 901,
            created_datetime: '2024-03-21T11:00:00Z',
        } as any)
        const handoffMessage = mockTicketMessage({
            id: 902,
            created_datetime: '2024-03-21T12:00:00Z',
        } as any)
        const queryClient = createTestQueryClient()
        const mockListTicketMessages = mockListMessagesHandler(async () =>
            HttpResponse.json(
                mockListMessagesResponse({
                    data: [persistedMessage],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                        total_resources: 1,
                    },
                }),
            ),
        )

        server.use(mockListTicketMessages.handler)

        const { result } = renderHook(
            () => useListTicketMessages({ ticketId: 654 }),
            {
                queryClient,
            },
        )

        await waitFor(() => {
            expect(result.current.map((message) => message.id)).toEqual([901])
        })

        act(() => {
            queryClient.setQueryData(
                queryKeys.ticketMessages.listAllMessages({
                    ticket_id: 654,
                    limit: 100,
                }),
                {
                    pageParams: [undefined],
                    pages: [
                        {
                            data: {
                                data: [handoffMessage, persistedMessage],
                                meta: {
                                    prev_cursor: null,
                                    next_cursor: null,
                                    total_resources: 2,
                                },
                            },
                        },
                    ],
                },
            )
        })

        await waitFor(() => {
            expect(result.current.map((message) => message.id)).toEqual([
                902, 901,
            ])
        })
    })
})
