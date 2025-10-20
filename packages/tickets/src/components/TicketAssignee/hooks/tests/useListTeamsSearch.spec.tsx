import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListTeamsHandler, mockTeam } from '@gorgias/helpdesk-mocks'

import { renderHook, testAppQueryClient } from '../../../../tests/render.utils'
import { useListTeamsSearch } from '../useListTeamsSearch'

const team1 = mockTeam({ id: 1, name: 'Support Team' })
const team2 = mockTeam({ id: 2, name: 'Sales Team' })
const team3 = mockTeam({ id: 3, name: 'Engineering' })

const mockListTeams = mockListTeamsHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        data: [team1, team2, team3],
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
    server.use(mockListTeams.handler)
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('useListTeamsSearch', () => {
    it('should return all teams when search is empty', async () => {
        const { result } = renderHook(() => useListTeamsSearch())

        await waitFor(() => {
            expect(result.current.teams).toHaveLength(3)
        })

        expect(result.current.teams).toEqual([team1, team2, team3])
    })

    it('should filter teams by search query, case-insensitively', async () => {
        const { result } = renderHook(() => useListTeamsSearch())

        await waitFor(() => {
            expect(result.current.teams).toHaveLength(3)
        })

        act(() => {
            result.current.setSearch('SUPPORT')
        })

        await waitFor(() => {
            expect(result.current.teams).toHaveLength(1)
        })

        expect(result.current.teams[0].name).toBe('Support Team')
    })

    it('should return empty array when no matches found', async () => {
        const { result } = renderHook(() => useListTeamsSearch())

        await waitFor(() => {
            expect(result.current.teams).toHaveLength(3)
        })

        act(() => {
            result.current.setSearch('nonexistent')
        })

        await waitFor(() => {
            expect(result.current.teams).toHaveLength(0)
        })
    })

    it('should support pagination', async () => {
        let requestCount = 0
        server.use(
            mockListTeamsHandler(async ({ data }) => {
                requestCount++
                if (requestCount === 1) {
                    return HttpResponse.json({
                        ...data,
                        data: [team1],
                        meta: {
                            prev_cursor: null,
                            next_cursor: 'cursor-2',
                        },
                    })
                }
                return HttpResponse.json({
                    ...data,
                    data: [team2],
                    meta: {
                        prev_cursor: 'cursor-1',
                        next_cursor: null,
                    },
                })
            }).handler,
        )

        const { result } = renderHook(() => useListTeamsSearch())

        await waitFor(() => {
            expect(result.current.teams).toHaveLength(1)
        })

        expect(result.current.shouldLoadMore).toBe(true)

        act(() => {
            result.current.onLoad()
        })

        await waitFor(() => {
            expect(result.current.teams).toHaveLength(2)
        })

        expect(result.current.shouldLoadMore).toBe(false)
    })

    it('should indicate loading state', async () => {
        const { result } = renderHook(() => useListTeamsSearch())

        expect(result.current.isLoading).toBe(true)

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
    })

    it('should maintain search state', async () => {
        const { result } = renderHook(() => useListTeamsSearch())

        expect(result.current.search).toBe('')

        act(() => {
            result.current.setSearch('test')
        })

        expect(result.current.search).toBe('test')
    })
})
