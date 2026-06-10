import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockGetTicketHandler,
    mockTicket,
    mockUpdateTicketHandler,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { useGetTicket } from '../../../../hooks/useGetTicket'
import { renderHook } from '../../../../tests/render.utils'
import { server } from '../../../../tests/server'
import { useUpdateTicketUser } from '../useUpdateTicketUser'

const ticketId = 123
const currentUser = mockUser({
    id: 1,
    name: 'Current User',
    email: 'current@example.com',
})
const staleUnassignedTicket = mockTicket({
    id: ticketId,
    assignee_user: null,
    updated_datetime: '2026-06-08T09:59:00Z',
})
const updateTicketResponse = mockTicket({
    id: ticketId,
    assignee_user: null,
    updated_datetime: '2026-06-08T10:00:00Z',
})

let getTicketRequestCount = 0
let updateTicketRequestBody: unknown

const mockGetTicket = mockGetTicketHandler(async () => {
    getTicketRequestCount += 1
    return HttpResponse.json(staleUnassignedTicket)
})
const mockUpdateTicket = mockUpdateTicketHandler(async ({ request }) => {
    updateTicketRequestBody = await request.json()
    return HttpResponse.json(updateTicketResponse)
})

function useTicketAssignmentHarness() {
    const ticket = useGetTicket(ticketId)
    const { updateTicketUser } = useUpdateTicketUser(ticketId)
    const assigneeName = ticket.data?.data.assignee_user?.name ?? 'Unassigned'

    return {
        assigneeName,
        updateTicketUser,
    }
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    getTicketRequestCount = 0
    updateTicketRequestBody = undefined
    server.use(mockGetTicket.handler, mockUpdateTicket.handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useUpdateTicketUser', () => {
    it('keeps self assignment visible when the follow-up ticket refetch is stale', async () => {
        const { result } = renderHook(useTicketAssignmentHarness)

        await waitFor(() => {
            expect(result.current.assigneeName).toBe('Unassigned')
        })

        await act(async () => {
            await result.current.updateTicketUser(currentUser)
        })

        await waitFor(() => {
            expect(updateTicketRequestBody).toEqual({
                assignee_user: { id: currentUser.id },
            })
            expect(getTicketRequestCount).toBeGreaterThan(1)
            expect(result.current.assigneeName).toBe('Current User')
        })
    })

    it('should show error toast on failure', async () => {
        server.use(
            mockUpdateTicketHandler(async () =>
                HttpResponse.json(null, { status: 500 }),
            ).handler,
        )

        const { result } = renderHook(() => useUpdateTicketUser(ticketId))

        await act(async () => {
            await result.current.updateTicketUser({ id: 1 } as any)
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to update user assignment',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
