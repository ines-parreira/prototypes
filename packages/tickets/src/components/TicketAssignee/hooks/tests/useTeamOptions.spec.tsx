import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListTeamsHandler,
    mockTeam,
    mockTicketTeam,
} from '@gorgias/helpdesk-mocks'

import { renderHook, testAppQueryClient } from '../../../../tests/render.utils'
import { NO_TEAM_OPTION, useTeamOptions } from '../useTeamOptions'

const team1 = mockTeam({ id: 1, name: 'Support', decoration: { emoji: '🛠️' } })
const team2 = mockTeam({ id: 2, name: 'Sales', decoration: { emoji: '💰' } })
const team3 = mockTeam({ id: 3, name: 'Engineering', decoration: null })

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
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useTeamOptions', () => {
    it('should return team sections when no team is selected', async () => {
        const { result } = renderHook(() =>
            useTeamOptions({ currentTeam: null }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.teamSections).toHaveLength(1)
        expect(result.current.teamSections[0].id).toBe('teams')
        expect(result.current.teamSections[0].items).toEqual([
            { id: 3, label: 'Engineering' },
            { id: 2, label: 'Sales' },
            { id: 1, label: 'Support' },
        ])
        expect(result.current.selectedOption).toEqual(NO_TEAM_OPTION)
    })

    it('should include "No team" section when a team is selected', async () => {
        const { result } = renderHook(() =>
            useTeamOptions({ currentTeam: mockTicketTeam(team1) }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.teamSections).toHaveLength(2)
        expect(result.current.teamSections[0].id).toBe('no_team_section')
        expect(result.current.teamSections[0].items).toEqual([NO_TEAM_OPTION])
        expect(result.current.teamSections[1].id).toBe('teams')
        expect(result.current.teamSections[1].items).toEqual([
            { id: 3, label: 'Engineering' },
            { id: 2, label: 'Sales' },
            { id: 1, label: 'Support' },
        ])
        expect(result.current.selectedOption).toEqual({
            id: 1,
            label: 'Support',
        })
    })

    it('should exclude "No team" section when searching', async () => {
        const { result } = renderHook(() =>
            useTeamOptions({ currentTeam: mockTicketTeam(team1) }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        act(() => {
            result.current.setSearch('support')
        })

        await waitFor(() => {
            expect(result.current.teamSections).toHaveLength(1)
        })

        expect(result.current.teamSections[0].id).toBe('teams')
    })

    it('should return a teamsMap for team lookup', async () => {
        const { result } = renderHook(() =>
            useTeamOptions({ currentTeam: null }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.teamsMap.get(1)).toEqual(team1)
        expect(result.current.teamsMap.get(2)).toEqual(team2)
        expect(result.current.teamsMap.get(3)).toEqual(team3)
        expect(result.current.teamsMap.size).toBe(3)
    })

    it('should append the current team when it is missing from the fetched teams', async () => {
        const legacyTeam = mockTicketTeam({
            id: 99,
            name: 'Legacy Team',
        })

        const { result } = renderHook(() =>
            useTeamOptions({ currentTeam: legacyTeam }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.teamSections).toHaveLength(2)
        expect(result.current.teamSections[0].items).toEqual([NO_TEAM_OPTION])
        expect(result.current.teamSections[1].items).toEqual([
            { id: 3, label: 'Engineering' },
            { id: 2, label: 'Sales' },
            { id: 1, label: 'Support' },
            { id: 99, label: 'Legacy Team' },
        ])
        expect(result.current.selectedOption).toEqual({
            id: 99,
            label: 'Legacy Team',
        })
    })

    it('should expose a no-op onLoad and disable load more', async () => {
        const { result } = renderHook(() =>
            useTeamOptions({ currentTeam: null }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.shouldLoadMore).toBe(false)
        expect(result.current.onLoad()).toBeUndefined()
    })
})
