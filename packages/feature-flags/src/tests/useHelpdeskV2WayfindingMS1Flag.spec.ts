import { renderHook } from '@testing-library/react'

import { FeatureFlagKey } from '../featureFlagKey'
import { useHelpdeskV2BaselineFlag } from '../shared-flags/useHelpdeskV2BaselineFlag'
import { useHelpdeskV2WayfindingMS1Flag } from '../shared-flags/useHelpdeskV2WayfindingMS1Flag'
import { useFlag } from '../useFlag'

vi.mock('../useFlag', () => ({
    useFlag: vi.fn(),
}))

vi.mock('../shared-flags/useHelpdeskV2BaselineFlag', () => ({
    useHelpdeskV2BaselineFlag: vi.fn(),
}))

describe('useHelpdeskV2WayfindingMS1Flag', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return true when both flags are enabled', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle: vi.fn(),
        })
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionWayfindingMS1) return true
            return false
        })

        const { result } = renderHook(() => useHelpdeskV2WayfindingMS1Flag())

        expect(result.current).toBe(true)
    })

    it('should return false when UIVisionBetaBaseline is disabled', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: false,
            hasUIVisionBeta: false,
            onToggle: vi.fn(),
        })
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionWayfindingMS1) return true
            return false
        })

        const { result } = renderHook(() => useHelpdeskV2WayfindingMS1Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when UIVisionWayfindingMS1 is disabled', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle: vi.fn(),
        })
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionWayfindingMS1) return false
            return false
        })

        const { result } = renderHook(() => useHelpdeskV2WayfindingMS1Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when both flags are disabled', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: false,
            hasUIVisionBeta: false,
            onToggle: vi.fn(),
        })
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionWayfindingMS1) return false
            return false
        })

        const { result } = renderHook(() => useHelpdeskV2WayfindingMS1Flag())

        expect(result.current).toBe(false)
    })
})
