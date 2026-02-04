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

describe('useHelpdeskV2BaselineFlag', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSetIsEnabled.mockClear()
    })

    it('should return hasUIVisionBeta true when flag is enabled and localStorage toggle is true', () => {
        vi.mocked(useFlag).mockReturnValue(true)
        vi.mocked(useLocalStorage).mockReturnValue([
            true,
            mockSetIsEnabled,
            vi.fn(),
        ])

        const { result } = renderHook(() => useHelpdeskV2BaselineFlag())

        expect(result.current.hasUIVisionBetaBaselineFlag).toBe(true)
        expect(result.current.hasUIVisionBeta).toBe(true)
        expect(useFlag).toHaveBeenCalledWith(
            FeatureFlagKey.UIVisionBetaBaseline,
            false,
        )
        expect(useLocalStorage).toHaveBeenCalledWith('helpdesk-v2-beta', true)
    })

    it('should return hasUIVisionBeta false when flag is disabled', () => {
        vi.mocked(useFlag).mockReturnValue(false)
        vi.mocked(useLocalStorage).mockReturnValue([
            true,
            mockSetIsEnabled,
            vi.fn(),
        ])

        const { result } = renderHook(() => useHelpdeskV2BaselineFlag())

        expect(result.current.hasUIVisionBetaBaselineFlag).toBe(false)
        expect(result.current.hasUIVisionBeta).toBe(false)
    })

    it('should return hasUIVisionBeta false when localStorage toggle is false', () => {
        vi.mocked(useFlag).mockReturnValue(true)
        vi.mocked(useLocalStorage).mockReturnValue([
            false,
            mockSetIsEnabled,
            vi.fn(),
        ])

        const { result } = renderHook(() => useHelpdeskV2BaselineFlag())

        expect(result.current.hasUIVisionBetaBaselineFlag).toBe(true)
        expect(result.current.hasUIVisionBeta).toBe(false)
    })

    it('should return hasUIVisionBeta false when both flag and localStorage toggle are false', () => {
        vi.mocked(useFlag).mockReturnValue(false)
        vi.mocked(useLocalStorage).mockReturnValue([
            false,
            mockSetIsEnabled,
            vi.fn(),
        ])

        const { result } = renderHook(() => useHelpdeskV2BaselineFlag())

        expect(result.current.hasUIVisionBetaBaselineFlag).toBe(false)
        expect(result.current.hasUIVisionBeta).toBe(false)
    })

    it('should toggle localStorage value when onToggle is called', () => {
        vi.mocked(useFlag).mockReturnValue(true)
        vi.mocked(useLocalStorage).mockReturnValue([
            true,
            mockSetIsEnabled,
            vi.fn(),
        ])

        const { result } = renderHook(() => useHelpdeskV2BaselineFlag())

        act(() => {
            result.current.onToggle()
        })

        expect(mockSetIsEnabled).toHaveBeenCalledTimes(1)
        expect(mockSetIsEnabled).toHaveBeenCalledWith(expect.any(Function))

        const toggleFn = mockSetIsEnabled.mock.calls[0][0]
        expect(toggleFn(true)).toBe(false)
        expect(toggleFn(false)).toBe(true)
    })
})
