import { screen, waitFor } from '@testing-library/react'

import type * as helpdeskQueriesModule from '@gorgias/helpdesk-queries'
import { useMergeTickets as useMergeTicketsPrimitive } from '@gorgias/helpdesk-queries'

import { renderHook } from '../../../../../tests/render.utils'
import { useMergeTickets } from '../useMergeTickets'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueriesModule>(
        '@gorgias/helpdesk-queries',
    )

    return {
        ...actual,
        useMergeTickets: vi.fn(),
    }
})

vi.mock('../../../../../hooks/useTicketViewNavigation', () => ({
    useTicketViewNavigation: vi.fn(() => ({
        navigateToTicket: vi.fn(),
        handleGoToNextViewTicket: vi.fn(),
    })),
}))

const mockedUseMergeTicketsPrimitive = vi.mocked(useMergeTicketsPrimitive)

describe('useMergeTickets', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show success toast when merge succeeds', async () => {
        const mutateAsync = vi.fn().mockResolvedValue(undefined)
        mockedUseMergeTicketsPrimitive.mockReturnValue({
            mutateAsync,
        } as any)

        const { result } = renderHook(() => useMergeTickets(123))

        await result.current.mergeTickets(
            { source_ids: [123] } as any,
            { target_id: 456 } as any,
        )

        await waitFor(() => {
            const toast = screen.getByRole('status', { hidden: true })
            expect(toast).toHaveTextContent('Tickets merged successfully')
            expect(toast).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show error toast when merge fails', async () => {
        const mutateAsync = vi.fn().mockRejectedValue(new Error('fail'))
        mockedUseMergeTicketsPrimitive.mockReturnValue({
            mutateAsync,
        } as any)

        const { result } = renderHook(() => useMergeTickets(123))

        await result.current.mergeTickets(
            { source_ids: [123] } as any,
            { target_id: 456 } as any,
        )

        await waitFor(() => {
            const toast = screen.getByRole('status', { hidden: true })
            expect(toast).toHaveTextContent('Could not merge tickets')
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
