import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListUsersHandler, mockUser } from '@gorgias/helpdesk-mocks'

import { renderHook, testAppQueryClient } from '../../../../tests/render.utils'
import { useInfiniteListUsers } from '../useInfiniteListUsers'

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

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockListUsers.handler)
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('useInfiniteListUsers', () => {
    it('should return users data', async () => {
        const { result } = renderHook(() => useInfiniteListUsers())

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(result.current.data?.pages).toHaveLength(1)
        expect(result.current.data?.pages[0].data.data).toEqual([user1, user2])
    })
})
