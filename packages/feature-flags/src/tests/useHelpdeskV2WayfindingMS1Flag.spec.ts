import { renderHook } from '@testing-library/react'

import { useHelpdeskV2BaselineFlag } from '../shared-flags/useHelpdeskV2BaselineFlag'
import { useHelpdeskV2WayfindingMS1Flag } from '../shared-flags/useHelpdeskV2WayfindingMS1Flag'

vi.mock('../shared-flags/useHelpdeskV2BaselineFlag', () => ({
    useHelpdeskV2BaselineFlag: vi.fn(),
}))

describe('useHelpdeskV2WayfindingMS1Flag', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return true when UIVisionBeta is enabled', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle: vi.fn(),
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

        const { result } = renderHook(() => useHelpdeskV2WayfindingMS1Flag())

        expect(result.current).toBe(false)
    })
})
