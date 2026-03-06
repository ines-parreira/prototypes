import { setupServer } from 'msw/node'

import { mockUpdateTicketHandler } from '@gorgias/helpdesk-mocks'

import { renderHook, testAppQueryClient } from '../../../tests/render.utils'
import { useMarkTicketAsRead } from '../useMarkTicketAsRead'

const mockUpdateTicket = mockUpdateTicketHandler()

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testAppQueryClient.clear()
    server.use(mockUpdateTicket.handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useMarkTicketAsRead', () => {
    it('calls PATCH /api/tickets/{id} with is_unread: false', async () => {
        const { result } = renderHook(() => useMarkTicketAsRead())

        const waitForRequest = mockUpdateTicket.waitForRequest(server)
        result.current.markAsRead(42)

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body).toMatchObject({ is_unread: false })
        })
    })
})
