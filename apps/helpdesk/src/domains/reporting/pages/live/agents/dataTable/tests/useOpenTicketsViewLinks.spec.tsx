import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { useOpenTicketsViewLinks } from 'domains/reporting/pages/live/agents/dataTable/hooks/useOpenTicketsViewLinks'
import { initialState as uiFiltersInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import type { RootState } from 'state/types'

const storeState = {
    currentUser: fromJS({ timezone: 'Europe/Paris' }),
    stats: {
        filters: {
            period: {
                start_datetime: '2021-02-03T00:00:00.000Z',
                end_datetime: '2021-02-03T23:59:59.999Z',
            },
        },
    },
    ui: { stats: { filters: uiFiltersInitialState } },
    entities: { tags: {} },
} as unknown as RootState

const AGENT_ID = 42

describe('useOpenTicketsViewLinks', () => {
    it('builds assignee + open-status filters for the agent', () => {
        const { result } = renderHook(() => useOpenTicketsViewLinks(AGENT_ID), {
            storeState,
        })

        const { openTicketsFilters } = result.current

        // The agent's open tickets: assigned to the agent and in the open status.
        expect(
            openTicketsFilters.some((filter) => filter.right === AGENT_ID),
        ).toBe(true)
        expect(
            openTicketsFilters.some(
                (filter) => filter.right === JSON.stringify('open'),
            ),
        ).toBe(true)
    })

    it('adds the channel filter for a single channel', () => {
        const { result } = renderHook(() => useOpenTicketsViewLinks(AGENT_ID), {
            storeState,
        })

        const channelFilters = result.current.getChannelFilters('email')

        // Still scoped to the agent + open status, plus the channel.
        expect(channelFilters.some((filter) => filter.right === AGENT_ID)).toBe(
            true,
        )
        expect(
            channelFilters.some(
                (filter) => filter.right === JSON.stringify('email'),
            ),
        ).toBe(true)
    })
})
