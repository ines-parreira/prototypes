import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {FilterKey} from 'models/stat/types'
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

        return [
            ...optionalFilters,
            ...(analyticsNewCSATFilter ? [FilterKey.Score] : []),
            ...(autoQaFilters && hasAutomate
                ? [
                      FilterKey.CommunicationSkills,
                      FilterKey.ResolutionCompleteness,
                      FilterKey.LanguageProficiency,
                  ]
                : []),
            ...(autoQaFilters
                ? [
                      FilterKey.Accuracy,
                      FilterKey.BrandVoice,
                      FilterKey.Efficiency,
                      FilterKey.InternalCompliance,
                  ]
                : []),
        ]
    }
