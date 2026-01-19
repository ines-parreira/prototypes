import { renderHook } from '@testing-library/react'

import { FeatureFlagKey } from '../featureFlagKey'
import { useHelpdeskV2WayfindingMS1Flag } from '../shared-flags/useHelpdeskV2WayfindingMS1Flag'
import { useFlag } from '../useFlag'

vi.mock('../useFlag', () => ({
    useFlag: vi.fn(),
}))

describe('useHelpdeskV2WayfindingMS1Flag', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return true when both flags are enabled', () => {
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionBetaBaseline) return true
            if (key === FeatureFlagKey.UIVisionWayfindingMS1) return true
            return false
        })

        const { result } = renderHook(() => useHelpdeskV2WayfindingMS1Flag())

        expect(result.current).toBe(true)
    })

    it('should return false when UIVisionBetaBaseline is disabled', () => {
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionBetaBaseline) return false
            if (key === FeatureFlagKey.UIVisionWayfindingMS1) return true
            return false
        })

        const { result } = renderHook(() => useHelpdeskV2WayfindingMS1Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when UIVisionWayfindingMS1 is disabled', () => {
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionBetaBaseline) return true
            if (key === FeatureFlagKey.UIVisionWayfindingMS1) return false
            return false
        })

        const { result } = renderHook(() => useHelpdeskV2WayfindingMS1Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when both flags are disabled', () => {
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionBetaBaseline) return false
            if (key === FeatureFlagKey.UIVisionWayfindingMS1) return false
            return false
        })

        const { result } = renderHook(() => useHelpdeskV2WayfindingMS1Flag())

        expect(result.current).toBe(false)
    })
})
