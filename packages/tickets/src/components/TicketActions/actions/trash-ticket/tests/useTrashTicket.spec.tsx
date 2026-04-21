import { screen, waitFor } from '@testing-library/react'

import type * as helpdeskQueriesModule from '@gorgias/helpdesk-queries'
import { useUpdateTicket } from '@gorgias/helpdesk-queries'

import { renderHook } from '../../../../../tests/render.utils'
import { useTrashTicket } from '../useTrashTicket'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueriesModule>(
        '@gorgias/helpdesk-queries',
    )

    return {
        ...actual,
        useUpdateTicket: vi.fn(),
    }
})

vi.mock('../../../../../hooks/useTicketViewNavigation', () => ({
    useTicketViewNavigation: vi.fn(() => ({
        navigateToTicket: vi.fn(),
        handleGoToNextViewTicket: vi.fn(),
    })),
}))

const mockedUseUpdateTicket = vi.mocked(useUpdateTicket)

describe('useTrashTicket', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show success toast when trashing a ticket', async () => {
        const mutateAsync = vi.fn().mockResolvedValue(undefined)
        mockedUseUpdateTicket.mockReturnValue({
            mutateAsync,
        } as any)

        const { result } = renderHook(() => useTrashTicket(1))

        await result.current.trashTicket(1, {
            trashed_datetime: '2024-01-01',
        })

        await waitFor(() => {
            const toast = screen.getByRole('status', { hidden: true })
            expect(toast).toHaveTextContent('Ticket has been moved to trash')
            expect(toast).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show error toast when trashing fails', async () => {
        const mutateAsync = vi.fn().mockRejectedValue(new Error('fail'))
        mockedUseUpdateTicket.mockReturnValue({
            mutateAsync,
        } as any)

        const { result } = renderHook(() => useTrashTicket(1))

        await result.current.trashTicket(1, {
            trashed_datetime: '2024-01-01',
        })

        await waitFor(() => {
            const toast = screen.getByRole('status', { hidden: true })
            expect(toast).toHaveTextContent('Failed to move to trash')
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
