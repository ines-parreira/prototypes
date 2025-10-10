import { renderHook } from '@repo/testing/vitest'

import { useEffectOnce } from '../useEffectOnce'

describe('useEffectOnce', () => {
    it('should run provided effect only once', () => {
        const mockEffectCleanup = vi.fn()
        const mockEffectCallback = vi.fn().mockReturnValue(mockEffectCleanup)

        const { rerender } = renderHook(() => useEffectOnce(mockEffectCallback))
        expect(mockEffectCallback).toHaveBeenCalledTimes(1)

        rerender()
        expect(mockEffectCallback).toHaveBeenCalledTimes(1)
    })

    it('should run clean-up provided on unmount', () => {
        const mockEffectCleanup = vi.fn()
        const mockEffectCallback = vi.fn().mockReturnValue(mockEffectCleanup)

        const { unmount } = renderHook(() => useEffectOnce(mockEffectCallback))
        expect(mockEffectCleanup).not.toHaveBeenCalled()

        unmount()
        expect(mockEffectCleanup).toHaveBeenCalledTimes(1)
    })
})
