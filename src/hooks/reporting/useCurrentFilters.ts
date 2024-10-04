import _isEqual from 'lodash/isEqual'

import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'
import useSessionStorage from 'hooks/useSessionStorage'
import {
    isCustomFieldFilter,
    isFilterWithLogicalOperator,
    isPeriodFilter,
    isTagFilter,
    OptionalFilter,
} from 'models/reporting/queryFactories/utils'
import {defaultStatsFilters} from 'state/stats/statsSlice'

export const CURRENT_FILTERS = 'current-filters'

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
                switch (filterKey) {
                    case FilterKey.Period:
                        return isPeriodFilter(filter)
                    case FilterKey.CustomFields:
                        return isCustomFieldFilter(filter)
                    case FilterKey.Tags:
                        return isTagFilter(filter)
                    default:
                        return isFilterWithLogicalOperator(filter)
                }
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
