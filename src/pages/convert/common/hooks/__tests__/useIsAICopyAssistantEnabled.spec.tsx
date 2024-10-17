import {renderHook} from '@testing-library/react-hooks'
import LD from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {useIsAICopyAssistantEnabled} from '../useIsAICopyAssistantEnabled'

describe('isAICopyAssistantEnabled', () => {
    it('feature flag is enabled', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertAiCopyAssistant]: true,
        }))
        const {result} = renderHook(() => useIsAICopyAssistantEnabled())
        expect(result.current).toBe(true)
    })

    it('feature flag is disabled', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertAiCopyAssistant]: false,
        }))
        const {result} = renderHook(() => useIsAICopyAssistantEnabled())
        expect(result.current).toBe(false)
    })
})
