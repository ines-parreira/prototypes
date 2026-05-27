import { mockFeatureFlagsValues } from '@repo/feature-flags/testing'
import { renderHook } from '@repo/testing'

import { useActionsLabel } from '../useActionsLabel'

describe('useActionsLabel', () => {
    it('returns "Support Actions" when the ActionCentralizedLibrary flag is unset', () => {
        const { result } = renderHook(() => useActionsLabel())

        expect(result.current).toBe('Support Actions')
    })

    it('returns "Support Actions" when the flag is OFF', () => {
        mockFeatureFlagsValues({ 'action-centralized-library': 'OFF' })

        const { result } = renderHook(() => useActionsLabel())

        expect(result.current).toBe('Support Actions')
    })

    it('returns "Support Actions" when the flag is below MILESTONE-2', () => {
        mockFeatureFlagsValues({
            'action-centralized-library': 'MILESTONE-1',
        })

        const { result } = renderHook(() => useActionsLabel())

        expect(result.current).toBe('Support Actions')
    })

    it('returns "Actions" when the flag is MILESTONE-2', () => {
        mockFeatureFlagsValues({
            'action-centralized-library': 'MILESTONE-2',
        })

        const { result } = renderHook(() => useActionsLabel())

        expect(result.current).toBe('Actions')
    })

    it('returns "Actions" when the flag is above MILESTONE-2', () => {
        mockFeatureFlagsValues({
            'action-centralized-library': 'MILESTONE-3',
        })

        const { result } = renderHook(() => useActionsLabel())

        expect(result.current).toBe('Actions')
    })
})
