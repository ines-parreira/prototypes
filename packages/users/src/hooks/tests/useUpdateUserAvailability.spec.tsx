import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListUserAvailabilitiesHandler,
    mockListUserAvailabilitiesResponse,
    mockUpdateUserAvailabilityHandler,
    mockUserAvailability,
} from '@gorgias/helpdesk-mocks'

import { useAllUserAvailabilities } from '../useAllUserAvailabilities'
import { useUpdateUserAvailability } from '../useUpdateUserAvailability'

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

const userId = 2

const seedList = () =>
    mockListUserAvailabilitiesHandler(async () =>
        HttpResponse.json(
            mockListUserAvailabilitiesResponse({
                data: [
                    mockUserAvailability({
                        user_id: 1,
                        user_status: 'available',
                    }),
                    mockUserAvailability({
                        user_id: userId,
                        user_status: 'available',
                    }),
                ],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                    total_resources: 2,
                },
            }),
        ),
    ).handler

describe('useUpdateUserAvailability', () => {
    it('patches the cached availability listing when set to unavailable', async () => {
        let userStatus: 'available' | 'unavailable' = 'available'

        server.use(
            mockListUserAvailabilitiesHandler(async () =>
                HttpResponse.json(
                    mockListUserAvailabilitiesResponse({
                        data: [
                            mockUserAvailability({
                                user_id: 1,
                                user_status: 'available',
                            }),
                            mockUserAvailability({
                                user_id: userId,
                                user_status: userStatus,
                            }),
                        ],
                        meta: {
                            prev_cursor: null,
                            next_cursor: null,
                            total_resources: 2,
                        },
                    }),
                ),
            ).handler,
            mockUpdateUserAvailabilityHandler(async () => {
                userStatus = 'unavailable'
                return HttpResponse.json(
                    mockUserAvailability({
                        user_id: userId,
                        user_status: 'unavailable',
                    }),
                )
            }).handler,
        )

        const { result } = renderHook(() => ({
            availabilities: useAllUserAvailabilities(),
            mutation: useUpdateUserAvailability(userId),
        }))

        await waitFor(() => {
            expect(result.current.availabilities).toHaveLength(2)
        })

        await result.current.mutation.update('unavailable')

        await waitFor(() => {
            expect(
                result.current.availabilities.find(
                    (entry) => entry.user_id === userId,
                )?.user_status,
            ).toBe('unavailable')
        })
    })

    it('sends the custom status id when set to a custom status', async () => {
        const customStatusId = 'custom-123'

        const mockUpdate = mockUpdateUserAvailabilityHandler(async () =>
            HttpResponse.json(
                mockUserAvailability({
                    user_id: userId,
                    user_status: 'custom',
                    custom_user_availability_status_id: customStatusId,
                }),
            ),
        )

        server.use(seedList(), mockUpdate.handler)

        const waitForRequest = mockUpdate.waitForRequest(server)

        const { result } = renderHook(() => useUpdateUserAvailability(userId))

        await result.current.update('custom', customStatusId)

        await waitForRequest(async (request) => {
            expect(await request.json()).toEqual({
                user_status: 'custom',
                custom_user_availability_status_id: customStatusId,
            })
        })
    })

    it('throws when a custom status is requested without an id', async () => {
        server.use(seedList())

        const { result } = renderHook(() => useUpdateUserAvailability(userId))

        expect(() =>
            (result.current.update as (status: string) => Promise<unknown>)(
                'custom',
            ),
        ).toThrow('customStatusId is required when status is "custom"')
    })

    it('surfaces API errors and leaves the cache untouched', async () => {
        server.use(
            seedList(),
            mockUpdateUserAvailabilityHandler(
                async () => new HttpResponse(null, { status: 500 }),
            ).handler,
        )

        const { result } = renderHook(() => ({
            availabilities: useAllUserAvailabilities(),
            mutation: useUpdateUserAvailability(userId),
        }))

        await waitFor(() => {
            expect(result.current.availabilities).toHaveLength(2)
        })

        await expect(
            result.current.mutation.update('unavailable'),
        ).rejects.toThrow()

        expect(
            result.current.availabilities.find(
                (entry) => entry.user_id === userId,
            )?.user_status,
        ).toBe('available')
    })
})
