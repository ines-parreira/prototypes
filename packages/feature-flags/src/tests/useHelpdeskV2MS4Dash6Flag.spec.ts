import { renderHook } from '@testing-library/react'
import { useIsMobileResolution } from '@gorgias/toolkit-react'

import { useHelpdeskV2BaselineFlag } from '../shared-flags/useHelpdeskV2BaselineFlag'
import { useHelpdeskV2MS4Dash6Flag } from '../shared-flags/useHelpdeskV2MS4Dash6Flag'

vi.mock('../shared-flags/useHelpdeskV2BaselineFlag', () => ({
    useHelpdeskV2BaselineFlag: vi.fn(),
}))

vi.mock('@gorgias/toolkit-react', () => ({
    useIsMobileResolution: vi.fn(),
}))

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

    it('should return true when UIVisionBeta is enabled on desktop', () => {
        const { result } = renderHook(() => useHelpdeskV2MS4Dash6Flag())

        expect(result.current).toBe(true)
    })

    it('should return false when UIVisionBetaBaseline is disabled', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: false,
            hasUIVisionBeta: false,
            onToggle: vi.fn(),
        })

        const { result } = renderHook(() => useHelpdeskV2MS4Dash6Flag())

        expect(result.current).toBe(false)
    })

    it('should return false on mobile', () => {
        vi.mocked(useIsMobileResolution).mockReturnValue(true)

        const { result } = renderHook(() => useHelpdeskV2MS4Dash6Flag())

        expect(result.current).toBe(false)
    })
})
