import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import useIsCallbackRequestsEnabled from '../useIsCallbackRequestsEnabled'

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

describe('useIsCallbackRequestsEnabled', () => {
    const renderHookComponent = () =>
        renderHook(() => useIsCallbackRequestsEnabled())

    it('should return true when both feature flags are enabled', () => {
        useFlagMock.mockImplementation((key) => {
            if (key === FeatureFlagKey.VoiceCallbackEnabled1) return true
            if (key === FeatureFlagKey.VoiceCallbackEnabled2) return true
            return false
        })

        const { result } = renderHookComponent()
        expect(result.current).toBe(true)
        expect(useFlag).toHaveBeenCalledWith(
            FeatureFlagKey.VoiceCallbackEnabled1,
        )
        expect(useFlag).toHaveBeenCalledWith(
            FeatureFlagKey.VoiceCallbackEnabled2,
        )
    })

    it('should return false when VoiceCallbackEnabled1 is disabled', () => {
        useFlagMock.mockImplementation((key) => {
            if (key === FeatureFlagKey.VoiceCallbackEnabled1) return false
            if (key === FeatureFlagKey.VoiceCallbackEnabled2) return true
            return false
        })

        const { result } = renderHookComponent()
        expect(result.current).toBe(false)
    })

    it('should return false when VoiceCallbackEnabled2 is disabled', () => {
        useFlagMock.mockImplementation((key) => {
            if (key === FeatureFlagKey.VoiceCallbackEnabled1) return true
            if (key === FeatureFlagKey.VoiceCallbackEnabled2) return false
            return false
        })

        const { result } = renderHookComponent()
        expect(result.current).toBe(false)
    })

    it('should return false when both feature flags are disabled', () => {
        useFlagMock.mockImplementation((key) => {
            if (key === FeatureFlagKey.VoiceCallbackEnabled1) return false
            if (key === FeatureFlagKey.VoiceCallbackEnabled2) return false
            return false
        })

        const { result } = renderHookComponent()
        expect(result.current).toBe(false)
    })
})
