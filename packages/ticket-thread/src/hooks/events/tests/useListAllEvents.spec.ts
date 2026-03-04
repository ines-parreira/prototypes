import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import { ObjectType } from '@gorgias/helpdesk-client'
import {
    mockEvent,
    mockListEventsHandler,
    mockListEventsResponse,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { useListAllTicketEvents } from '../useListAllEvents'

describe('useListAllTicketEvents', () => {
    it('fetches ticket events with expected request parameters', async () => {
        const event = mockEvent({
            id: 901,
            object_id: 123,
            object_type: ObjectType.Ticket,
            type: 'ticket-updated',
        })
        const mockListEvents = mockListEventsHandler(async () =>
            HttpResponse.json(
                mockListEventsResponse({
                    data: [event],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                    },
                }),
            ),
        )
        const waitForListEventsRequest = mockListEvents.waitForRequest(server)

        server.use(mockListEvents.handler)

        const { result } = renderHook(() => useListAllTicketEvents(123))

        await waitForListEventsRequest((request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('object_id')).toBe('123')
            expect(url.searchParams.get('object_type')).toBe(ObjectType.Ticket)
            expect(url.searchParams.get('limit')).toBe('100')
        })

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })
        expect(result.current.data[0]?.id).toBe(901)
    })
})
