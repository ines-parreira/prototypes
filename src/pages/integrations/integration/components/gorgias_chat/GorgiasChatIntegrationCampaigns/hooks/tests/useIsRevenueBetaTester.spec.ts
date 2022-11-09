import {renderHook} from 'react-hooks-testing-library'

import LD from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

import {useIsRevenueBetaTester} from '../useIsRevenueBetaTester'

describe('useIsRevenueBetaTester()', () => {
    describe('flag is undefined', () => {
        it('returns false', () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({}))

            const {result} = renderHook(() => useIsRevenueBetaTester())
            expect(result.current).toEqual(false)
        })
    })

    describe('flag is defined', () => {
        it('returns the value of the flag', () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.RevenueBetaTesters]: true,
            }))

            const {result} = renderHook(() => useIsRevenueBetaTester())
            expect(result.current).toEqual(true)
        })
    })
})
