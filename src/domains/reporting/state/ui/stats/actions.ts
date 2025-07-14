import { filtersSlice } from 'domains/reporting/state/ui/stats/filtersSlice'

export const {
    statFiltersDirty,
    statFiltersClean,
    statFiltersCleanWithPayload,
    statFiltersWithLogicalOperatorsCleanWithPayload,
} = filtersSlice.actions
