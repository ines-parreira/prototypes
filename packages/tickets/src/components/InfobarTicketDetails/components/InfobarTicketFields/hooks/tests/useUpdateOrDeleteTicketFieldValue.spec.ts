import { screen, waitFor } from '@testing-library/react'

import {
    createTestQueryClient,
    renderHook,
} from '../../../../../../tests/render.utils'
import { useDeleteTicketFieldValue } from '../useDeleteTicketFieldValue'
import { useUpdateOrDeleteTicketFieldValue } from '../useUpdateOrDeleteTicketFieldValue'
import { useUpdateTicketFieldValue } from '../useUpdateTicketFieldValue'

vi.mock('../useUpdateTicketFieldValue', () => ({
    useUpdateTicketFieldValue: vi.fn(() => ({
        mutateAsync: vi.fn().mockResolvedValue(undefined),
    })),
}))

vi.mock('../useDeleteTicketFieldValue', () => ({
    useDeleteTicketFieldValue: vi.fn(() => ({
        mutateAsync: vi.fn().mockResolvedValue(undefined),
    })),
}))

vi.mock('../useTicketCustomFieldsValues', () => ({
    useTicketCustomFieldsValues: vi.fn(() => ({
        data: { data: [] },
    })),
}))

const mockedUseUpdateTicketFieldValue = vi.mocked(useUpdateTicketFieldValue)
const mockedUseDeleteTicketFieldValue = vi.mocked(useDeleteTicketFieldValue)

describe('useUpdateOrDeleteTicketFieldValue', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show error toast when update fails', async () => {
        const mutateAsyncUpdate = vi.fn().mockRejectedValue(new Error('fail'))
        mockedUseUpdateTicketFieldValue.mockReturnValue({
            mutateAsync: mutateAsyncUpdate,
        } as any)
        mockedUseDeleteTicketFieldValue.mockReturnValue({
            mutateAsync: vi.fn().mockResolvedValue(undefined),
        } as any)

        const queryClient = createTestQueryClient()
        const { result } = renderHook(
            () => useUpdateOrDeleteTicketFieldValue(123),
            { queryClient },
        )

        await result.current.updateOrDeleteCustomerFieldValue({
            fieldId: 1,
            value: 'some value',
        })

        await waitFor(() => {
            const toast = screen.getByRole('status', { hidden: true })
            expect(toast).toHaveTextContent('Failed to update ticket field')
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
