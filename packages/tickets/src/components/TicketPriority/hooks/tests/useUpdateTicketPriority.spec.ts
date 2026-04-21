import { screen, waitFor } from '@testing-library/react'

import { useUpdateTicket } from '@gorgias/helpdesk-queries'
import type * as helpdeskQueriesModule from '@gorgias/helpdesk-queries'

import { renderHook } from '../../../../tests/render.utils'
import { useUpdateTicketPriority } from '../useUpdateTicketPriority'

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

describe('useUpdateTicketPriority', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show error toast on failure', async () => {
        const mutateAsync = vi.fn().mockRejectedValue(new Error('fail'))
        mockedUseUpdateTicket.mockReturnValue({
            mutateAsync,
            isLoading: false,
        } as any)

        const { result } = renderHook(() => useUpdateTicketPriority(123))

        await result.current.updateTicketPriority('high' as any)

        await waitFor(() => {
            const toast = screen.getByRole('status', { hidden: true })
            expect(toast).toHaveTextContent('Failed to update ticket priority')
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
