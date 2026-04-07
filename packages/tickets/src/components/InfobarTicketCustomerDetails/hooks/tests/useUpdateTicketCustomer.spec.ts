import { screen, waitFor } from '@testing-library/react'

import type * as helpdeskQueriesModule from '@gorgias/helpdesk-queries'
import { useUpdateTicket } from '@gorgias/helpdesk-queries'

import {
    createTestQueryClient,
    renderHook,
} from '../../../../tests/render.utils'
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

        const queryClient = createTestQueryClient()
        const { result } = renderHook(() => useUpdateTicketCustomer('123'), {
            queryClient,
        })

        await result.current.updateTicketCustomer({ id: 456 } as any)

        await waitFor(() => {
            const toast = screen.getByRole('status', { hidden: true })
            expect(toast).toHaveTextContent('Failed to update ticket customer')
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
