import { assumeMock, renderHook } from '@repo/testing'

import { mockUser } from '@gorgias/helpdesk-mocks'
import { useAgentsOnlineStatus } from '@gorgias/realtime'

import { useAllUsersLoadingState } from '@repo/users'

import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { LiveAgentUser } from 'domains/reporting/pages/live/agents/dataTable/hooks/useLiveAgentsUsers'
import { useLiveAgentsUsers } from 'domains/reporting/pages/live/agents/dataTable/hooks/useLiveAgentsUsers'
import { useLiveOverviewAgentStatus } from 'domains/reporting/pages/live/overview/useLiveOverviewAgentStatus'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'

jest.mock('@gorgias/realtime')
jest.mock(
    'domains/reporting/pages/live/agents/dataTable/hooks/useLiveAgentsUsers',
)
jest.mock('@repo/users', () => ({
    ...jest.requireActual('@repo/users'),
    useAllUsersLoadingState: jest.fn(),
}))

const useAgentsOnlineStatusMock = assumeMock(useAgentsOnlineStatus)
const useLiveAgentsUsersMock = assumeMock(useLiveAgentsUsers)
const useAllUsersLoadingStateMock = assumeMock(useAllUsersLoadingState)

function agent(id: number, name: string): LiveAgentUser {
    return { id, name, user: mockUser({ id, name }) }
}

const alice = agent(1, 'Alice')
const bob = agent(2, 'Bob')
const carol = agent(3, 'Carol')

function renderStatus(agentFilterIds: number[] = []) {
    return renderHook(() => useLiveOverviewAgentStatus(), {
        storeState: {
            stats: {
                filters: {
                    period: {
                        start_datetime: '2021-02-03T00:00:00.000Z',
                        end_datetime: '2021-02-03T23:59:59.999Z',
                    },
                    agents: withDefaultLogicalOperator(agentFilterIds),
                },
            },
            ui: { stats: { filters: uiStatsInitialState } },
        },
    })
}

describe('useLiveOverviewAgentStatus', () => {
    beforeEach(() => {
        useLiveAgentsUsersMock.mockReturnValue([alice, bob, carol])
        useAgentsOnlineStatusMock.mockReturnValue({ onlineAgents: {} })
        useAllUsersLoadingStateMock.mockReturnValue({
            isLoading: false,
            isError: false,
        })
    })

    it('splits agents into online and offline buckets from realtime presence', () => {
        useAgentsOnlineStatusMock.mockReturnValue({
            onlineAgents: { [alice.id]: alice.user, [carol.id]: carol.user },
        })

        const { result } = renderStatus()

        expect(result.current.onlineAgents).toEqual([alice, carol])
        expect(result.current.offlineAgents).toEqual([bob])
    })

    it('treats every agent as offline when no one is online', () => {
        const { result } = renderStatus()

        expect(result.current.onlineAgents).toEqual([])
        expect(result.current.offlineAgents).toEqual([alice, bob, carol])
    })

    it('applies the page agents/teams filter to the buckets', () => {
        useAgentsOnlineStatusMock.mockReturnValue({
            onlineAgents: { [alice.id]: alice.user, [carol.id]: carol.user },
        })

        // Filter to Alice + Bob only — Carol is excluded from both buckets.
        const { result } = renderStatus([alice.id, bob.id])

        expect(result.current.onlineAgents).toEqual([alice])
        expect(result.current.offlineAgents).toEqual([bob])
    })

    it('forwards the users loading state', () => {
        useAllUsersLoadingStateMock.mockReturnValue({
            isLoading: true,
            isError: false,
        })

        const { result } = renderStatus()

        expect(result.current.isLoading).toBe(true)
    })
})
