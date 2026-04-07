import { screen, waitFor } from '@testing-library/react'

import type * as helpdeskQueriesModule from '@gorgias/helpdesk-queries'
import { useUpdateTicket } from '@gorgias/helpdesk-queries'

import {
    createTestQueryClient,
    renderHook,
} from '../../../../tests/render.utils'
import { useMarkAsSpam } from '../useMarkAsSpam'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueriesModule>(
        '@gorgias/helpdesk-queries',
    )

    return {
        ...actual,
        useUpdateTicket: vi.fn(),
    }
})

vi.mock('../../../../hooks/useTicketViewNavigation', () => ({
    useTicketViewNavigation: vi.fn(() => ({
        navigateToTicket: vi.fn(),
        handleGoToNextViewTicket: vi.fn(),
    })),
}))

const mockedUseUpdateTicket = vi.mocked(useUpdateTicket)

describe('useMarkAsSpam', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show success toast when marking as spam', async () => {
        const mutateAsync = vi.fn().mockResolvedValue(undefined)
        mockedUseUpdateTicket.mockReturnValue({
            mutateAsync,
        } as any)

        const queryClient = createTestQueryClient()
        const { result } = renderHook(() => useMarkAsSpam(1), {
            queryClient,
        })

        await result.current.markAsSpam(1, { spam: true })

        await waitFor(() => {
            const toast = screen.getByRole('status', { hidden: true })
            expect(toast).toHaveTextContent('Ticket has been marked as spam')
            expect(toast).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show error toast when marking as spam fails', async () => {
        const mutateAsync = vi.fn().mockRejectedValue(new Error('fail'))
        mockedUseUpdateTicket.mockReturnValue({
            mutateAsync,
        } as any)

        const queryClient = createTestQueryClient()
        const { result } = renderHook(() => useMarkAsSpam(1), {
            queryClient,
        })

        await result.current.markAsSpam(1, { spam: true })

        await waitFor(() => {
            const toast = screen.getByRole('status', { hidden: true })
            expect(toast).toHaveTextContent('Failed to mark as spam')
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
