import { screen, waitFor } from '@testing-library/react'

import type * as helpdeskQueriesModule from '@gorgias/helpdesk-queries'
import { useUpdateTicket } from '@gorgias/helpdesk-queries'

import { renderHook } from '../../../../tests/render.utils'
import { useUpdateTicketCustomer } from '../useUpdateTicketCustomer'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueriesModule>(
        '@gorgias/helpdesk-queries',
    )

    return {
        ...actual,
        useUpdateTicket: vi.fn(),
    }
})

const mockedUseUpdateTicket = vi.mocked(useUpdateTicket)

describe('useUpdateTicketCustomer', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show error toast when update fails', async () => {
        const mutateAsync = vi.fn().mockRejectedValue(new Error('fail'))
        mockedUseUpdateTicket.mockReturnValue({
            mutateAsync,
            isLoading: false,
        } as any)

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
