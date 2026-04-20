import { useLocalStorage } from '@repo/hooks'
import { act, renderHook } from '@testing-library/react'

import { FeatureFlagKey } from '../featureFlagKey'
import { useHelpdeskV2BaselineFlag } from '../shared-flags/useHelpdeskV2BaselineFlag'
import { useFlag } from '../useFlag'

const mockSetIsEnabled = vi.fn()

vi.mock('../useFlag', () => ({
    useFlag: vi.fn(),
}))

vi.mock('@repo/hooks', () => ({
    useLocalStorage: vi.fn(),
}))

function mockLocalStorageValues({
    isEnabled = true,
}: {
    isEnabled?: boolean
} = {}) {
    vi.mocked(useLocalStorage).mockReturnValueOnce([
        isEnabled,
        mockSetIsEnabled,
        vi.fn(),
    ])
}

describe('useHelpdeskV2BaselineFlag', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return hasUIVisionBeta true when the baseline flag and localStorage toggle are enabled', () => {
        vi.mocked(useFlag).mockReturnValue(true)
        mockLocalStorageValues()

        const { result } = renderHook(() => useHelpdeskV2BaselineFlag())

        expect(result.current.hasUIVisionBetaBaselineFlag).toBe(true)
        expect(result.current.hasUIVisionBeta).toBe(true)
        expect(useFlag).toHaveBeenCalledWith(
            FeatureFlagKey.UIVisionBetaBaseline,
            false,
        )
        expect(useLocalStorage).toHaveBeenCalledTimes(1)
        expect(useLocalStorage).toHaveBeenCalledWith('helpdesk-v2-beta', true)
    })

    it('should return hasUIVisionBeta false when flag is disabled', () => {
        vi.mocked(useFlag).mockReturnValue(false)
        mockLocalStorageValues()

        const { result } = renderHook(() => useHelpdeskV2BaselineFlag())

        expect(result.current.hasUIVisionBetaBaselineFlag).toBe(false)
        expect(result.current.hasUIVisionBeta).toBe(false)
    })

    it('should return hasUIVisionBeta false when helpdesk-v2-beta localStorage toggle is false', () => {
        vi.mocked(useFlag).mockReturnValue(true)
        mockLocalStorageValues({ isEnabled: false })

        const { result } = renderHook(() => useHelpdeskV2BaselineFlag())

        expect(result.current.hasUIVisionBetaBaselineFlag).toBe(true)
        expect(result.current.hasUIVisionBeta).toBe(false)
    })

    it('should return hasUIVisionBeta false when both the baseline flag and localStorage toggle are false', () => {
        vi.mocked(useFlag).mockReturnValue(false)
        mockLocalStorageValues({ isEnabled: false })

        const { result } = renderHook(() => useHelpdeskV2BaselineFlag())

        expect(result.current.hasUIVisionBetaBaselineFlag).toBe(false)
        expect(result.current.hasUIVisionBeta).toBe(false)
    })

    it('should disable only the Helpdesk V2 toggle when onToggle is called while enabled', () => {
        vi.mocked(useFlag).mockReturnValue(true)
        mockLocalStorageValues({ isEnabled: true })

        const { result } = renderHook(() => useHelpdeskV2BaselineFlag())

        act(() => {
            result.current.onToggle()
        })

        expect(mockSetIsEnabled).toHaveBeenCalledWith(false)
    })

    it('should enable only the Helpdesk V2 toggle when onToggle is called while disabled', () => {
        vi.mocked(useFlag).mockReturnValue(true)
        mockLocalStorageValues({ isEnabled: false })

        const { result } = renderHook(() => useHelpdeskV2BaselineFlag())

        act(() => {
            result.current.onToggle()
        })

        expect(mockSetIsEnabled).toHaveBeenCalledWith(true)
    })
})
