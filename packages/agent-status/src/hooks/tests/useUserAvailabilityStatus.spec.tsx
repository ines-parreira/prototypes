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
    mockCustomUserAvailabilityStatus,
    mockGetUserAvailabilityHandler,
    mockListCustomUserAvailabilityStatusesHandler,
    mockUserAvailabilityDetail,
} from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { AVAILABLE_STATUS, UNAVAILABLE_STATUS } from '../../constants'
import { renderHook, testAppQueryClient } from '../../tests/render.utils'
import { useUserAvailabilityStatus } from '../useUserAvailabilityStatus'

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

describe('useUserAvailabilityStatus', () => {
    const userId = 123

    const customStatus = mockCustomUserAvailabilityStatus({
        id: 'custom-123',
        name: 'Lunch Break',
        duration_unit: 'minutes',
        duration_value: 30,
    })

    describe('status resolution', () => {
        it('should resolve available status', async () => {
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async () =>
                    HttpResponse.json(
                        mockUserAvailabilityDetail({
                            user_id: userId,
                            user_status: 'available',
                        }),
                    ),
            )

            const mockListCustomStatuses =
                mockListCustomUserAvailabilityStatusesHandler(async () =>
                    HttpResponse.json({
                        data: [customStatus],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                        },
                        object: 'list',
                        uri: '/api/custom-user-availability-statuses',
                    }),
                )

            server.use(
                mockGetUserAvailability.handler,
                mockListCustomStatuses.handler,
            )

            const { result } = renderHook(() =>
                useUserAvailabilityStatus({ userId }),
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.status).toEqual(AVAILABLE_STATUS)
            expect(result.current.availability?.user_status).toBe('available')
        })

        it('should resolve unavailable status', async () => {
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async () =>
                    HttpResponse.json(
                        mockUserAvailabilityDetail({
                            user_id: userId,
                            user_status: 'unavailable',
                        }),
                    ),
            )

            const mockListCustomStatuses =
                mockListCustomUserAvailabilityStatusesHandler(async () =>
                    HttpResponse.json({
                        data: [customStatus],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                        },
                        object: 'list',
                        uri: '/api/custom-user-availability-statuses',
                    }),
                )

            server.use(
                mockGetUserAvailability.handler,
                mockListCustomStatuses.handler,
            )

            const { result } = renderHook(() =>
                useUserAvailabilityStatus({ userId }),
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.status).toEqual(UNAVAILABLE_STATUS)
            expect(result.current.availability?.user_status).toBe('unavailable')
        })

        it('should resolve custom status', async () => {
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async () =>
                    HttpResponse.json(
                        mockUserAvailabilityDetail({
                            user_id: userId,
                            user_status: 'custom',
                            custom_user_availability_status_id: customStatus.id,
                        }),
                    ),
            )

            const mockListCustomStatuses =
                mockListCustomUserAvailabilityStatusesHandler(async () =>
                    HttpResponse.json({
                        data: [customStatus],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                        },
                        object: 'list',
                        uri: '/api/custom-user-availability-statuses',
                    }),
                )

            server.use(
                mockGetUserAvailability.handler,
                mockListCustomStatuses.handler,
            )

            const { result } = renderHook(() =>
                useUserAvailabilityStatus({ userId }),
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.status).toEqual({
                ...customStatus,
                is_system: false,
            })
            expect(result.current.availability?.user_status).toBe('custom')
        })

        it('should return undefined when custom status is not found', async () => {
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async () =>
                    HttpResponse.json(
                        mockUserAvailabilityDetail({
                            user_id: userId,
                            user_status: 'custom',
                            custom_user_availability_status_id:
                                'non-existent-id',
                        }),
                    ),
            )

            const mockListCustomStatuses =
                mockListCustomUserAvailabilityStatusesHandler(async () =>
                    HttpResponse.json({
                        data: [customStatus],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                        },
                        object: 'list',
                        uri: '/api/custom-user-availability-statuses',
                    }),
                )

            server.use(
                mockGetUserAvailability.handler,
                mockListCustomStatuses.handler,
            )

            const { result } = renderHook(() =>
                useUserAvailabilityStatus({ userId }),
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.status).toBeUndefined()
            expect(result.current.availability?.user_status).toBe('custom')
        })
    })

    describe('cacheOnly mode', () => {
        it('should disable query when cacheOnly is true', () => {
            const { result } = renderHook(() =>
                useUserAvailabilityStatus({ userId, cacheOnly: true }),
            )

            expect(result.current.availability).toBeUndefined()
            expect(result.current.status).toBeUndefined()
        })

        it('should return cached data when cacheOnly is true', async () => {
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async () =>
                    HttpResponse.json(
                        mockUserAvailabilityDetail({
                            user_id: userId,
                            user_status: 'available',
                        }),
                    ),
            )

            const mockListCustomStatuses =
                mockListCustomUserAvailabilityStatusesHandler(async () =>
                    HttpResponse.json({
                        data: [customStatus],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                        },
                        object: 'list',
                        uri: '/api/custom-user-availability-statuses',
                    }),
                )

            server.use(
                mockGetUserAvailability.handler,
                mockListCustomStatuses.handler,
            )

            // First render without cacheOnly to populate the cache
            const { unmount } = renderHook(() =>
                useUserAvailabilityStatus({ userId }),
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
                useUserAvailabilityStatus({ userId, cacheOnly: true }),
            )

            expect(result.current.availability?.user_status).toBe('available')
            expect(result.current.status).toEqual(AVAILABLE_STATUS)
        })

        it('should re-render when cache is manually updated', async () => {
            const mockListCustomStatuses =
                mockListCustomUserAvailabilityStatusesHandler(async () =>
                    HttpResponse.json({
                        data: [customStatus],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                        },
                        object: 'list',
                        uri: '/api/custom-user-availability-statuses',
                    }),
                )

            server.use(mockListCustomStatuses.handler)

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
                useUserAvailabilityStatus({ userId, cacheOnly: true }),
            )

            // Initially, availability should be undefined (no cache)
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

            expect(result.current.status).toEqual(UNAVAILABLE_STATUS)

            // Verify no network request was made to getUserAvailability
            expect(handlerSpy).not.toHaveBeenCalled()
        })
    })
})
