import {
    FeatureFlagKey,
    useFlag,
    useHelpdeskV2BaselineFlag,
} from '@repo/feature-flags'
import { useIsMobileResolution } from '@repo/hooks'

import { renderHook } from '../../tests/render.utils'
import { useHelpdeskV2MS4Flag } from '../useHelpdeskV2MS4Flag'

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        UIVisionMilestone4: 'UIVisionMilestone4',
    },
    useFlag: vi.fn(),
    useHelpdeskV2BaselineFlag: vi.fn(),
}))

vi.mock('@repo/hooks', () => ({
    useIsMobileResolution: vi.fn(),
}))

describe('useHelpdeskV2MS4Flag', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return true when all conditions are met', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle: vi.fn(),
        })
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionMilestone4) return true
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(false)

        const { result } = renderHook(() => useHelpdeskV2MS4Flag())

        expect(result.current).toBe(true)
    })

    it('should return false when UIVisionBetaBaseline is disabled', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: false,
            hasUIVisionBeta: false,
            onToggle: vi.fn(),
        })
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionMilestone4) return true
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(false)

        const { result } = renderHook(() => useHelpdeskV2MS4Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when UIVisionMilestone4 is disabled', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle: vi.fn(),
        })
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionMilestone4) return false
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(false)

        const { result } = renderHook(() => useHelpdeskV2MS4Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when on mobile resolution', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle: vi.fn(),
        })
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionMilestone4) return true
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(true)

        const { result } = renderHook(() => useHelpdeskV2MS4Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when all conditions are not met', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: false,
            hasUIVisionBeta: false,
            onToggle: vi.fn(),
        })
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionMilestone4) return false
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(true)

        const { result } = renderHook(() => useHelpdeskV2MS4Flag())

        expect(result.current).toBe(false)
    })
})
