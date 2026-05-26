import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListUserAvailabilitiesHandler,
    mockListUserAvailabilitiesResponse,
    mockUserAvailability,
} from '@gorgias/helpdesk-mocks'

import { useAllUserAvailabilities } from '../useAllUserAvailabilities'

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

describe('useAllUserAvailabilities', () => {
    it('fetches all user availabilities in a single page', async () => {
        const mockHandler = mockListUserAvailabilitiesHandler(async () =>
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
        const waitForRequest = mockHandler.waitForRequest(server)

        server.use(mockHandler.handler)

        const { result } = renderHook(() => useAllUserAvailabilities())

        await waitForRequest((request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('limit')).toBe('100')
        })
        await waitFor(() => {
            expect(result.current).toHaveLength(1)
        })
        expect(result.current[0]?.user_id).toBe(1)
    })

    it('exhausts all pages when multiple cursor pages exist', async () => {
        const mockHandler = mockListUserAvailabilitiesHandler(
            async ({ request }) => {
                const url = new URL(request.url)
                const cursor = url.searchParams.get('cursor')

                if (!cursor) {
                    return HttpResponse.json(
                        mockListUserAvailabilitiesResponse({
                            data: [
                                mockUserAvailability({ user_id: 1 }),
                                mockUserAvailability({ user_id: 2 }),
                            ],
                            meta: {
                                prev_cursor: null,
                                next_cursor: 'cursor-page-2',
                                total_resources: null,
                            },
                        }),
                    )
                }

                return HttpResponse.json(
                    mockListUserAvailabilitiesResponse({
                        data: [mockUserAvailability({ user_id: 3 })],
                        meta: {
                            prev_cursor: 'cursor-page-1',
                            next_cursor: null,
                            total_resources: null,
                        },
                    }),
                )
            },
        )

        server.use(mockHandler.handler)

        const { result } = renderHook(() => useAllUserAvailabilities())

        await waitFor(() => {
            expect(result.current).toHaveLength(3)
        })
        expect(result.current.map((entry) => entry.user_id)).toEqual([1, 2, 3])
    })

    it('returns an empty array while the first page is still loading', () => {
        const mockHandler = mockListUserAvailabilitiesHandler(async () =>
            HttpResponse.json(
                mockListUserAvailabilitiesResponse({
                    data: [mockUserAvailability({ user_id: 1 })],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                        total_resources: null,
                    },
                }),
            ),
        )

        server.use(mockHandler.handler)

        const { result } = renderHook(() => useAllUserAvailabilities())

        expect(result.current).toEqual([])
    })
})
