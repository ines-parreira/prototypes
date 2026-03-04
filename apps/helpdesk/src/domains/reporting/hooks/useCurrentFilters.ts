import { useSessionStorage } from '@repo/hooks'
import _isEmpty from 'lodash/isEmpty'
import _isEqual from 'lodash/isEqual'

import {
    isAggregationWindowFilter,
    isCustomFieldFilter,
    isFilterWithLogicalOperator,
    isPeriodFilter,
    isTagFilter,
} from 'domains/reporting/models/queryFactories/utils'
import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { defaultStatsFilters } from 'domains/reporting/state/stats/statsSlice'

export const CURRENT_FILTERS = 'current-filters'

export const getValidator = (
    filterKey: FilterKey,
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
        case FilterKey.Accuracy:
        case FilterKey.Agents:
        case FilterKey.BrandVoice:
        case FilterKey.IsDuringBusinessHours:
        case FilterKey.Campaigns:
        case FilterKey.CampaignStatuses:
        case FilterKey.Channels:
        case FilterKey.JourneyType:
        case FilterKey.CommunicationSkills:
        case FilterKey.Efficiency:
        case FilterKey.HelpCenters:
        case FilterKey.Integrations:
        case FilterKey.StoreIntegrations:
        case FilterKey.Stores:
        case FilterKey.InternalCompliance:
        case FilterKey.LanguageProficiency:
        case FilterKey.LocaleCodes:
        case FilterKey.ResolutionCompleteness:
        case FilterKey.Score:
        case FilterKey.SlaPolicies:
        case FilterKey.VoiceQueues:
        case FilterKey.AssignedTeam:
        case FilterKey.JourneyCampaigns:
        case FilterKey.JourneyFlows:
            return isFilterWithLogicalOperator
    }
}

export const validateAndParseFilters = (
    sessionFilters: string,
    defaultFilters: StatsFiltersWithLogicalOperator,
): StatsFiltersWithLogicalOperator => {
    try {
        const parsedSessionFilters: StatsFiltersWithLogicalOperator =
            JSON.parse(sessionFilters)

        if (_isEqual(parsedSessionFilters, defaultStatsFilters)) {
            return defaultFilters
        }

        if (
            typeof parsedSessionFilters !== 'object' ||
            _isEmpty(parsedSessionFilters) ||
            !parsedSessionFilters[FilterKey.Period]
        ) {
            console.error('Invalid filter structure.')
            return defaultFilters
        }

        const isFilterKey = (key: string): key is FilterKey => {
            return Object.values(FilterKey).includes(key as FilterKey)
        }

        const isValid = Object.entries(parsedSessionFilters).every(
            ([key, value]) => {
                if (!isFilterKey(key)) return false

                return getValidator(key)(value)
            },
        )

        if (!isValid) {
            console.error('Invalid filter type.')
            return defaultFilters
        }

        return parsedSessionFilters
    } catch (error) {
        console.error('Error validating filters:', error)
        return defaultFilters
    }
}

export default function useCurrentFilters(
    defaultFilters: StatsFiltersWithLogicalOperator,
): {
    filters: StatsFiltersWithLogicalOperator
    persistFilters: (values: StatsFiltersWithLogicalOperator) => void
} {
    const [filters, persistFilters] = useSessionStorage<string>(
        CURRENT_FILTERS,
        JSON.stringify(defaultFilters),
        true,
    )

    const saveFilters = (values: StatsFiltersWithLogicalOperator) => {
        try {
            persistFilters(JSON.stringify(values))
        } catch (error) {
            // If user is in private mode or has storage restriction
            console.error('Error saving filters in session storage:', error)
        }
    }

    return {
        filters: validateAndParseFilters(filters, defaultFilters),
        persistFilters: saveFilters,
    }
}
