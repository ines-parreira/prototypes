import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {FilterKey} from 'models/stat/types'
import {AUTO_QA_FILTER_KEYS} from 'pages/stats/common/filters/constants'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'
import {getHasAutomate} from 'state/billing/selectors'

type UseOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters = (
    optionalFilters: OptionalFilter[]
) => OptionalFilter[]

export const useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters: UseOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters =
    (optionalFilters) => {
        const hasAutomate = useAppSelector(getHasAutomate)
        const analyticsNewCSATFilter =
            !!useFlags()[FeatureFlagKey.AnalyticsNewCSATFilter]
        const autoQaFilters = !!useFlags()[FeatureFlagKey.AutoQAFilters]
        const filters = [
            ...optionalFilters,
            ...(analyticsNewCSATFilter ? [FilterKey.Score] : []),
        ]
        if (autoQaFilters && hasAutomate) {
            const uniqueFilters = new Set(filters)
            AUTO_QA_FILTER_KEYS.forEach((key) => uniqueFilters.add(key))
            return Array.from(uniqueFilters)
        }
        return filters.filter(
            (filter) => !AUTO_QA_FILTER_KEYS.find((key) => key === filter)
        )
    }
