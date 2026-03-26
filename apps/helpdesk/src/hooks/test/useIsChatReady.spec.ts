import { act, renderHook } from '@repo/testing'

import { useIsChatReady } from 'hooks/useIsChatReady'

describe('useIsChatReady', () => {
    afterEach(() => {
        delete window.GorgiasChat
    })

    it('should return true immediately when GorgiasChat is already loaded', () => {
        window.GorgiasChat = {
            on: jest.fn(),
        } as unknown as typeof window.GorgiasChat

        const { result } = renderHook(() => useIsChatReady())

        expect(result.current).toBe(true)
    })

    it('should return false initially when GorgiasChat is not loaded', () => {
        const { result } = renderHook(() => useIsChatReady())

        expect(result.current).toBe(false)
    })

    it('should return true after gorgias-widget-loaded fires and ready callback is invoked', () => {
        let readyCallback: ((data?: unknown) => void) | undefined

        const { result } = renderHook(() => useIsChatReady())

        expect(result.current).toBe(false)

        window.GorgiasChat = {
            on: (event: string, callback: (data?: unknown) => void) => {
                if (event === 'ready') readyCallback = callback
            },
        } as unknown as typeof window.GorgiasChat

        act(() => {
            window.dispatchEvent(new Event('gorgias-widget-loaded'))
        })

        act(() => {
            readyCallback?.()
        })

        expect(result.current).toBe(true)
    })

    it('should remove the gorgias-widget-loaded event listener on unmount', () => {
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

        const { unmount } = renderHook(() => useIsChatReady())
        unmount()

        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            'gorgias-widget-loaded',
            expect.any(Function),
        )

        removeEventListenerSpy.mockRestore()
    })
})
