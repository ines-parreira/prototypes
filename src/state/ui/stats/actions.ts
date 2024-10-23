import {filtersSlice} from 'state/ui/stats/filtersSlice'

export const {
    statFiltersDirty,
    statFiltersClean,
    statFiltersCleanWithPayload,
    statFiltersWithLogicalOperatorsCleanWithPayload,
} = filtersSlice.actions
