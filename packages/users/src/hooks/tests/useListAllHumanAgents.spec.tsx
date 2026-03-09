import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListUsersHandler,
    mockListUsersResponse,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { renderHook, testAppQueryClient } from '../../tests/render.utils'
import { useListAllHumanAgents } from '../useListAllHumanAgents'

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

describe('useListAllHumanAgents', () => {
    it('fetches human agents through listUsers endpoint', async () => {
        const mockListUsers = mockListUsersHandler(async () =>
            HttpResponse.json(
                mockListUsersResponse({
                    data: [
                        mockUser({
                            id: 77,
                            name: 'Nicolas Agent',
                            email: 'nicolas.agent@gorgias.com',
                        }),
                    ],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                    },
                }),
            ),
        )
        const waitForListUsersRequest = mockListUsers.waitForRequest(server)

        server.use(mockListUsers.handler)

        const { result } = renderHook(() => useListAllHumanAgents())

        await waitForListUsersRequest((request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('limit')).toBe('100')
        })
        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })
        expect(result.current.data[0]?.id).toBe(77)
    })
})
