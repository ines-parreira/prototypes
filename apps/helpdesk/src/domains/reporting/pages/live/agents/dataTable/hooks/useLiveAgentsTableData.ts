import { useCallback, useMemo, useState } from 'react'

import {
    resolveActiveStatus,
    useCustomAgentUnavailableStatusesFlag,
    useSelectableAgentAvailabilityStatuses,
} from '@repo/agent-status'
import { useAllUserAvailabilities, useAllUsersLoadingState } from '@repo/users'
import moment from 'moment-timezone'
import { useAgentsOnlineStatus } from '@gorgias/realtime'

import type { SortingState } from '@gorgias/axiom'

import type { LegacyStatsFilters } from 'domains/reporting/models/stat/types'
import { StatType } from 'domains/reporting/models/stat/types'
import {
    AGENTS_FILTER_ID,
    AVAILABILITY_COLUMN_ID,
    LIVE_AGENTS_FALLBACK_METRIC_AXES,
    ONLINE_STATUS_COLUMN_ID,
} from 'domains/reporting/pages/live/agents/dataTable/constants'
import { parseUserPerformanceStat } from 'domains/reporting/pages/live/agents/dataTable/utils/parseUserPerformanceStat'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import { useAppSelector } from 'hooks/useAppSelector'
import { useChannels } from 'services/channels'

import { useLiveAgentsStats } from 'domains/reporting/pages/live/agents/dataTable/hooks/useLiveAgentsStats'
import type { LiveAgentUser } from 'domains/reporting/pages/live/agents/dataTable/hooks/useLiveAgentsUsers'
import { useLiveAgentsUsers } from 'domains/reporting/pages/live/agents/dataTable/hooks/useLiveAgentsUsers'
import type { LiveAgentMetricsByUserId } from 'domains/reporting/pages/live/agents/dataTable/LiveAgentMetricsContext'
import type {
    LiveAgentMetricAxis,
    LiveAgentRow,
} from 'domains/reporting/pages/live/agents/dataTable/types'

export const LIVE_AGENTS_DEFAULT_PAGE_SIZE = 25

/** Online agents first by default (descending puts online above offline). */
export const LIVE_AGENTS_DEFAULT_SORTING: SortingState = [
    { id: ONLINE_STATUS_COLUMN_ID, desc: true },
]

type UseLiveAgentsTableDataResult = {
    rows: LiveAgentRow[]
    metricsByUserId: LiveAgentMetricsByUserId
    metricAxes: LiveAgentMetricAxis[]
    pageStatsFilters: LegacyStatsFilters
    isAgentAvailabilityEnabled: boolean
    /** Table-wide loading: the agent list itself is still loading. */
    isLoading: boolean
    /** Per-cell loading: the agents are loaded but their stats are still fetching. */
    areMetricsLoading: boolean
    sorting: SortingState
    onSortingChange: (sorting: SortingState) => void
    search: string
    onSearchChange: (search: string) => void
}

/**
 * Aggregates the Live Agents data sources for the DataTable. The agent list,
 * realtime online presence, availability AND the per-agent stats all load
 * globally — stats for every agent in a single request — so sorting works across
 * the whole dataset (including the metric columns) and search can match each
 * agent's open-ticket channels. The DataTable owns pagination (client-side);
 * sorting and search are applied here.
 */
export function useLiveAgentsTableData(): UseLiveAgentsTableDataResult {
    const isAgentAvailabilityEnabled = useCustomAgentUnavailableStatusesFlag()
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)

    const allAgents = useLiveAgentsUsers()
    const { isLoading: areUsersLoading } = useAllUsersLoadingState()
    const channelOptions = useChannels()

    const { onlineAgents } = useAgentsOnlineStatus()
    const availabilities = useAllUserAvailabilities()
    const { allStatuses } = useSelectableAgentAvailabilityStatuses()

    // Sort the availability column alphabetically by the resolved status name
    // (e.g. "Meetings" before "Walking Dog"), not by the raw `user_status`
    // string — that value is "custom" for every custom status, so they would
    // never order by their actual label.
    const availabilityNameByUserId = useMemo(() => {
        const map = new Map<number, string>()
        availabilities.forEach((availability) => {
            const status = resolveActiveStatus(availability, allStatuses)
            map.set(availability.user_id, status?.name ?? '')
        })
        return map
    }, [availabilities, allStatuses])

    const channelNameBySlug = useMemo(() => {
        const map = new Map<string, string>()
        channelOptions.forEach((channel) => map.set(channel.slug, channel.name))
        return map
    }, [channelOptions])

    const [sorting, setSorting] = useState<SortingState>(
        LIVE_AGENTS_DEFAULT_SORTING,
    )
    const [search, setSearch] = useState('')

    // `onChange` fires with an unchanged value on every render; the equality
    // guards prevent that from looping into a fresh state update.
    const onSortingChange = useCallback((next: SortingState) => {
        setSorting((prev) =>
            JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
        )
    }, [])

    const onSearchChange = useCallback((next: string) => {
        setSearch((prev) => (prev === next ? prev : next))
    }, [])

    const pageStatsFilters = useMemo<LegacyStatsFilters>(() => {
        const currentDay = userTimezone ? moment().tz(userTimezone) : moment()
        return {
            channels: [],
            period: {
                start_datetime: currentDay.clone().startOf('day').format(),
                end_datetime: currentDay.clone().endOf('day').format(),
            },
        }
    }, [userTimezone])

    // Stats for every agent at once (the full agent list is already loaded), so
    // the metric columns can be sorted and search can match an agent's channels
    // across the whole dataset — independent of search/sort/pagination.
    const allUserIds = useMemo(
        () => allAgents.map((agent) => agent.id),
        [allAgents],
    )

    const { stat, isFetching } = useLiveAgentsStats({
        userIds: allUserIds,
        filters: pageStatsFilters,
    })

    const parsed = useMemo(() => parseUserPerformanceStat(stat), [stat])

    // Until the stats resolve there are no axes in the response, so fall back to
    // the known metric columns. This keeps the column set (and the layout)
    // stable across the load instead of having the metric columns shift in once
    // the request completes.
    const metricAxes = useMemo(
        () =>
            parsed.metricAxes.length > 0
                ? parsed.metricAxes
                : LIVE_AGENTS_FALLBACK_METRIC_AXES,
        [parsed.metricAxes],
    )

    const metricNames = useMemo(
        () => new Set(metricAxes.map((axis) => axis.name)),
        [metricAxes],
    )

    // Search matches the agent's name OR a channel they have open tickets on
    // (by the channel's display name or slug).
    const filteredAgents = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) {
            return allAgents
        }
        const matchesChannel = (agentId: number): boolean => {
            const cells = parsed.byUserId.get(agentId)
            const ticketDetails = cells
                ? Object.values(cells).find(
                      (cell) => cell?.type === StatType.TicketDetails,
                  )
                : undefined
            const breakdown = ticketDetails?.details
            if (!breakdown) {
                return false
            }
            return Object.entries(breakdown).some(([slug, count]) => {
                if (!count) {
                    return false
                }
                const name = channelNameBySlug.get(slug) ?? slug
                return (
                    name.toLowerCase().includes(query) ||
                    slug.toLowerCase().includes(query)
                )
            })
        }
        return allAgents.filter(
            (agent) =>
                agent.name.toLowerCase().includes(query) ||
                matchesChannel(agent.id),
        )
    }, [allAgents, search, parsed.byUserId, channelNameBySlug])

    // Agent-metadata sort (name / online / availability), kept independent of
    // metrics so these sorts don't re-shuffle (and reset the page) when the
    // stats arrive.
    const metaSortedAgents = useMemo(() => {
        const sort = sorting[0]
        if (!sort || metricNames.has(sort.id)) {
            return filteredAgents
        }
        const direction = sort.desc ? -1 : 1
        const compare = (a: LiveAgentUser, b: LiveAgentUser): number => {
            switch (sort.id) {
                case AGENTS_FILTER_ID:
                    return a.name.localeCompare(b.name) * direction
                case ONLINE_STATUS_COLUMN_ID:
                    return (
                        (Number(Boolean(onlineAgents[a.id])) -
                            Number(Boolean(onlineAgents[b.id]))) *
                        direction
                    )
                case AVAILABILITY_COLUMN_ID: {
                    const nameA = availabilityNameByUserId.get(a.id) ?? ''
                    const nameB = availabilityNameByUserId.get(b.id) ?? ''
                    // Agents with no resolvable status always sort last,
                    // regardless of the sort direction.
                    if (!nameA || !nameB) {
                        if (nameA === nameB) {
                            return 0
                        }
                        return nameA ? -1 : 1
                    }
                    return nameA.localeCompare(nameB) * direction
                }
                default:
                    return 0
            }
        }
        return [...filteredAgents].sort(compare)
    }, [
        filteredAgents,
        sorting,
        onlineAgents,
        availabilityNameByUserId,
        metricNames,
    ])

    // Metric-column sort reads the value from the parsed stats. Split from the
    // metadata sort so it only recomputes (and only it re-shuffles on stats
    // load) when a metric column is the active sort.
    const sortedAgents = useMemo(() => {
        const sort = sorting[0]
        if (!sort || !metricNames.has(sort.id)) {
            return metaSortedAgents
        }
        const direction = sort.desc ? -1 : 1
        const metricValue = (id: number): number => {
            const cell = parsed.byUserId.get(id)?.[sort.id]
            return typeof cell?.value === 'number' ? cell.value : 0
        }
        return [...filteredAgents].sort(
            (a, b) => (metricValue(a.id) - metricValue(b.id)) * direction,
        )
    }, [
        metaSortedAgents,
        filteredAgents,
        sorting,
        metricNames,
        parsed.byUserId,
    ])

    const rows = useMemo<LiveAgentRow[]>(
        () =>
            sortedAgents.map((agent) => ({
                userId: agent.id,
                userName: agent.name,
                user: agent.user,
            })),
        [sortedAgents],
    )

    return {
        rows,
        metricsByUserId: parsed.byUserId,
        metricAxes,
        pageStatsFilters,
        isAgentAvailabilityEnabled,
        isLoading: areUsersLoading,
        areMetricsLoading: isFetching && parsed.metricAxes.length === 0,
        sorting,
        onSortingChange,
        search,
        onSearchChange,
    }
}
