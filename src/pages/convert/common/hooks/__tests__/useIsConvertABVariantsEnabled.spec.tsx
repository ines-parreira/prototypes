import {renderHook} from '@testing-library/react-hooks'
import LD from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

import {useIsConvertABVariantsEnabled} from '../useIsConvertABVariantsEnabled'

describe('useIsConvertABVariantsEnable', () => {
    beforeEach(() => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertABVariants]: true,
        }))
    })

    it('feature flag is enabled', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertABVariants]: true,
        }))
        const {result} = renderHook(() => useIsConvertABVariantsEnabled())

        expect(result.current).toBe(true)
    })

    it('feature flag is disabled', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertABVariants]: false,
        }))
        const {result} = renderHook(() => useIsConvertABVariantsEnabled())
        expect(result.current).toBe(false)
    })
})
