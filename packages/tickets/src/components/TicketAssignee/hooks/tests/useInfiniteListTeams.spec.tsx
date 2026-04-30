import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type { ListTeams200 } from '@gorgias/helpdesk-client'
import { mockListTeamsHandler, mockTeam } from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../../tests/render.utils'
import { useInfiniteListTeams } from '../useInfiniteListTeams'

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

describe('useInfiniteListTeams', () => {
    it('should return teams data', async () => {
        const team1 = mockTeam({ id: 1, name: 'Support' })
        const team2 = mockTeam({ id: 2, name: 'Sales' })

        const mockListTeams = mockListTeamsHandler(async ({ data }) =>
            HttpResponse.json({
                ...data,
                data: [team1, team2],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                },
            }),
        )

        server.use(mockListTeams.handler)

        const { result } = renderHook(() => useInfiniteListTeams())

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(result.current.data?.pages).toHaveLength(1)
        expect(result.current.data?.pages[0].data.data).toEqual([team1, team2])
    })

    it('should stop pagination when meta is missing', async () => {
        const team1 = mockTeam({ id: 1, name: 'Support' })
        const team2 = mockTeam({ id: 2, name: 'Sales' })
        let requestCount = 0

        const mockListTeams = mockListTeamsHandler(async ({ data }) => {
            requestCount += 1
            const { meta: __meta, ...response } = data

            return HttpResponse.json({
                ...response,
                data: [team1, team2],
            } as unknown as ListTeams200)
        })

        server.use(mockListTeams.handler)

        const { result } = renderHook(() => useInfiniteListTeams())

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(result.current.data?.pages).toHaveLength(1)
        expect(result.current.data?.pages[0].data.data).toEqual([team1, team2])
        expect(result.current.hasNextPage).toBe(false)
        expect(requestCount).toBe(1)
    })
})
