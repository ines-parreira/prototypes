import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import {
    mockListUserAvailabilitiesHandler,
    mockUserAvailability,
} from '@gorgias/helpdesk-mocks'

import { useListUserAvailabilities } from '../useListUserAvailabilities'
import { useUserAvailability } from '../useUserAvailability'

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

describe('useListUserAvailabilities', () => {
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

            const { result } = renderHook(() => {
                const batch = useListUserAvailabilities({ userIds })
                const firstAvailability = useUserAvailability({
                    userId: 1,
                    cacheOnly: true,
                })
                const secondAvailability = useUserAvailability({
                    userId: 2,
                    cacheOnly: true,
                })
                const thirdAvailability = useUserAvailability({
                    userId: 3,
                    cacheOnly: true,
                })

                return {
                    batch,
                    firstAvailability,
                    secondAvailability,
                    thirdAvailability,
                }
            })

            await waitFor(() => {
                expect(result.current.batch.isLoading).toBe(false)
                expect(result.current.firstAvailability.availability).toEqual(
                    mockAvailabilities[0],
                )
                expect(result.current.secondAvailability.availability).toEqual(
                    mockAvailabilities[1],
                )
                expect(result.current.thirdAvailability.availability).toEqual(
                    mockAvailabilities[2],
                )
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

            const { result } = renderHook(() => {
                const batch = useListUserAvailabilities({ userIds: [1, 2, 3] })
                const firstAvailability = useUserAvailability({
                    userId: 1,
                    cacheOnly: true,
                })
                const secondAvailability = useUserAvailability({
                    userId: 2,
                    cacheOnly: true,
                })
                const thirdAvailability = useUserAvailability({
                    userId: 3,
                    cacheOnly: true,
                })

                return {
                    batch,
                    firstAvailability,
                    secondAvailability,
                    thirdAvailability,
                }
            })

            await waitFor(() => {
                expect(result.current.batch.isLoading).toBe(false)
                expect(
                    result.current.firstAvailability.availability?.user_status,
                ).toBe('available')
                expect(
                    result.current.secondAvailability.availability?.user_status,
                ).toBe('unavailable')
                expect(
                    result.current.thirdAvailability.availability?.user_status,
                ).toBe('custom')
                expect(
                    result.current.thirdAvailability.availability
                        ?.custom_user_availability_status_id,
                ).toBe('custom-123')
            })
        })
    })
})
