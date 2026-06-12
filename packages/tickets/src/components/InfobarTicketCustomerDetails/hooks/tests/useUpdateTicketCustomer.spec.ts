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

import { useUpdateTicketCustomer } from '../useUpdateTicketCustomer'

describe('useUpdateTicketCustomer', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show error toast when update fails', async () => {
        server.use(
            mockUpdateTicketHandler(async () =>
                HttpResponse.json({ error: { msg: 'fail' } } as any, {
                    status: 500,
                }),
            ).handler,
        )

        const { result } = renderHook(() => useUpdateTicketCustomer('123'))

        const didUpdate = await result.current.updateTicketCustomer({
            id: 456,
        } as any)

        expect(didUpdate).toBe(false)

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to update ticket customer',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
