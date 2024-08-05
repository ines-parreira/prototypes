import {renderHook} from '@testing-library/react-hooks'
import LD from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

import {useAreConvertLLMProductRecommendationsEnabled} from '../useAreConvertLLMProductRecommendationsEnabled'

describe('useAreConvertLLMProductRecommendationsEnabled', () => {
    it('feature flag is enabled', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertLLMProductRecommendations]: true,
        }))
        const {result} = renderHook(() =>
            useAreConvertLLMProductRecommendationsEnabled()
        )
        expect(result.current).toBe(true)
    })

    it('feature flag is disabled', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertLLMProductRecommendations]: false,
        }))
        const {result} = renderHook(() =>
            useAreConvertLLMProductRecommendationsEnabled()
        )
        expect(result.current).toBe(false)
    })
})
