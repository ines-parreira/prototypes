import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListTeamsHandler,
    mockListTeamsResponse,
    mockTeam,
} from '@gorgias/helpdesk-mocks'

import { renderHook, testAppQueryClient } from '../../tests/render.utils'
import { useListAllTeams } from '../useListAllTeams'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useListAllTeams', () => {
    it('fetches teams through listTeams endpoint', async () => {
        const mockListTeams = mockListTeamsHandler(async () =>
            HttpResponse.json(
                mockListTeamsResponse({
                    data: [
                        mockTeam({
                            id: 12,
                            name: 'Support Team',
                        }),
                    ],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                    },
                }),
            ),
        )
        const waitForListTeamsRequest = mockListTeams.waitForRequest(server)

        server.use(mockListTeams.handler)

        const { result } = renderHook(() => useListAllTeams())

        await waitForListTeamsRequest((request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('limit')).toBe('100')
        })
        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })
        expect(result.current.data[0]?.name).toBe('Support Team')
    })
})
