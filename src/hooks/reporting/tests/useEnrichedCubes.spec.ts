import {renderHook} from '@testing-library/react-hooks'
import LD from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    renameCubesEnriched,
    useEnrichedCubes,
} from 'hooks/reporting/useEnrichedCubes'
import {closedTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'

describe('useEnrichedCubes', () => {
    const query = closedTicketsQueryFactory(
        {
            period: {
                start_datetime: '2020-01-16T03:04:56.789-10:00',
                end_datetime: '2020-01-17T03:04:56.789-10:00',
            },
        },
        'UTC'
    )

    it('should pass the query intact when the feature flag ios off', () => {
        jest.spyOn(LD, 'useFlags').mockReturnValue({
            [FeatureFlagKey.AnalyticsNewCubes]: false,
        })

        const {result} = renderHook(() => useEnrichedCubes(query))

        expect(result.current).toEqual(query)
    })

    it('should should rename Cubes in the query when the feature flag is on', () => {
        jest.spyOn(LD, 'useFlags').mockReturnValue({
            [FeatureFlagKey.AnalyticsNewCubes]: true,
        })

        const {result} = renderHook(() => useEnrichedCubes(query))

        expect(result.current).toEqual(renameCubesEnriched(query))
    })
})
