import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type { ListUsers200 } from '@gorgias/helpdesk-client'
import { mockListUsersHandler, mockUser } from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../../tests/render.utils'
import { useInfiniteListUsers } from '../useInfiniteListUsers'

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

describe('useInfiniteListUsers', () => {
    it('should return users data', async () => {
        const user1 = mockUser({ id: 1, name: 'Support Agent' })
        const user2 = mockUser({ id: 2, name: 'Sales Agent' })

        const mockListUsers = mockListUsersHandler(async ({ data }) =>
            HttpResponse.json({
                ...data,
                data: [user1, user2],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                },
            }),
        )

        server.use(mockListUsers.handler)

        const { result } = renderHook(() => useInfiniteListUsers())

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(result.current.data?.pages).toHaveLength(1)
        expect(result.current.data?.pages[0].data.data).toEqual([user1, user2])
    })

    it('should stop pagination when meta is missing', async () => {
        const user1 = mockUser({ id: 1, name: 'Support Agent' })
        const user2 = mockUser({ id: 2, name: 'Sales Agent' })
        let requestCount = 0

        const mockListUsers = mockListUsersHandler(async ({ data }) => {
            requestCount += 1
            const { meta: __meta, ...response } = data

            return HttpResponse.json({
                ...response,
                data: [user1, user2],
            } as unknown as ListUsers200)
        })

        server.use(mockListUsers.handler)

        const { result } = renderHook(() => useInfiniteListUsers())

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(result.current.data?.pages).toHaveLength(1)
        expect(result.current.data?.pages[0].data.data).toEqual([user1, user2])
        expect(result.current.hasNextPage).toBe(false)
        expect(requestCount).toBe(1)
    })
})
