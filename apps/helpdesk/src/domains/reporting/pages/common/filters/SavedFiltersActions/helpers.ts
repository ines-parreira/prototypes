import _isEmpty from 'lodash/isEmpty'

import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import {
    FilterComponentKey,
    FilterKey,
} from 'domains/reporting/models/stat/types'
import type { OptionalFilter } from 'domains/reporting/pages/common/filters/FiltersPanel'

export const isFilterFilled = (
    filterKey: OptionalFilter,
    filters: StatsFiltersWithLogicalOperator,
): boolean => {
    switch (filterKey) {
        case FilterKey.Period:
        case FilterKey.AggregationWindow:
            return !_isEmpty(filters?.[filterKey])
        case FilterKey.Agents:
        case FilterKey.IsDuringBusinessHours:
        case FilterKey.CampaignStatuses:
        case FilterKey.Campaigns:
        case FilterKey.Channels:
        case FilterKey.JourneyType:
        case FilterKey.JourneyFlows:
        case FilterKey.JourneyCampaigns:
        case FilterKey.HelpCenters:
        case FilterKey.Integrations:
        case FilterKey.StoreIntegrations:
        case FilterKey.Stores:
        case FilterKey.LocaleCodes:
        case FilterKey.Score:
        case FilterKey.SlaPolicies:
        case FilterKey.CommunicationSkills:
        case FilterKey.LanguageProficiency:
        case FilterKey.Accuracy:
        case FilterKey.Efficiency:
        case FilterKey.InternalCompliance:
        case FilterKey.BrandVoice:
        case FilterKey.ResolutionCompleteness:
        case FilterKey.VoiceQueues:
        case FilterKey.AssignedTeam:
            return !_isEmpty(filters?.[filterKey]?.values)
        case FilterKey.Tags:
        case FilterKey.CustomFields:
            return (
                filters?.[filterKey]?.some(
                    (filter) => !_isEmpty(filter?.values),
                ) || false
            )
        case FilterComponentKey.PhoneIntegrations:
            return !_isEmpty(filters?.[FilterKey.Integrations]?.values)
    }
}

export const areFiltersFilled = (
    optionalFilterKeys: OptionalFilter[],
    statsFilters: StatsFiltersWithLogicalOperator,
): boolean =>
    optionalFilterKeys.some((filterKey) =>
        isFilterFilled(filterKey, statsFilters),
    )
