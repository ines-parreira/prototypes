import {renderHook} from '@testing-library/react-hooks'
import {mockFlags} from 'jest-launchdarkly-mock'

import {FeatureFlagKey} from 'config/featureFlags'
import {useOptionalFiltersWithSatisfactionScoreFilter} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilter'
import {FilterKey} from 'models/stat/types'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'

describe('useGetOptionalFilters', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewCSATFilter]: false,
        })
    })

    it('should return the optional filters if AnalyticsNewCSATFilter is disabled', () => {
        const {result} = renderHook(() =>
            useOptionalFiltersWithSatisfactionScoreFilter([
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
            useOptionalFiltersWithSatisfactionScoreFilter([
                FilterKey.Channels,
            ] as OptionalFilter[])
        )

        expect(result.current).toEqual([FilterKey.Channels, FilterKey.Score])
    })
})
