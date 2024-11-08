import {renderHook} from '@testing-library/react-hooks'
import {mockFlags} from 'jest-launchdarkly-mock'

import {FeatureFlagKey} from 'config/featureFlags'
import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import {FilterKey} from 'models/stat/types'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'

describe('useGetOptionalFilters', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewCSATFilter]: false,
            [FeatureFlagKey.AutoQAFilters]: false,
        })
    })

    it('should return the optional filters if AnalyticsNewCSATFilter is disabled', () => {
        const {result} = renderHook(() =>
            useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters([
                FilterKey.Channels,
            ] as OptionalFilter[])
        )

        expect(result.current).toEqual([FilterKey.Channels])
    })

    it('should return the optional filters with score filter if AnalyticsNewCSATFilter is enabled', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewCSATFilter]: true,
        })

        const {result} = renderHook(() =>
            useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters([
                FilterKey.Channels,
            ] as OptionalFilter[])
        )

        expect(result.current).toEqual([FilterKey.Channels, FilterKey.Score])
    })

    it('should return the optional filters with resolution completeness and communication skills filters if AutoQAFilters is enabled', () => {
        mockFlags({
            [FeatureFlagKey.AutoQAFilters]: true,
        })

        const {result} = renderHook(() =>
            useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters([
                FilterKey.Channels,
            ] as OptionalFilter[])
        )

        expect(result.current).toEqual([
            FilterKey.Channels,
            FilterKey.CommunicationSkills,
            FilterKey.ResolutionCompleteness,
        ])
    })

    it('should return the optional filters with LanguageProficiency', () => {
        mockFlags({
            [FeatureFlagKey.AutoQAFilters]: true,
            [FeatureFlagKey.AutoQaLanguageProficiency]: true,
        })

        const {result} = renderHook(() =>
            useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters([
                FilterKey.Channels,
            ] as OptionalFilter[])
        )

        expect(result.current).toEqual([
            FilterKey.Channels,
            FilterKey.CommunicationSkills,
            FilterKey.ResolutionCompleteness,
            FilterKey.LanguageProficiency,
        ])
    })
})
