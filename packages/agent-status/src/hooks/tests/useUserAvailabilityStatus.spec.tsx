import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import {
    mockCustomUserAvailabilityStatus,
    mockGetUserAvailabilityHandler,
    mockListCustomUserAvailabilityStatusesHandler,
    mockUserAvailabilityDetail,
} from '@gorgias/helpdesk-mocks'

import { AVAILABLE_STATUS, UNAVAILABLE_STATUS } from '../../constants'
import { useUserAvailabilityStatus } from '../useUserAvailabilityStatus'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
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
})
