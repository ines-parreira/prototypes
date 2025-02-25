import { renderHook } from '@testing-library/react-hooks'
import LD from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'

import { useIsConvertPerformanceViewEnabled } from '../useIsConvertPerformanceViewEnabled'

describe('useIsConvertPerformanceViewEnabled', () => {
    it('feature flag is enabled', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertPerformanceView]: true,
        }))
        const { result } = renderHook(() =>
            useIsConvertPerformanceViewEnabled(),
        )
        expect(result.current).toBe(true)
    })

    it('feature flag is disabled', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertPerformanceView]: false,
        }))
        const { result } = renderHook(() =>
            useIsConvertPerformanceViewEnabled(),
        )
        expect(result.current).toBe(false)
    })
})
