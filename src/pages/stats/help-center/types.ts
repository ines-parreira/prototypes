import {StatsFilters} from 'models/stat/types'

export type HelpCenterStatsFilters = Omit<
    StatsFilters,
    'helpCenters' | 'localeCodes'
> & {
    helpCenters: number[]
    localeCodes: string[]
}

export const isHelpCenterStatsFiltersValid = (
    filters: StatsFilters
): filters is HelpCenterStatsFilters =>
    Array.isArray(filters.helpCenters) && Array.isArray(filters.localeCodes)
