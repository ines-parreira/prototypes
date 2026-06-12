import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockUpdateTicketHandler,
    mockUpdateTicketResponse,
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

import { useTrashTicket } from '../useTrashTicket'

vi.mock('../../../../../hooks/useTicketViewNavigation', () => ({
    useTicketViewNavigation: vi.fn(() => ({
        navigateToTicket: vi.fn(),
        handleGoToNextViewTicket: vi.fn(),
    })),
}))

describe('useTrashTicket', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show success toast when trashing a ticket', async () => {
        server.use(
            mockUpdateTicketHandler(async () =>
                HttpResponse.json(mockUpdateTicketResponse()),
            ).handler,
        )

        const { result } = renderHook(() => useTrashTicket(1))

        await result.current.trashTicket(1, {
            trashed_datetime: '2024-01-01',
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Ticket has been moved to trash',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show error toast when trashing fails', async () => {
        server.use(
            mockUpdateTicketHandler(async () =>
                HttpResponse.json({ error: { msg: 'fail' } } as any, {
                    status: 500,
                }),
            ).handler,
        )

        const { result } = renderHook(() => useTrashTicket(1))

        await result.current.trashTicket(1, {
            trashed_datetime: '2024-01-01',
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to move to trash',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
