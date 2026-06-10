import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockGetTicketHandler,
    mockTicket,
    mockTicketUser,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../tests/render.utils'
import { server } from '../../tests/server'
import { useGetTicket } from '../useGetTicket'

const ticketId = 123
const assignedUser = mockTicketUser({
    id: 1,
    name: 'Current User',
    email: 'current@example.com',
})
const newerAssignedTicket = mockTicket({
    id: ticketId,
    assignee_user: assignedUser,
    updated_datetime: '2026-06-08T10:00:00Z',
})
const staleUnassignedTicket = mockTicket({
    id: ticketId,
    assignee_user: null,
    updated_datetime: '2026-06-08T09:59:00Z',
})

let ticketResponse = newerAssignedTicket

const mockGetTicket = mockGetTicketHandler(async () =>
    HttpResponse.json(ticketResponse),
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    ticketResponse = newerAssignedTicket
    server.use(mockGetTicket.handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useGetTicket', () => {
    it('keeps newer cached ticket data when a stale response arrives', async () => {
        const { result } = renderHook(() => useGetTicket(ticketId))

        await waitFor(() => {
            expect(result.current.data?.data.assignee_user?.name).toBe(
                'Current User',
            )
        })

        ticketResponse = staleUnassignedTicket
        await result.current.refetch()

        await waitFor(() => {
            expect(result.current.data?.data.assignee_user?.name).toBe(
                'Current User',
            )
        })
    })

    it('lets callers opt out of preserving newer cached ticket data', async () => {
        const { result } = renderHook(() =>
            useGetTicket(ticketId, undefined, {
                query: {
                    structuralSharing: false,
                },
            }),
        )

        await waitFor(() => {
            expect(result.current.data?.data.assignee_user?.name).toBe(
                'Current User',
            )
        })

        ticketResponse = staleUnassignedTicket
        await result.current.refetch()

        await waitFor(() => {
            expect(result.current.data?.data.assignee_user).toBeNull()
        })
    })
})
