import { useIsMobileResolution } from '@repo/hooks'
import { renderHook } from '@testing-library/react'

import { FeatureFlagKey } from '../featureFlagKey'
import { useHelpdeskV2BaselineFlag } from '../shared-flags/useHelpdeskV2BaselineFlag'
import { useHelpdeskV2MS4Dash6Flag } from '../shared-flags/useHelpdeskV2MS4Dash6Flag'
import { useFlagWithLoading } from '../useFlagWithLoading'

vi.mock('../useFlagWithLoading', () => ({
    useFlagWithLoading: vi.fn(),
}))

vi.mock('../shared-flags/useHelpdeskV2BaselineFlag', () => ({
    useHelpdeskV2BaselineFlag: vi.fn(),
}))

vi.mock('@repo/hooks', () => ({
    useIsMobileResolution: vi.fn(),
}))

function mockMilestoneFlagValue(value: boolean) {
    vi.mocked(useFlagWithLoading).mockImplementation((key: string) => {
        if (key === FeatureFlagKey.UIVisionMilestone4Dash6) {
            return { value, isLoading: false }
        }

        return { value: false, isLoading: false }
    })
}

describe('useHelpdeskV2MS4Dash6Flag', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle: vi.fn(),
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(false)
    })

    it('should return true when both flags are enabled on desktop', () => {
        mockMilestoneFlagValue(true)

        const { result } = renderHook(() => useHelpdeskV2MS4Dash6Flag())

        expect(result.current).toBe(true)
    })

    it('should return false when UIVisionBetaBaseline is disabled', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: false,
            hasUIVisionBeta: false,
            onToggle: vi.fn(),
        })
        mockMilestoneFlagValue(true)

        const { result } = renderHook(() => useHelpdeskV2MS4Dash6Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when UIVisionMilestone4Dash6 is disabled', () => {
        mockMilestoneFlagValue(false)

        const { result } = renderHook(() => useHelpdeskV2MS4Dash6Flag())

        expect(result.current).toBe(false)
    })

    it('should return false on mobile', () => {
        mockMilestoneFlagValue(true)
        vi.mocked(useIsMobileResolution).mockReturnValue(true)

        const { result } = renderHook(() => useHelpdeskV2MS4Dash6Flag())

        expect(result.current).toBe(false)
    })
})
