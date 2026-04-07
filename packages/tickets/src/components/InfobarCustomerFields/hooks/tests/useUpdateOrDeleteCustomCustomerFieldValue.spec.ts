import { screen, waitFor } from '@testing-library/react'

import type * as helpdeskQueriesModule from '@gorgias/helpdesk-queries'
import {
    useDeleteCustomerCustomFieldValue,
    useUpdateCustomerCustomFieldValue,
} from '@gorgias/helpdesk-queries'

import {
    createTestQueryClient,
    renderHook,
} from '../../../../tests/render.utils'
import { useUpdateOrDeleteCustomCustomerFieldValue } from '../useUpdateOrDeleteCustomCustomerFieldValue'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueriesModule>(
        '@gorgias/helpdesk-queries',
    )

    return {
        ...actual,
        useUpdateCustomerCustomFieldValue: vi.fn(),
        useDeleteCustomerCustomFieldValue: vi.fn(),
        useListCustomerCustomFieldsValues: vi.fn(() => ({ data: undefined })),
    }
})

const mockedUseUpdateCustomerCustomFieldValue = vi.mocked(
    useUpdateCustomerCustomFieldValue,
)
const mockedUseDeleteCustomerCustomFieldValue = vi.mocked(
    useDeleteCustomerCustomFieldValue,
)

describe('useUpdateOrDeleteCustomCustomerFieldValue', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show error toast when update fails', async () => {
        const mutateAsyncUpdate = vi.fn().mockRejectedValue(new Error('fail'))
        const mutateAsyncDelete = vi.fn().mockResolvedValue(undefined)
        mockedUseUpdateCustomerCustomFieldValue.mockReturnValue({
            mutateAsync: mutateAsyncUpdate,
        } as any)
        mockedUseDeleteCustomerCustomFieldValue.mockReturnValue({
            mutateAsync: mutateAsyncDelete,
        } as any)

        const queryClient = createTestQueryClient()
        const { result } = renderHook(
            () => useUpdateOrDeleteCustomCustomerFieldValue(123),
            { queryClient },
        )

        await result.current.updateOrDeleteCustomerFieldValue({
            fieldId: 1,
            value: 'some value',
        })

        await waitFor(() => {
            const toast = screen.getByRole('status', { hidden: true })
            expect(toast).toHaveTextContent('Failed to update customer field')
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
