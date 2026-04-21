import { screen, waitFor } from '@testing-library/react'

import { useUpdateTicket } from '@gorgias/helpdesk-queries'
import type * as helpdeskQueriesModule from '@gorgias/helpdesk-queries'

import { renderHook } from '../../../../tests/render.utils'
import { useUpdateSubject } from '../useUpdateSubject'

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

describe('useUpdateSubject', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show error toast on failure', async () => {
        const mutateAsync = vi.fn().mockRejectedValue(new Error('fail'))
        mockedUseUpdateTicket.mockReturnValue({
            mutateAsync,
            isLoading: false,
        } as any)

        const { result } = renderHook(() => useUpdateSubject(123))

        await result.current.updateSubject(123, 'new subject')

        await waitFor(() => {
            const toast = screen.getByRole('status', { hidden: true })
            expect(toast).toHaveTextContent('Failed to update subject')
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
