import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListUsersHandler, mockUser } from '@gorgias/helpdesk-mocks'

import { renderHook, testAppQueryClient } from '../../../../tests/render.utils'
import { useListUsersSearch } from '../useListUsersSearch'

const user1 = mockUser({ id: 1, name: 'Support Agent' })
const user2 = mockUser({ id: 2, name: 'Sales Agent' })
const user3 = mockUser({ id: 3, name: 'Engineering Lead' })

const mockListUsers = mockListUsersHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        data: [user1, user2, user3],
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

describe('useListUsersSearch', () => {
    it('should return all users', async () => {
        const { result } = renderHook(() => useListUsersSearch())

        await waitFor(() => {
            expect(result.current.users).toHaveLength(3)
        })

        expect(result.current.users).toEqual([user1, user2, user3])
    })

    it('should return empty array when no results found', async () => {
        const { result } = renderHook(() => useListUsersSearch())

        server.use(
            mockListUsersHandler(async ({ data }) => {
                return HttpResponse.json({
                    ...data,
                    data: [],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                    },
                })
            }).handler,
        )

        await waitFor(() => {
            expect(result.current.users).toHaveLength(0)
        })

        expect(result.current.users).toEqual([])
    })

    it('should support pagination', async () => {
        let requestCount = 0
        server.use(
            mockListUsersHandler(async ({ data }) => {
                requestCount++
                if (requestCount === 1) {
                    return HttpResponse.json({
                        ...data,
                        data: [user1],
                        meta: {
                            prev_cursor: null,
                            next_cursor: 'cursor-2',
                        },
                    })
                }
                return HttpResponse.json({
                    ...data,
                    data: [user2],
                    meta: {
                        prev_cursor: 'cursor-1',
                        next_cursor: null,
                    },
                })
            }).handler,
        )

        const { result } = renderHook(() => useListUsersSearch())

        await waitFor(() => {
            expect(result.current.users).toHaveLength(1)
        })

        expect(result.current.shouldLoadMore).toBe(true)

        act(() => {
            result.current.onLoad()
        })

        await waitFor(() => {
            expect(result.current.users).toHaveLength(2)
        })

        expect(result.current.shouldLoadMore).toBe(false)
    })

    it('should indicate loading state', async () => {
        const { result } = renderHook(() => useListUsersSearch())

        expect(result.current.isLoading).toBe(true)

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
    })

    it('should maintain search state', async () => {
        const { result } = renderHook(() => useListUsersSearch())

        expect(result.current.search).toBe('')

        act(() => {
            result.current.setSearch('test')
        })

        expect(result.current.search).toBe('test')
    })
})
