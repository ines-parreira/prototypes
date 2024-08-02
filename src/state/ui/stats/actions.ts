import {createAction} from '@reduxjs/toolkit'
import {
    LegacyStatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'models/stat/types'

import {
    FETCH_STAT_ENDED,
    FETCH_STAT_STARTED,
    STAT_FILTERS_CLEAN,
    STAT_FILTERS_CLEAN_W_PAYLOAD,
    STAT_FILTERS_DIRTY,
    STAT_FILTERS_WITH_LOGICAL_OPERATOR_CLEAN_W_PAYLOAD,
} from 'state/ui/stats/constants'

export const fetchStatStarted = createAction<{
    statName: string
    resourceName: string
}>(FETCH_STAT_STARTED)

export const fetchStatEnded = createAction<{
    statName: string
    resourceName: string
}>(FETCH_STAT_ENDED)

export const statFiltersDirty = createAction(STAT_FILTERS_DIRTY)

export const statFiltersClean = createAction(STAT_FILTERS_CLEAN)

export const statFiltersCleanWithPayload = createAction<LegacyStatsFilters>(
    STAT_FILTERS_CLEAN_W_PAYLOAD
)

export const statFiltersWithLogicalOperatorsCleanWithPayload =
    createAction<StatsFiltersWithLogicalOperator>(
        STAT_FILTERS_WITH_LOGICAL_OPERATOR_CLEAN_W_PAYLOAD
    )
