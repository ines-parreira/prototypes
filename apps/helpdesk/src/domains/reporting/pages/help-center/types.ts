import type {
    StatsFiltersWithLogicalOperator,
    WithLogicalOperator,
} from 'domains/reporting/models/stat/types'

export type HelpCenterStatsFilters = Omit<
    StatsFiltersWithLogicalOperator,
    'helpCenters' | 'localeCodes'
> & {
    helpCenters: WithLogicalOperator<number>
    localeCodes: WithLogicalOperator<string>
}

export const isHelpCenterStatsFiltersValid = (
    filters: StatsFiltersWithLogicalOperator,
): filters is HelpCenterStatsFilters =>
    Array.isArray(filters.helpCenters?.values) &&
    Array.isArray(filters.localeCodes?.values)
