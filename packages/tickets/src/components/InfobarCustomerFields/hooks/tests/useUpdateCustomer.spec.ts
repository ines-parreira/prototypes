import { screen, waitFor } from '@testing-library/react'

import { useUpdateCustomer as useUpdateCustomerPrimitive } from '@gorgias/helpdesk-queries'
import type * as helpdeskQueriesModule from '@gorgias/helpdesk-queries'

import { renderHook } from '../../../../tests/render.utils'
import { useUpdateCustomer } from '../useUpdateCustomer'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueriesModule>(
        '@gorgias/helpdesk-queries',
    )

    return {
        ...actual,
        useUpdateCustomer: vi.fn(),
    }
})

const mockedUseUpdateCustomerPrimitive = vi.mocked(useUpdateCustomerPrimitive)

describe('useUpdateCustomer', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show error toast on failure', async () => {
        const mutateAsync = vi.fn().mockRejectedValue(new Error('fail'))
        mockedUseUpdateCustomerPrimitive.mockReturnValue({
            mutateAsync,
            isLoading: false,
        } as any)

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
