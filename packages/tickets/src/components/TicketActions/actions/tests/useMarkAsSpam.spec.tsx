import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockUpdateTicketHandler,
    mockUpdateTicketResponse,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../../tests/render.utils'
import { server } from '../../../../tests/server'

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

import { useMarkAsSpam } from '../useMarkAsSpam'

vi.mock('../../../../hooks/useTicketViewNavigation', () => ({
    useTicketViewNavigation: vi.fn(() => ({
        navigateToTicket: vi.fn(),
        handleGoToNextViewTicket: vi.fn(),
    })),
}))

describe('useMarkAsSpam', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show success toast when marking as spam', async () => {
        server.use(
            mockUpdateTicketHandler(async () =>
                HttpResponse.json(mockUpdateTicketResponse()),
            ).handler,
        )

        const { result } = renderHook(() => useMarkAsSpam(1))

        await result.current.markAsSpam(1, { spam: true })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Ticket has been marked as spam',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show error toast when marking as spam fails', async () => {
        server.use(
            mockUpdateTicketHandler(async () =>
                HttpResponse.json({ error: { msg: 'fail' } } as any, {
                    status: 500,
                }),
            ).handler,
        )

        const { result } = renderHook(() => useMarkAsSpam(1))

        await result.current.markAsSpam(1, { spam: true })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to mark as spam',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
