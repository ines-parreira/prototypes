import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {FilterKey} from 'models/stat/types'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'

type UseOptionalFiltersWithSatisfactionScoreFilter = (
    optionalFilters: OptionalFilter[]
) => OptionalFilter[]

export const useOptionalFiltersWithSatisfactionScoreFilter: UseOptionalFiltersWithSatisfactionScoreFilter =
    (optionalFilters) => {
        const analyticsNewCSATFilter =
            !!useFlags()[FeatureFlagKey.AnalyticsNewCSATFilter]
        return [
            ...optionalFilters,
            ...(analyticsNewCSATFilter ? [FilterKey.Score] : []),
        ]
    }
