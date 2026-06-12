import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import { mockUpdateTicketHandler } from '@gorgias/helpdesk-mocks'

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

import { useUpdateTicketTeam } from '../useUpdateTicketTeam'

describe('useUpdateTicketTeam', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show error toast on failure', async () => {
        server.use(
            mockUpdateTicketHandler(async () =>
                HttpResponse.json({ error: { msg: 'fail' } } as any, {
                    status: 500,
                }),
            ).handler,
        )

        const { result } = renderHook(() => useUpdateTicketTeam(123))

        await result.current.updateTicketTeam({ id: 1 } as any)

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to update team assignment',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
