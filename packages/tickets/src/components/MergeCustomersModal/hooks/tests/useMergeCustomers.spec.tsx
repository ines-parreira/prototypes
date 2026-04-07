import { screen, waitFor } from '@testing-library/react'

import {
    queryKeys,
    useMergeCustomers as useMergeCustomersPrimitive,
} from '@gorgias/helpdesk-queries'
import type * as helpdeskQueriesModule from '@gorgias/helpdesk-queries'

import {
    createTestQueryClient,
    renderHook,
} from '../../../../tests/render.utils'
import { useMergeCustomers } from '../useMergeCustomers'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueriesModule>(
        '@gorgias/helpdesk-queries',
    )

    return {
        ...actual,
        useMergeCustomers: vi.fn(),
    }
})

const mockedUseMergeCustomersPrimitive = vi.mocked(useMergeCustomersPrimitive)

describe('useMergeCustomers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should merge customers and update cache on success', async () => {
        const mutateAsync = vi.fn().mockResolvedValue(undefined)
        mockedUseMergeCustomersPrimitive.mockReturnValue({
            mutateAsync,
            isLoading: false,
        } as any)

        const queryClient = createTestQueryClient()

        const invalidateQueries = vi
            .spyOn(queryClient, 'invalidateQueries')
            .mockResolvedValue(undefined)
        const removeQueries = vi.spyOn(queryClient, 'removeQueries')

        const { result } = renderHook(() => useMergeCustomers(123), {
            queryClient,
        })

        const data = {
            name: 'Merged Name',
            email: 'merged@example.com',
            channels: [],
            note: 'Merged note',
            meta: {},
        }

        const params = {
            source_id: 2,
            target_id: 1,
        }

        await result.current.mergeCustomers(data as any, params as any)

        expect(mutateAsync).toHaveBeenCalledWith({ data, params })
        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: queryKeys.customers.getCustomer(1),
        })
        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: queryKeys.tickets.getTicket(123),
        })
        expect(removeQueries).toHaveBeenCalledWith({
            queryKey: queryKeys.customers.getCustomer(2),
        })
        await waitFor(() => {
            const toast = screen.getByRole('status', { hidden: true })
            expect(toast).toHaveTextContent('Customers successfully merged.')
            expect(toast).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show error toast and rethrow when merge fails', async () => {
        const error = new Error('merge failed')
        const mutateAsync = vi.fn().mockRejectedValue(error)
        mockedUseMergeCustomersPrimitive.mockReturnValue({
            mutateAsync,
            isLoading: false,
        } as any)

        const queryClient = createTestQueryClient()

        const { result } = renderHook(() => useMergeCustomers(123), {
            queryClient,
        })

        await expect(
            result.current.mergeCustomers(
                {} as any,
                {
                    source_id: 2,
                    target_id: 1,
                } as any,
            ),
        ).rejects.toThrow('merge failed')

        await waitFor(() => {
            const toast = screen.getByRole('status', { hidden: true })
            expect(toast).toHaveTextContent('Could not merge customers')
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
