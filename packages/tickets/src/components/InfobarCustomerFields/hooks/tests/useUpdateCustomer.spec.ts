import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import { mockUpdateCustomerHandler } from '@gorgias/helpdesk-mocks'

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

import { useUpdateCustomer } from '../useUpdateCustomer'

describe('useUpdateCustomer', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show error toast on failure', async () => {
        server.use(
            mockUpdateCustomerHandler(async () =>
                HttpResponse.json({ error: { msg: 'fail' } } as any, {
                    status: 500,
                }),
            ).handler,
        )

        const { result } = renderHook(() => useUpdateCustomer(456, '123'))

        await result.current.updateCustomer({ name: 'test' } as any)

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to update customer',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
