import { QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    queryKeys,
    useDeleteCustomUserAvailabilityStatus,
} from '@gorgias/helpdesk-queries'

import {
    createTestQueryClient,
    getMutationConfig,
    renderHook,
} from '../../tests/render.utils'
import { useDeleteCustomUserAvailabilityStatus as useDeleteStatusHook } from '../useDeleteCustomUserAvailabilityStatus'

type DeleteStatusConfig = NonNullable<
    Parameters<typeof useDeleteCustomUserAvailabilityStatus>[0]
>

vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query')
    return {
        ...actual,
        useQueryClient: vi.fn(),
    }
})

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual('@gorgias/helpdesk-queries')
    return {
        ...actual,
        useDeleteCustomUserAvailabilityStatus: vi.fn(),
    }
})

describe('useDeleteCustomUserAvailabilityStatus', () => {
    const listKey =
        queryKeys.customUserAvailabilityStatus.listCustomUserAvailabilityStatuses()

    beforeEach(() => {
        vi.clearAllMocks()
        ;(window as any).CSRF_TOKEN = 'test-csrf-token'
    })

    it('should optimistically remove status from cache and return previous state', async () => {
        const { queryClient, spies } = createTestQueryClient({
            withCancelQueriesSpy: true,
        })

        const mockStatuses = {
            data: {
                data: [
                    { id: 'status-1', name: 'Lunch' },
                    { id: 'status-2', name: 'Break' },
                ],
            },
        }
        queryClient.setQueryData(listKey, mockStatuses)

        vi.mocked(useQueryClient).mockReturnValue(queryClient)
        renderHook(() => useDeleteStatusHook(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        const config = getMutationConfig<DeleteStatusConfig>(
            vi.mocked(useDeleteCustomUserAvailabilityStatus),
        )
        const context = await config?.mutation?.onMutate?.({ pk: 'status-1' })

        expect(spies.cancelQueries).toHaveBeenCalledWith({ queryKey: listKey })

        const updatedData =
            queryClient.getQueryData<typeof mockStatuses>(listKey)
        expect(updatedData?.data?.data).toHaveLength(1)
        expect(updatedData?.data?.data[0].id).toBe('status-2')
        expect(context).toEqual({ previousStatuses: mockStatuses })
    })

    it('should rollback cache on error with provided statuses in error handler', () => {
        const { queryClient } = createTestQueryClient()
        const mockStatuses = {
            data: { data: [{ id: 'status-1', name: 'Lunch' }] },
        }

        vi.mocked(useQueryClient).mockReturnValue(queryClient)
        renderHook(() => useDeleteStatusHook(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        expect(queryClient.getQueryData(listKey)).toBeUndefined()

        const config = getMutationConfig<DeleteStatusConfig>(
            vi.mocked(useDeleteCustomUserAvailabilityStatus),
        )
        config?.mutation?.onError?.(
            new Error(),
            { pk: 'status-1' },
            { previousStatuses: mockStatuses },
        )

        expect(queryClient.getQueryData(listKey)).toEqual(mockStatuses)
    })

    it('should invalidate queries on settled', () => {
        const { queryClient, spies } = createTestQueryClient({
            withInvalidateQueriesSpy: true,
        })

        vi.mocked(useQueryClient).mockReturnValue(queryClient)
        renderHook(() => useDeleteStatusHook(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        const config = getMutationConfig<DeleteStatusConfig>(
            vi.mocked(useDeleteCustomUserAvailabilityStatus),
        )
        config?.mutation?.onSettled?.(
            undefined,
            null,
            { pk: 'status-1' },
            undefined,
        )

        expect(spies.invalidateQueries).toHaveBeenCalledWith({
            queryKey: listKey,
        })
    })
})
