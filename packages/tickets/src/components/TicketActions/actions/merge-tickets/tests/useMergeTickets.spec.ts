import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockMergeTicketsHandler,
    mockMergeTicketsResponse,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../../../tests/render.utils'
import { server } from '../../../../../tests/server'

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

import { useMergeTickets } from '../useMergeTickets'

vi.mock('../../../../../hooks/useTicketViewNavigation', () => ({
    useTicketViewNavigation: vi.fn(() => ({
        navigateToTicket: vi.fn(),
        handleGoToNextViewTicket: vi.fn(),
    })),
}))

describe('useMergeTickets', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show success toast when merge succeeds', async () => {
        server.use(
            mockMergeTicketsHandler(async () =>
                HttpResponse.json(mockMergeTicketsResponse()),
            ).handler,
        )

        const { result } = renderHook(() => useMergeTickets(123))

        await result.current.mergeTickets(
            { source_ids: [123] } as any,
            { target_id: 456 } as any,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Tickets merged successfully',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show error toast when merge fails', async () => {
        server.use(
            mockMergeTicketsHandler(async () =>
                HttpResponse.json({ error: { msg: 'fail' } } as any, {
                    status: 500,
                }),
            ).handler,
        )

        const { result } = renderHook(() => useMergeTickets(123))

        await result.current.mergeTickets(
            { source_ids: [123] } as any,
            { target_id: 456 } as any,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Could not merge tickets',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
