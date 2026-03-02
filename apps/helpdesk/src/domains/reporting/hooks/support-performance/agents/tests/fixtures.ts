import { fromJS } from 'immutable'

import type { AgentAvailabilityData } from 'domains/reporting/pages/support-performance/agents/utils'
import { initialState as agentAvailabilityInitialState } from 'domains/reporting/state/ui/stats/agentAvailabilitySlice'
import { AGENT_AVAILABILITY_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { agents } from 'fixtures/agents'
import type { RootState } from 'state/types'

export const period = {
    start_datetime: '2021-02-03T00:00:00.000Z',
    end_datetime: '2021-02-03T23:59:59.999Z',
}

export const cleanStatsFilters = { period }

export const userTimezone = 'UTC'

export const mockAvailabilityAgents: AgentAvailabilityData[] = [
    {
        id: 1,
        name: 'Agent One',
        email: 'agent1@example.com',
        agent_online_time: 3600000,
        agent_status_available: { total: 1800000, online: 0, offline: 0 },
        agent_status_unavailable: { total: 900000, online: 0, offline: 0 },
        agent_status_on_call: { total: 600000, online: 0, offline: 0 },
        agent_status_wrapping_up: { total: 300000, online: 0, offline: 0 },
    },
    {
        id: 2,
        name: 'Agent Two',
        email: 'agent2@example.com',
        agent_online_time: 7200000,
        agent_status_available: { total: 3600000, online: 0, offline: 0 },
        agent_status_unavailable: { total: 1800000, online: 0, offline: 0 },
        agent_status_on_call: { total: 1200000, online: 0, offline: 0 },
        agent_status_wrapping_up: { total: 600000, online: 0, offline: 0 },
    },
]

export const defaultState = {
    agents: fromJS({
        all: agents,
    }),
    stats: {
        filters: { period },
    },
    ui: {
        stats: {
            filters: uiStatsInitialState,
            statsTables: {
                [AGENT_AVAILABILITY_SLICE_NAME]: agentAvailabilityInitialState,
            },
        },
    },
} as RootState
