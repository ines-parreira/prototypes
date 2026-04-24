import { screen, waitFor } from '@testing-library/react'

import { useUpdateTicket } from '@gorgias/helpdesk-queries'
import type * as helpdeskQueriesModule from '@gorgias/helpdesk-queries'

import { renderHook } from '../../../../tests/render.utils'
import { useUpdateTicketUser } from '../useUpdateTicketUser'

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

describe('useUpdateTicketUser', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show error toast on failure', async () => {
        const mutateAsync = vi.fn().mockRejectedValue(new Error('fail'))
        mockedUseUpdateTicket.mockReturnValue({
            mutateAsync,
            isLoading: false,
        } as any)

        const { result } = renderHook(() => useUpdateTicketUser(123))

        await result.current.updateTicketUser({ id: 1 } as any)

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to update user assignment',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
