import { renderHook } from '@repo/testing/vitest'

import { useUnmount } from '../useUnmount'

describe('useUnmount', () => {
    it('should not call provided callback on mount', () => {
        const callback = vi.fn()
        renderHook(() => useUnmount(callback))

        expect(callback).not.toHaveBeenCalled()
    })

    it('should not call provided callback on re-renders', () => {
        const callback = vi.fn()
        const hook = renderHook(() => useUnmount(callback))

        hook.rerender()
        hook.rerender()
        hook.rerender()
        hook.rerender()

        expect(callback).not.toHaveBeenCalled()
    })

    it('should call provided callback on unmount', () => {
        const callback = vi.fn()
        const hook = renderHook(() => useUnmount(callback))

        hook.unmount()

        expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should call the last provided callback if is has been changed', () => {
        const firstCallback = vi.fn()
        const updatedCallback = vi.fn()
        const lastCallback = vi.fn()

        const hook = renderHook((callback) => useUnmount(callback), {
            initialProps: firstCallback,
        })

        hook.rerender(updatedCallback)
        hook.rerender(lastCallback)
        hook.unmount()

        expect(firstCallback).not.toHaveBeenCalled()
        expect(updatedCallback).not.toHaveBeenCalled()
        expect(lastCallback).toHaveBeenCalledTimes(1)
    })
})
