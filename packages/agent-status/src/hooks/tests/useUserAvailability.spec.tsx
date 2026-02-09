import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'

import {
    mockGetUserAvailabilityHandler,
    mockUserAvailabilityDetail,
} from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { renderHook, testAppQueryClient } from '../../tests/render.utils'
import { useUserAvailability } from '../useUserAvailability'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

beforeEach(() => {
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useUserAvailability', () => {
    const userId = 123

    describe('availability mapping', () => {
        it('should return availability when user is available', async () => {
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async () =>
                    HttpResponse.json(
                        mockUserAvailabilityDetail({
                            user_status: 'available',
                        }),
                    ),
            )
            server.use(mockGetUserAvailability.handler)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.availability?.user_status).toBe('available')
            expect(result.current.activeStatusId).toBe('available')
        })

        it('should return availability when user is unavailable', async () => {
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async () =>
                    HttpResponse.json(
                        mockUserAvailabilityDetail({
                            user_status: 'unavailable',
                        }),
                    ),
            )
            server.use(mockGetUserAvailability.handler)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.availability?.user_status).toBe('unavailable')
            expect(result.current.activeStatusId).toBe('unavailable')
        })

        it('should return availability and activeStatusId when user has custom status', async () => {
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async () =>
                    HttpResponse.json(
                        mockUserAvailabilityDetail({
                            user_status: 'custom',
                            custom_user_availability_status_id: 'custom-123',
                        }),
                    ),
            )
            server.use(mockGetUserAvailability.handler)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.availability?.user_status).toBe('custom')
            expect(
                result.current.availability?.custom_user_availability_status_id,
            ).toBe('custom-123')
            expect(result.current.activeStatusId).toBe('custom-123')
        })

        it('should return undefined activeStatusId when availability is custom but no id is present', async () => {
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async () =>
                    HttpResponse.json(
                        mockUserAvailabilityDetail({
                            user_status: 'custom',
                            custom_user_availability_status_id: undefined,
                        }),
                    ),
            )
            server.use(mockGetUserAvailability.handler)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.availability?.user_status).toBe('custom')
            expect(
                result.current.availability?.custom_user_availability_status_id,
            ).toBeUndefined()
            expect(result.current.activeStatusId).toBeUndefined()
        })
    })

    describe('loading state', () => {
        it('should return isLoading: true when data is loading', () => {
            const { result } = renderHook(() => useUserAvailability({ userId }))

            expect(result.current.isLoading).toBe(true)
            expect(result.current.isFetching).toBe(true)
            expect(result.current.availability).toBeUndefined()
            expect(result.current.activeStatusId).toBeUndefined()
        })
    })

    describe('error state', () => {
        it('should return isError: true when API call fails', async () => {
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async () =>
                    HttpResponse.json(
                        {
                            error: { msg: 'Failed to fetch user availability' },
                        } as any,
                        { status: 500 },
                    ),
            )
            server.use(mockGetUserAvailability.handler)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })

            expect(result.current.error).toBeDefined()
            expect(result.current.availability).toBeUndefined()
            expect(result.current.activeStatusId).toBeUndefined()
        })
    })

    describe('query configuration', () => {
        it('should disable query when userId is 0', () => {
            const { result } = renderHook(() =>
                useUserAvailability({ userId: 0 }),
            )

            expect(result.current.availability).toBeUndefined()
        })
    })

    describe('cacheOnly mode', () => {
        it('should disable query when cacheOnly is true', () => {
            const { result } = renderHook(() =>
                useUserAvailability({ userId, cacheOnly: true }),
            )

            expect(result.current.availability).toBeUndefined()
        })

        it('should return cached data when cacheOnly is true', async () => {
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async () =>
                    HttpResponse.json(
                        mockUserAvailabilityDetail({
                            user_status: 'available',
                        }),
                    ),
            )
            server.use(mockGetUserAvailability.handler)

            // First render without cacheOnly to populate the cache
            const { unmount } = renderHook(() =>
                useUserAvailability({ userId }),
            )

            await waitFor(() => {
                const data = testAppQueryClient.getQueryData(
                    queryKeys.userAvailability.getUserAvailability(userId),
                )
                expect(data).toBeDefined()
            })

            unmount()

            // Second render with cacheOnly should use cached data
            const { result } = renderHook(() =>
                useUserAvailability({ userId, cacheOnly: true }),
            )

            expect(result.current.availability?.user_status).toBe('available')
            expect(result.current.activeStatusId).toBe('available')
        })

        it('should re-render when cache is manually updated', async () => {
            // Track if handler is called to verify no network request is made
            const handlerSpy = vi.fn()
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async () => {
                    handlerSpy()
                    return HttpResponse.json(
                        mockUserAvailabilityDetail({
                            user_status: 'available',
                        }),
                    )
                },
            )
            server.use(mockGetUserAvailability.handler)

            // Start with cacheOnly mode (no initial data)
            const { result } = renderHook(() =>
                useUserAvailability({ userId, cacheOnly: true }),
            )

            expect(result.current.availability).toBeUndefined()

            // Manually update the cache (like updateUserAvailabilityInCache does)
            const updatedAvailability = mockUserAvailabilityDetail({
                user_id: userId,
                user_status: 'unavailable',
            })

            testAppQueryClient.setQueryData(
                queryKeys.userAvailability.getUserAvailability(userId),
                { data: updatedAvailability },
            )

            // Hook should re-render with the new cached data
            await waitFor(() => {
                expect(result.current.availability?.user_status).toBe(
                    'unavailable',
                )
            })

            expect(result.current.activeStatusId).toBe('unavailable')

            // Verify no network request was made
            expect(handlerSpy).not.toHaveBeenCalled()
        })
    })
})
