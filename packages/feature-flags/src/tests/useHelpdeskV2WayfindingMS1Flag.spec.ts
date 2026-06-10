import { renderHook } from '@testing-library/react'
import { useIsMobileResolution } from '@gorgias/toolkit-react'

import { useHelpdeskV2BaselineFlag } from '../shared-flags/useHelpdeskV2BaselineFlag'
import { useHelpdeskV2WayfindingMS1Flag } from '../shared-flags/useHelpdeskV2WayfindingMS1Flag'
import { useFlagWithLoading } from '../useFlagWithLoading'

vi.mock('../shared-flags/useHelpdeskV2BaselineFlag', () => ({
    useHelpdeskV2BaselineFlag: vi.fn(),
}))

vi.mock('@gorgias/toolkit-react', () => ({
    useIsMobileResolution: vi.fn(),
}))

vi.mock('../useFlagWithLoading', () => ({
    useFlagWithLoading: vi.fn(),
}))

describe('useHelpdeskV2WayfindingMS1Flag', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle: vi.fn(),
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(false)
        vi.mocked(useFlagWithLoading).mockReturnValue({
            value: false,
            isLoading: false,
        })
    })

    it('should return true when UIVisionBeta is enabled on desktop', () => {
        const { result } = renderHook(() => useHelpdeskV2WayfindingMS1Flag())

        expect(result.current).toBe(true)
    })

    it('should return false when UIVisionBetaBaseline is disabled', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: false,
            hasUIVisionBeta: false,
            onToggle: vi.fn(),
        })

        const { result } = renderHook(() => useHelpdeskV2WayfindingMS1Flag())

        expect(result.current).toBe(false)
    })

    it('should return false on mobile when WayfindingMobileResolution FF is disabled', () => {
        vi.mocked(useIsMobileResolution).mockReturnValue(true)

        const { result } = renderHook(() => useHelpdeskV2WayfindingMS1Flag())

        expect(result.current).toBe(false)
    })

    it('should return true on mobile when WayfindingMobileResolution FF is enabled', () => {
        vi.mocked(useIsMobileResolution).mockReturnValue(true)
        vi.mocked(useFlagWithLoading).mockReturnValue({
            value: true,
            isLoading: false,
        })

        const { result } = renderHook(() => useHelpdeskV2WayfindingMS1Flag())

        expect(result.current).toBe(true)
    })
})
