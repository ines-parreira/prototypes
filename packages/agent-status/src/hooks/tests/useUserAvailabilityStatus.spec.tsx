import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import {
    mockCustomUserAvailabilityStatus,
    mockListCustomUserAvailabilityStatusesHandler,
    mockListUserAvailabilitiesHandler,
    mockListUserAvailabilitiesResponse,
    mockUserAvailability,
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

    const customStatusesHandler = () =>
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
        ).handler

    const availabilityListHandler = (
        availability: ReturnType<typeof mockUserAvailability>,
    ) =>
        mockListUserAvailabilitiesHandler(async () =>
            HttpResponse.json(
                mockListUserAvailabilitiesResponse({
                    data: [availability],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                        total_resources: 1,
                    },
                }),
            ),
        ).handler

    describe('status resolution', () => {
        it('should resolve available status', async () => {
            server.use(
                availabilityListHandler(
                    mockUserAvailability({
                        user_id: userId,
                        user_status: 'available',
                    }),
                ),
                customStatusesHandler(),
            )

            const { result } = renderHook(() =>
                useUserAvailabilityStatus({ userId }),
            )

            await waitFor(() => {
                expect(result.current.status).toEqual(AVAILABLE_STATUS)
            })
            expect(result.current.availability?.user_status).toBe('available')
        })

        it('should resolve unavailable status', async () => {
            server.use(
                availabilityListHandler(
                    mockUserAvailability({
                        user_id: userId,
                        user_status: 'unavailable',
                    }),
                ),
                customStatusesHandler(),
            )

            const { result } = renderHook(() =>
                useUserAvailabilityStatus({ userId }),
            )

            await waitFor(() => {
                expect(result.current.status).toEqual(UNAVAILABLE_STATUS)
            })
            expect(result.current.availability?.user_status).toBe('unavailable')
        })

        it('should resolve custom status', async () => {
            server.use(
                availabilityListHandler(
                    mockUserAvailability({
                        user_id: userId,
                        user_status: 'custom',
                        custom_user_availability_status_id: customStatus.id,
                    }),
                ),
                customStatusesHandler(),
            )

            const { result } = renderHook(() =>
                useUserAvailabilityStatus({ userId }),
            )

            await waitFor(() => {
                expect(result.current.status).toEqual({
                    ...customStatus,
                    is_system: false,
                })
            })
            expect(result.current.availability?.user_status).toBe('custom')
        })

        it('should return undefined when custom status is not found', async () => {
            server.use(
                availabilityListHandler(
                    mockUserAvailability({
                        user_id: userId,
                        user_status: 'custom',
                        custom_user_availability_status_id: 'non-existent-id',
                    }),
                ),
                customStatusesHandler(),
            )

            const { result } = renderHook(() =>
                useUserAvailabilityStatus({ userId }),
            )

            await waitFor(() => {
                expect(result.current.availability?.user_status).toBe('custom')
            })
            expect(result.current.status).toBeUndefined()
        })
    })
})
