import { screen, waitFor } from '@testing-library/react'

import { useUpdateTicket } from '@gorgias/helpdesk-queries'
import type * as helpdeskQueriesModule from '@gorgias/helpdesk-queries'

import { renderHook } from '../../../../tests/render.utils'
import { useUpdateTicketTeam } from '../useUpdateTicketTeam'

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

describe('useUpdateTicketTeam', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show error toast on failure', async () => {
        const mutateAsync = vi.fn().mockRejectedValue(new Error('fail'))
        mockedUseUpdateTicket.mockReturnValue({
            mutateAsync,
            isLoading: false,
        } as any)

        const { result } = renderHook(() => useUpdateTicketTeam(123))

        await result.current.updateTicketTeam({ id: 1 } as any)

        await waitFor(() => {
            const toast = screen.getByRole('status', { hidden: true })
            expect(toast).toHaveTextContent('Failed to update team assignment')
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
