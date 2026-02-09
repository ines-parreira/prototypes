import { useLocalStorage } from '@repo/hooks'
import { act, renderHook } from '@testing-library/react'

import { FeatureFlagKey } from '../featureFlagKey'
import { useHelpdeskV2BaselineFlag } from '../shared-flags/useHelpdeskV2BaselineFlag'
import { useFlag } from '../useFlag'

const mockSetIsAxiomMigrationEnabled = vi.fn()
const mockSetIsEnabled = vi.fn()

vi.mock('../useFlag', () => ({
    useFlag: vi.fn(),
}))

vi.mock('@repo/hooks', () => ({
    useLocalStorage: vi.fn(),
}))

function mockLocalStorageValues({
    isAxiomMigrationEnabled = true,
    isEnabled = true,
}: {
    isAxiomMigrationEnabled?: boolean
    isEnabled?: boolean
} = {}) {
    vi.mocked(useLocalStorage)
        .mockReturnValueOnce([
            isAxiomMigrationEnabled,
            mockSetIsAxiomMigrationEnabled,
            vi.fn(),
        ])
        .mockReturnValueOnce([isEnabled, mockSetIsEnabled, vi.fn()])
}

describe('useHelpdeskV2BaselineFlag', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return hasUIVisionBeta true when flag is enabled and both localStorage toggles are true', () => {
        vi.mocked(useFlag).mockReturnValue(true)
        mockLocalStorageValues()

        const { result } = renderHook(() => useHelpdeskV2BaselineFlag())

        expect(result.current.hasUIVisionBetaBaselineFlag).toBe(true)
        expect(result.current.hasUIVisionBeta).toBe(true)
        expect(useFlag).toHaveBeenCalledWith(
            FeatureFlagKey.UIVisionBetaBaseline,
            false,
        )
        expect(useLocalStorage).toHaveBeenCalledWith(
            'axiom-migration-enabled-v3',
            true,
        )
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

    it('should return hasUIVisionBeta false when axiom-migration localStorage toggle is false', () => {
        vi.mocked(useFlag).mockReturnValue(true)
        mockLocalStorageValues({ isAxiomMigrationEnabled: false })

        const { result } = renderHook(() => useHelpdeskV2BaselineFlag())

        expect(result.current.hasUIVisionBetaBaselineFlag).toBe(true)
        expect(result.current.hasUIVisionBeta).toBe(false)
    })

    it('should return hasUIVisionBeta false when both flag and localStorage toggles are false', () => {
        vi.mocked(useFlag).mockReturnValue(false)
        mockLocalStorageValues({
            isAxiomMigrationEnabled: false,
            isEnabled: false,
        })

        const { result } = renderHook(() => useHelpdeskV2BaselineFlag())

        expect(result.current.hasUIVisionBetaBaselineFlag).toBe(false)
        expect(result.current.hasUIVisionBeta).toBe(false)
    })

    it('should disable both toggles when onToggle is called while enabled', () => {
        vi.mocked(useFlag).mockReturnValue(true)
        mockLocalStorageValues({ isEnabled: true })

        const { result } = renderHook(() => useHelpdeskV2BaselineFlag())

        act(() => {
            result.current.onToggle()
        })

        expect(mockSetIsEnabled).toHaveBeenCalledWith(false)
        expect(mockSetIsAxiomMigrationEnabled).toHaveBeenCalledWith(false)
    })

    it('should enable both toggles when onToggle is called while disabled', () => {
        vi.mocked(useFlag).mockReturnValue(true)
        mockLocalStorageValues({ isEnabled: false })

        const { result } = renderHook(() => useHelpdeskV2BaselineFlag())

        act(() => {
            result.current.onToggle()
        })

        expect(mockSetIsEnabled).toHaveBeenCalledWith(true)
        expect(mockSetIsAxiomMigrationEnabled).toHaveBeenCalledWith(true)
    })
})
