import {LegacyStatsFilters} from 'models/stat/types'

export type HelpCenterStatsFilters = Omit<
    LegacyStatsFilters,
    'helpCenters' | 'localeCodes'
> & {
    helpCenters: number[]
    localeCodes: string[]
}

export const isHelpCenterStatsFiltersValid = (
    filters: LegacyStatsFilters
): filters is HelpCenterStatsFilters =>
    Array.isArray(filters.helpCenters) && Array.isArray(filters.localeCodes)
