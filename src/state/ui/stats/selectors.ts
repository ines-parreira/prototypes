import {RootState} from 'state/types'

export const isCleanStatsDirty = (state: RootState) =>
    state.ui.stats.isFilterDirty

export const getCleanStatsFilters = (state: RootState) =>
    state.ui.stats.cleanStatsFilters
