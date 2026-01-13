import { renderHook } from '@testing-library/react'

import { FeatureFlagKey } from '../featureFlagKey'
import { useFlag } from '../useFlag'
import { useHelpdeskV2MS2Flag } from '../useHelpdeskV2MS2Flag'

vi.mock('../useFlag', () => ({
    useFlag: vi.fn(),
}))

describe('useHelpdeskV2MS2Flag', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return true when both flags are enabled', () => {
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionBetaBaseline) return true
            if (key === FeatureFlagKey.UIVisionMilestone2) return true
            return false
        })

        const { result } = renderHook(() => useHelpdeskV2MS2Flag())

        expect(result.current).toBe(true)
    })

    it('should return false when UIVisionBetaBaseline is disabled', () => {
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionBetaBaseline) return false
            if (key === FeatureFlagKey.UIVisionMilestone2) return true
            return false
        })

        const { result } = renderHook(() => useHelpdeskV2MS2Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when UIVisionMilestone2 is disabled', () => {
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionBetaBaseline) return true
            if (key === FeatureFlagKey.UIVisionMilestone2) return false
            return false
        })

        const { result } = renderHook(() => useHelpdeskV2MS2Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when both flags are disabled', () => {
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionBetaBaseline) return false
            if (key === FeatureFlagKey.UIVisionMilestone2) return false
            return false
        })

        const { result } = renderHook(() => useHelpdeskV2MS2Flag())

        expect(result.current).toBe(false)
    })
})
