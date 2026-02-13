import type { PayloadAction } from '@reduxjs/toolkit'
import { createSelector, createSlice } from '@reduxjs/toolkit'
import { getSortByName } from '@repo/utils'
import _intersectionBy from 'lodash/intersectionBy'

import type { User } from 'config/types/user'
import type { ReportingMetricItem } from 'domains/reporting/hooks/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { isMetricForAgent } from 'domains/reporting/pages/common/utils'
import { statsFiltersWithLogicalOperatorsFromSavedFilters } from 'domains/reporting/state/stats/utils'
import {
    getIsSavedFilterApplied,
    getSavedFilterDraft,
} from 'domains/reporting/state/ui/stats/filtersSlice'
import { getCleanStatsFilters } from 'domains/reporting/state/ui/stats/selectors'
import type {
    StatsTablesState,
    VoiceAgentsTableColumn,
} from 'domains/reporting/state/ui/stats/types'
import { AgentsTableColumn } from 'domains/reporting/state/ui/stats/types'
import { OrderDirection } from 'models/api/types'
import { getHumanAndAutomationBotAgentsJS } from 'state/agents/selectors'
import type { RootState } from 'state/types'

export type AgentPerformanceSorting<T> = {
    field: T
    direction: OrderDirection
}

export type AgentPerformanceState<T> = {
    sorting: AgentPerformanceSorting<T> & {
        isLoading: boolean
        lastSortingMetric: Maybe<ReportingMetricItem[]>
    }
    pagination: {
        currentPage: number
        perPage: number
    }
    heatmapMode: boolean
}

export const DEFAULT_SORTING_DIRECTION = OrderDirection.Asc

export function createTableSlice<
    T extends AgentsTableColumn | VoiceAgentsTableColumn,
>(config: {
    sliceName: string
    defaultSortingField: T
    agentIdFields: string[]
}) {
    const { sliceName, defaultSortingField, agentIdFields } = config

    const initialState: AgentPerformanceState<T> = {
        sorting: {
            field: defaultSortingField,
            direction: OrderDirection.Desc,
            isLoading: false,
            lastSortingMetric: null,
        },
        pagination: {
            currentPage: 1,
            perPage: 10,
        },
        heatmapMode: false,
    }

    const slice = createSlice({
        name: sliceName,
        initialState,
        reducers: {
            sortingSet(
                state,
                action: PayloadAction<AgentPerformanceSorting<T>>,
            ) {
                state.sorting.field = action.payload.field as any // Type assertion to avoid Draft<T> error
                state.sorting.direction = action.payload.direction
                state.sorting.isLoading = true
                state.pagination.currentPage = 1
            },
            sortingLoading(state) {
                state.sorting.isLoading = true
                state.pagination.currentPage = 1
            },
            sortingLoaded(
                state,
                action: PayloadAction<Maybe<ReportingMetricItem[]>>,
            ) {
                state.sorting.isLoading = false
                state.sorting.lastSortingMetric = action.payload
                state.pagination.currentPage = 1
            },
            pageSet(state, action: PayloadAction<number>) {
                if (action.payload < 1) {
                    state.pagination.currentPage = 1
                } else {
                    state.pagination.currentPage = action.payload
                }
            },
            toggleHeatmapMode(state) {
                state.heatmapMode = !state.heatmapMode
            },
        },
    })

    const getSliceState = (state: RootState) =>
        state.ui.stats.statsTables[
            sliceName as keyof StatsTablesState
        ] as AgentPerformanceState<T>

    const getAgentSorting = createSelector(
        getSliceState,
        (state) => state.sorting,
    )

    const isSortingMetricLoading = createSelector(
        getSliceState,
        (state) => state.sorting.isLoading,
    )

    const getAgentsPagination = createSelector(
        getSliceState,
        (state) => state.pagination,
    )

    const getHeatmapMode = createSelector(
        getSliceState,
        (state) => state.heatmapMode,
    )

    const getFilteredAgents = createSelector(
        getHumanAndAutomationBotAgentsJS,
        getCleanStatsFilters,
        getSavedFilterDraft,
        getIsSavedFilterApplied,
        (agents, filters, savedFilters, isSavedFilterApplied) => {
            const effectiveFilters = isSavedFilterApplied
                ? statsFiltersWithLogicalOperatorsFromSavedFilters(
                      savedFilters?.filter_group,
                  )
                : filters
            if (
                effectiveFilters !== null &&
                effectiveFilters?.agents &&
                effectiveFilters.agents.values.length > 0
            ) {
                if (
                    effectiveFilters.agents.operator ===
                    LogicalOperatorEnum.NOT_ONE_OF
                ) {
                    return agents.filter(
                        (agent) =>
                            !effectiveFilters.agents?.values.includes(agent.id),
                    )
                }
                return _intersectionBy(
                    agents,
                    effectiveFilters.agents.values.map((agentId: number) => ({
                        id: agentId,
                    })),
                    'id',
                )
            }
            return agents
        },
    )

    const getSortedAgents = createSelector(
        getFilteredAgents,
        getAgentSorting,
        (agentsList, sorting) => {
            const agents = agentsList
            const { direction, field, lastSortingMetric } = sorting
            const metricName =
                field !== AgentsTableColumn.AgentName ? field : null
            if (metricName && lastSortingMetric) {
                let sortedAgents: User[] = []
                const noDataAgents: User[] = []
                agents.forEach((agent: User) => {
                    const agentIndex = lastSortingMetric.findIndex(
                        (metric: ReportingMetricItem) =>
                            isMetricForAgent(metric, agent.id, agentIdFields),
                    )
                    if (agentIndex >= 0) {
                        sortedAgents[agentIndex] = agent
                    } else {
                        noDataAgents.push(agent)
                    }
                })

                sortedAgents = sortedAgents.filter(Boolean)

                return [...sortedAgents, ...noDataAgents]
            }
            const sortedAgents = agents.sort(getSortByName)
            return direction === OrderDirection.Asc
                ? sortedAgents
                : [...sortedAgents].reverse()
        },
    )

    const getPaginatedAgents = createSelector(
        getSortedAgents,
        getAgentsPagination,
        (agents, { currentPage, perPage }) => {
            const startingItem = (currentPage - 1) * perPage
            const lastItem = Math.min(startingItem + perPage, agents.length)
            return {
                agents: agents.slice(startingItem, lastItem),
                allAgents: agents,
                currentPage,
                perPage,
            }
        },
    )

    return {
        slice,
        initialState,
        actions: slice.actions,
        selectors: {
            getAgentSorting,
            isSortingMetricLoading,
            getAgentsPagination,
            getHeatmapMode,
            getFilteredAgents,
            getSortedAgents,
            getPaginatedAgents,
        },
    }
}
