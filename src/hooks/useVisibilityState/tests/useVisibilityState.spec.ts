import { renderHook } from '@testing-library/react-hooks'

import { useVisibilityState } from '../useVisibilityState'

describe('useVisibilityState', () => {
    const originalVisibilityState = document.visibilityState
    const mockVisibilityChange = new Event('visibilitychange')

    beforeEach(() => {
        Object.defineProperty(document, 'visibilityState', {
            value: 'visible',
            writable: true,
        })
    })

    afterEach(() => {
        Object.defineProperty(document, 'visibilityState', {
            value: originalVisibilityState,
        })
    })

    it('should return true when document is visible', () => {
        const { result } = renderHook(() => useVisibilityState())

        expect(result.current).toBe(true)
    })

    it('should return false when document is hidden', () => {
        Object.defineProperty(document, 'visibilityState', {
            value: 'hidden',
        })

        const { result } = renderHook(() => useVisibilityState())

        expect(result.current).toBe(false)
    })

    it('should update state when visibility changes', () => {
        const { result } = renderHook(() => useVisibilityState())
        expect(result.current).toBe(true)

        Object.defineProperty(document, 'visibilityState', {
            value: 'hidden',
        })
        document.dispatchEvent(mockVisibilityChange)

        expect(result.current).toBe(false)

        Object.defineProperty(document, 'visibilityState', {
            value: 'visible',
        })
        document.dispatchEvent(mockVisibilityChange)

        expect(result.current).toBe(true)
    })

    it('should clean up event listener on unmount', () => {
        const removeEventListenerSpy = jest.spyOn(
            document,
            'removeEventListener',
        )
        const { unmount } = renderHook(() => useVisibilityState())

        unmount()

        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            'visibilitychange',
            expect.any(Function),
        )
        removeEventListenerSpy.mockRestore()
    })
})
