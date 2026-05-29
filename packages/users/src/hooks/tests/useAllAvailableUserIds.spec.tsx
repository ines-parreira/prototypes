import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListUserAvailabilitiesHandler,
    mockListUserAvailabilitiesResponse,
    mockUserAvailability,
} from '@gorgias/helpdesk-mocks'

import { useAllAvailableUserIds } from '../useAllAvailableUserIds'

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

describe('useAllAvailableUserIds', () => {
    it('returns an empty set while the availabilities are still loading', () => {
        const { handler } = mockListUserAvailabilitiesHandler(async () =>
            HttpResponse.json(
                mockListUserAvailabilitiesResponse({
                    data: [
                        mockUserAvailability({
                            user_id: 1,
                            user_status: 'available',
                        }),
                    ],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                        total_resources: null,
                    },
                }),
            ),
        )

        server.use(handler)

        const { result } = renderHook(() => useAllAvailableUserIds())

        expect(result.current).toEqual(new Set())
    })

    it('returns only the user ids whose user_status is available', async () => {
        const { handler } = mockListUserAvailabilitiesHandler(async () =>
            HttpResponse.json(
                mockListUserAvailabilitiesResponse({
                    data: [
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
                        }),
                        mockUserAvailability({
                            user_id: 4,
                            user_status: 'available',
                        }),
                    ],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                        total_resources: null,
                    },
                }),
            ),
        )

        server.use(handler)

        const { result } = renderHook(() => useAllAvailableUserIds())

        await waitFor(() => {
            expect(result.current.size).toBe(2)
        })
        expect(result.current).toEqual(new Set([1, 4]))
    })

    it('returns an empty set when no user is currently available', async () => {
        const mockHandler = mockListUserAvailabilitiesHandler(async () =>
            HttpResponse.json(
                mockListUserAvailabilitiesResponse({
                    data: [
                        mockUserAvailability({
                            user_id: 1,
                            user_status: 'unavailable',
                        }),
                        mockUserAvailability({
                            user_id: 2,
                            user_status: 'custom',
                        }),
                    ],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                        total_resources: null,
                    },
                }),
            ),
        )
        const waitForRequest = mockHandler.waitForRequest(server)

        server.use(mockHandler.handler)

        const { result } = renderHook(() => useAllAvailableUserIds())

        await waitForRequest()
        await waitFor(() => {
            expect(result.current).toEqual(new Set())
        })
    })
})
