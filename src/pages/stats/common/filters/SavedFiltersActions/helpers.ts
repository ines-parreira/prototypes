import _isEmpty from 'lodash/isEmpty'
import {
    FilterComponentKey,
    FilterKey,
    StatsFiltersWithLogicalOperator,
} from 'models/stat/types'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'

export const isFilterFilled = (
    filterKey: OptionalFilter,
    filters: StatsFiltersWithLogicalOperator
): boolean => {
    switch (filterKey) {
        case FilterKey.Period:
        case FilterKey.AggregationWindow:
            return !_isEmpty(filters?.[filterKey])
        case FilterKey.Agents:
        case FilterKey.CampaignStatuses:
        case FilterKey.Campaigns:
        case FilterKey.Channels:
        case FilterKey.HelpCenters:
        case FilterKey.Integrations:
        case FilterKey.LocaleCodes:
        case FilterKey.Score:
        case FilterKey.SlaPolicies:
            return !_isEmpty(filters?.[filterKey]?.values)
        case FilterKey.Tags:
        case FilterKey.CustomFields:
            return (
                filters?.[filterKey]?.some(
                    (filter) => !_isEmpty(filter?.values)
                ) || false
            )
        case FilterComponentKey.PhoneIntegrations:
            return !_isEmpty(filters?.[FilterKey.Integrations]?.values)
    }
}

export const areFiltersFilled = (
    optionalFilterKeys: OptionalFilter[],
    statsFilters: StatsFiltersWithLogicalOperator
): boolean =>
    optionalFilterKeys.some((filterKey) =>
        isFilterFilled(filterKey, statsFilters)
    )
