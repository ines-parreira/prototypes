import { QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { queryKeys, useUpdateUserAvailability } from '@gorgias/helpdesk-queries'

import {
    createTestQueryClient,
    getMutationConfig,
    renderHook,
} from '../../tests/render.utils'
import { useUpdateUserAvailabilityStatus } from '../useUpdateUserAvailabilityStatus'

type UpdateUserAvailabilityConfig = NonNullable<
    Parameters<typeof useUpdateUserAvailability>[0]
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
        useUpdateUserAvailability: vi.fn(),
    }
})

beforeEach(() => {
    vi.clearAllMocks()

    const { queryClient } = createTestQueryClient()
    vi.mocked(useQueryClient).mockReturnValue(queryClient)
})

describe('useUpdateUserAvailabilityStatus', () => {
    const userId = 123

    describe('updateStatusAsync function', () => {
        it('should call mutateAsync with correct data for available status', async () => {
            const mockMutateAsync = vi.fn().mockResolvedValue(undefined)
            vi.mocked(useUpdateUserAvailability).mockReturnValue({
                mutate: vi.fn(),
                mutateAsync: mockMutateAsync,
            } as any)

            const { result } = renderHook(() =>
                useUpdateUserAvailabilityStatus(),
            )

            await result.current.updateStatusAsync(userId, 'available')

            expect(mockMutateAsync).toHaveBeenCalledWith({
                userId,
                data: {
                    user_status: 'available',
                },
            })
        })

        it('should call mutateAsync with correct data for unavailable status', async () => {
            const mockMutateAsync = vi.fn().mockResolvedValue(undefined)
            vi.mocked(useUpdateUserAvailability).mockReturnValue({
                mutate: vi.fn(),
                mutateAsync: mockMutateAsync,
            } as any)

            const { result } = renderHook(() =>
                useUpdateUserAvailabilityStatus(),
            )

            await result.current.updateStatusAsync(userId, 'unavailable')

            expect(mockMutateAsync).toHaveBeenCalledWith({
                userId,
                data: {
                    user_status: 'unavailable',
                },
            })
        })

        it('should call mutateAsync with correct data for custom status', async () => {
            const mockMutateAsync = vi.fn().mockResolvedValue(undefined)
            vi.mocked(useUpdateUserAvailability).mockReturnValue({
                mutate: vi.fn(),
                mutateAsync: mockMutateAsync,
            } as any)

            const { result } = renderHook(() =>
                useUpdateUserAvailabilityStatus(),
            )

            await result.current.updateStatusAsync(userId, 'custom-123')

            expect(mockMutateAsync).toHaveBeenCalledWith({
                userId,
                data: {
                    user_status: 'custom',
                    custom_user_availability_status_id: 'custom-123',
                },
            })
        })
    })

    describe('mutation callbacks', () => {
        it('should invalidate getUserAvailability query on success', () => {
            const { queryClient, spies } = createTestQueryClient({
                withInvalidateQueriesSpy: true,
            })

            vi.mocked(useQueryClient).mockReturnValue(queryClient)
            renderHook(() => useUpdateUserAvailabilityStatus(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            })

            const config = getMutationConfig<UpdateUserAvailabilityConfig>(
                vi.mocked(useUpdateUserAvailability),
            )

            const mockData = {
                data: {
                    id: userId,
                    user_status: 'available' as const,
                },
            }

            const variables = {
                userId,
                data: { user_status: 'available' as const },
            }

            config?.mutation?.onSuccess?.(mockData as any, variables, undefined)

            expect(spies.invalidateQueries).toHaveBeenCalledWith(
                queryKeys.userAvailability.getUserAvailability(userId),
            )
        })
    })

    describe('mutation result passthrough', () => {
        it('should pass through all other properties from useUpdateUserAvailability', () => {
            const mockMutationResult = {
                mutate: vi.fn(),
                mutateAsync: vi.fn(),
                isLoading: true,
                isError: false,
                isSuccess: false,
                error: null,
                data: undefined,
                reset: vi.fn(),
            }

            vi.mocked(useUpdateUserAvailability).mockReturnValue(
                mockMutationResult as any,
            )

            const { result } = renderHook(() =>
                useUpdateUserAvailabilityStatus(),
            )

            expect(result.current.isLoading).toBe(true)
            expect(result.current.isError).toBe(false)
            expect(result.current.isSuccess).toBe(false)
            expect(result.current.error).toBeNull()
            expect(result.current.data).toBeUndefined()
            expect(result.current.reset).toBe(mockMutationResult.reset)
        })
    })
})
