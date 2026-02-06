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
} from 'vitest'

import {
    mockListUserAvailabilitiesHandler,
    mockUserAvailability,
} from '@gorgias/helpdesk-mocks'
import type { GetUserAvailabilityResult } from '@gorgias/helpdesk-queries'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { renderHook, testAppQueryClient } from '../../tests/render.utils'
import { useListUserAvailabilities } from '../useListUserAvailabilities'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
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

describe('useListUserAvailabilities', () => {
    describe('basic functionality', () => {
        it('fetches availabilities for multiple users', async () => {
            const userIds = [1, 2, 3]
            const mockAvailabilities = userIds.map((id) =>
                mockUserAvailability({
                    user_id: id,
                    user_status: 'available',
                }),
            )

            const mockListUserAvailabilities =
                mockListUserAvailabilitiesHandler(async () =>
                    HttpResponse.json({
                        data: mockAvailabilities,
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 10,
                        },
                        object: 'list',
                        uri: '/api/user-availability',
                    }),
                )

            server.use(mockListUserAvailabilities.handler)

            const { result } = renderHook(() =>
                useListUserAvailabilities({ userIds }),
            )

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.isError).toBe(false)
            expect(result.current.data?.data?.data).toEqual(mockAvailabilities)
        })

        it('does not fetch when userIds is empty', () => {
            const { result } = renderHook(() =>
                useListUserAvailabilities({ userIds: [] }),
            )

            expect(result.current.data).toBeUndefined()
        })

        it('does not fetch when enabled is false', () => {
            const { result } = renderHook(() =>
                useListUserAvailabilities({
                    userIds: [1, 2, 3],
                    enabled: false,
                }),
            )

            expect(result.current.data).toBeUndefined()
        })
    })

    describe('cache population', () => {
        it('populates individual user availability caches', async () => {
            const userIds = [1, 2, 3]
            const mockAvailabilities = userIds.map((id) =>
                mockUserAvailability({
                    user_id: id,
                    user_status: id === 1 ? 'available' : 'unavailable',
                }),
            )

            const mockListUserAvailabilities =
                mockListUserAvailabilitiesHandler(async () =>
                    HttpResponse.json({
                        data: mockAvailabilities,
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: mockAvailabilities.length,
                        },
                        object: 'list',
                        uri: '/api/user-availability',
                    }),
                )

            server.use(mockListUserAvailabilities.handler)

            renderHook(() => useListUserAvailabilities({ userIds }))

            await waitFor(() => {
                userIds.forEach((userId, index) => {
                    const cachedData =
                        testAppQueryClient.getQueryData<GetUserAvailabilityResult>(
                            queryKeys.userAvailability.getUserAvailability(
                                userId,
                            ),
                        )

                    expect(cachedData).toBeDefined()
                    expect(cachedData?.data).toEqual(mockAvailabilities[index])
                })
            })
        })

        it('handles mixed availability statuses', async () => {
            const mockAvailabilities = [
                mockUserAvailability({
                    user_id: 1,
                    user_status: 'available',
                }),
                mockUserAvailability({
                    user_id: 2,
                    user_status: 'unavailable',
                }),
                mockUserAvailability({
                    user_id: 3,
                    user_status: 'custom',
                    custom_user_availability_status_id: 'custom-123',
                }),
            ]

            const mockListUserAvailabilities =
                mockListUserAvailabilitiesHandler(async () =>
                    HttpResponse.json({
                        data: mockAvailabilities,
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: mockAvailabilities.length,
                        },
                        object: 'list',
                        uri: '/api/user-availability',
                    }),
                )

            server.use(mockListUserAvailabilities.handler)

            renderHook(() => useListUserAvailabilities({ userIds: [1, 2, 3] }))

            await waitFor(() => {
                const cache1 = testAppQueryClient.getQueryData(
                    queryKeys.userAvailability.getUserAvailability(1),
                ) as GetUserAvailabilityResult
                const cache2 = testAppQueryClient.getQueryData(
                    queryKeys.userAvailability.getUserAvailability(2),
                ) as GetUserAvailabilityResult
                const cache3 = testAppQueryClient.getQueryData(
                    queryKeys.userAvailability.getUserAvailability(3),
                ) as GetUserAvailabilityResult

                expect(cache1?.data.user_status).toBe('available')
                expect(cache2?.data.user_status).toBe('unavailable')
                expect(cache3?.data.user_status).toBe('custom')
                expect(cache3?.data.custom_user_availability_status_id).toBe(
                    'custom-123',
                )
            })
        })
    })

    describe('error handling', () => {
        it('handles API errors gracefully', async () => {
            const userIds = [1, 2, 3]

            const mockListUserAvailabilities =
                mockListUserAvailabilitiesHandler(async () =>
                    HttpResponse.json(
                        {
                            error: { msg: 'Failed to fetch availabilities' },
                        } as any,
                        { status: 500 },
                    ),
                )

            server.use(mockListUserAvailabilities.handler)

            const { result } = renderHook(() =>
                useListUserAvailabilities({ userIds }),
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.isError).toBe(true)
            expect(result.current.error).toBeDefined()
        })
    })
})
