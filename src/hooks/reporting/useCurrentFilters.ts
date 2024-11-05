import _isEqual from 'lodash/isEqual'

import useSessionStorage from 'hooks/useSessionStorage'
import {
    isAggregationWindowFilter,
    isCustomFieldFilter,
    isFilterWithLogicalOperator,
    isPeriodFilter,
    isTagFilter,
    OptionalFilter,
} from 'models/reporting/queryFactories/utils'
import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'
import {defaultStatsFilters} from 'state/stats/statsSlice'

export const CURRENT_FILTERS = 'current-filters'

export const getValidator = (
    filterKey: FilterKey
): ((filter: any) => boolean) => {
    switch (filterKey) {
        case FilterKey.Period:
            return isPeriodFilter
        case FilterKey.CustomFields:
            return isCustomFieldFilter
        case FilterKey.Tags:
            return isTagFilter
        case FilterKey.AggregationWindow:
            return isAggregationWindowFilter
        case FilterKey.Agents:
        case FilterKey.CampaignStatuses:
        case FilterKey.Campaigns:
        case FilterKey.Channels:
        case FilterKey.HelpCenters:
        case FilterKey.Integrations:
        case FilterKey.LocaleCodes:
        case FilterKey.Score:
        case FilterKey.SlaPolicies:
        case FilterKey.CommunicationSkills:
        case FilterKey.ResolutionCompleteness:
            return isFilterWithLogicalOperator
    }
}

export const getShallowTypedFilters = (
    sessionFilters: string,
    defaultFilters: StatsFiltersWithLogicalOperator
): StatsFiltersWithLogicalOperator => {
    try {
        const filters = JSON.parse(sessionFilters) as {
            [value: string]: OptionalFilter
        }

        if (_isEqual(filters, defaultStatsFilters)) {
            return defaultFilters
        }

        const isCorrectlyTypes =
            typeof filters === 'object' &&
            Object.entries(filters).length > 0 &&
            Object.entries(filters).every(([filterKey, filter]) => {
                if (
                    !Object.values(FilterKey).includes(filterKey as FilterKey)
                ) {
                    return false
                }
                return getValidator(filterKey as FilterKey)(filter)
            })

        if (!isCorrectlyTypes) {
            throw new Error(
                'There seems to be an error with the filters retrieved from session storage'
            )
        }

        return filters as unknown as StatsFiltersWithLogicalOperator
    } catch (error) {
        console.error(error)
        return defaultFilters
    }
}

const persistFilters = (values: StatsFiltersWithLogicalOperator) => {
    try {
        sessionStorage.setItem(CURRENT_FILTERS, JSON.stringify(values))
    } catch {
        // If user is in private mode or has storage restriction
    }
}

export default function useCurrentFilters(
    defaultFilters: StatsFiltersWithLogicalOperator
): {
    filters: StatsFiltersWithLogicalOperator
    persistFilters: (values: StatsFiltersWithLogicalOperator) => void
} {
    const [filters] = useSessionStorage<string>(
        CURRENT_FILTERS,
        JSON.stringify(defaultFilters),
        true
    )

    return {
        filters: getShallowTypedFilters(filters, defaultFilters),
        persistFilters,
    }
}
