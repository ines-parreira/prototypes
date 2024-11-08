import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {FilterKey} from 'models/stat/types'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'

type UseOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters = (
    optionalFilters: OptionalFilter[]
) => OptionalFilter[]

export const useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters: UseOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters =
    (optionalFilters) => {
        const analyticsNewCSATFilter =
            !!useFlags()[FeatureFlagKey.AnalyticsNewCSATFilter]
        const autoQaFilters = !!useFlags()[FeatureFlagKey.AutoQAFilters]
        return [
            ...optionalFilters,
            ...(analyticsNewCSATFilter ? [FilterKey.Score] : []),
            ...(autoQaFilters
                ? [
                      FilterKey.CommunicationSkills,
                      FilterKey.ResolutionCompleteness,
                  ]
                : []),
        ]
    }
