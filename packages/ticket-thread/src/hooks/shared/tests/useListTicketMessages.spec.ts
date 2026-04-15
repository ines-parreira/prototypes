import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListMessagesHandler,
    mockListMessagesResponse,
    mockTicketMessage,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../tests/render.utils'
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
})
