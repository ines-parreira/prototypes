import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListUsersHandler,
    mockListUsersResponse,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { useAllUsers } from '../useAllUsers'

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

describe('useAllUsers', () => {
    it('fetches all users in a single page', async () => {
        const mockListUsers = mockListUsersHandler(async () =>
            HttpResponse.json(
                mockListUsersResponse({
                    data: [mockUser({ id: 1, name: 'Alice' })],
                    meta: { prev_cursor: null, next_cursor: null },
                }),
            ),
        )
        const waitForListUsersRequest = mockListUsers.waitForRequest(server)

        server.use(mockListUsers.handler)

        const { result } = renderHook(() => useAllUsers())

        await waitForListUsersRequest((request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('limit')).toBe('100')
        })
        await waitFor(() => {
            expect(result.current).toHaveLength(1)
        })
        expect(result.current[0]?.id).toBe(1)
    })

    it('exhausts all pages when multiple cursor pages exist', async () => {
        const mockListUsers = mockListUsersHandler(async ({ request }) => {
            const url = new URL(request.url)
            const cursor = url.searchParams.get('cursor')

            if (!cursor) {
                return HttpResponse.json(
                    mockListUsersResponse({
                        data: [
                            mockUser({ id: 1, name: 'Alice' }),
                            mockUser({ id: 2, name: 'Bob' }),
                        ],
                        meta: {
                            prev_cursor: null,
                            next_cursor: 'cursor-page-2',
                        },
                    }),
                )
            }

            return HttpResponse.json(
                mockListUsersResponse({
                    data: [mockUser({ id: 3, name: 'Charlie' })],
                    meta: { prev_cursor: 'cursor-page-1', next_cursor: null },
                }),
            )
        })

        server.use(mockListUsers.handler)

        const { result } = renderHook(() => useAllUsers())

        await waitFor(() => {
            expect(result.current).toHaveLength(3)
        })
        expect(result.current.map((user) => user.id)).toEqual([1, 2, 3])
    })

    it('returns an empty array while the first page is still loading', () => {
        const mockListUsers = mockListUsersHandler(async () =>
            HttpResponse.json(
                mockListUsersResponse({
                    data: [mockUser({ id: 1 })],
                    meta: { prev_cursor: null, next_cursor: null },
                }),
            ),
        )

        server.use(mockListUsers.handler)

        const { result } = renderHook(() => useAllUsers())

        expect(result.current).toEqual([])
    })
})
