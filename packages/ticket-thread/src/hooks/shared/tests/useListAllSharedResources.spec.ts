import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListTagsHandler,
    mockListTagsResponse,
    mockListTeamsHandler,
    mockListTeamsResponse,
    mockListUsersHandler,
    mockListUsersResponse,
    mockTag,
    mockTeam,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { useListAllHumanAgents } from '../useListAllHumanAgents'
import { useListAllTags } from '../useListAllTags'
import { useListAllTeams } from '../useListAllTeams'

describe('shared list hooks', () => {
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

    it('fetches tags through listTags endpoint', async () => {
        const mockListTags = mockListTagsHandler(async () =>
            HttpResponse.json(
                mockListTagsResponse({
                    data: [
                        mockTag({
                            id: 3,
                            name: 'VIP',
                        }),
                    ],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                        total_resources: 1,
                    },
                }),
            ),
        )
        const waitForListTagsRequest = mockListTags.waitForRequest(server)

        server.use(mockListTags.handler)

        const { result } = renderHook(() => useListAllTags())

        await waitForListTagsRequest((request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('limit')).toBe('100')
        })
        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })
        expect(result.current.data[0]?.name).toBe('VIP')
    })

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
