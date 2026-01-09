import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListTeamsHandler, mockTeam } from '@gorgias/helpdesk-mocks'

import { renderHook, testAppQueryClient } from '../../../../tests/render.utils'
import { useInfiniteListTeams } from '../useInfiniteListTeams'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
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
})
