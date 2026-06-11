import { useMemo } from 'react'

import { useAgentsOnlineStatus } from '@gorgias/realtime'

import { useAllUsersLoadingState } from '@repo/users'

import type { LiveAgentUser } from 'domains/reporting/pages/live/agents/dataTable/hooks/useLiveAgentsUsers'
import { useLiveAgentsUsers } from 'domains/reporting/pages/live/agents/dataTable/hooks/useLiveAgentsUsers'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import { useAppSelector } from 'hooks/useAppSelector'

export type LiveOverviewAgentStatus = {
    onlineAgents: LiveAgentUser[]
    offlineAgents: LiveAgentUser[]
    isLoading: boolean
}

/**
 * Splits the active agents into online/offline buckets using the realtime
 * presence data from Ably (via `useAgentsOnlineStatus`) instead of the legacy
 * `users-statuses` stat. The page's agents/teams filter is applied client-side
 * (teams are already expanded to agent ids in the filter); an empty filter
 * means account-wide, matching the Live Agents page the tooltips link to.
 */
export function useLiveOverviewAgentStatus(): LiveOverviewAgentStatus {
    const agents = useLiveAgentsUsers()
    const { onlineAgents } = useAgentsOnlineStatus()
    const { isLoading } = useAllUsersLoadingState()
    const { cleanStatsFilters } = useAppSelector(
        getCleanStatsFiltersWithTimezone,
    )
    const selectedAgentIds = cleanStatsFilters.agents

    return useMemo(() => {
        const agentFilter =
            selectedAgentIds && selectedAgentIds.length > 0
                ? new Set(selectedAgentIds)
                : null

        const online: LiveAgentUser[] = []
        const offline: LiveAgentUser[] = []

        for (const agent of agents) {
            if (agentFilter && !agentFilter.has(agent.id)) {
                continue
            }
            if (onlineAgents[agent.id]) {
                online.push(agent)
            } else {
                offline.push(agent)
            }
        }

        return { onlineAgents: online, offlineAgents: offline, isLoading }
    }, [agents, onlineAgents, isLoading, selectedAgentIds])
}
