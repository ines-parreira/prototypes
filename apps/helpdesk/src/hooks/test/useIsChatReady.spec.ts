import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useIsChatReady } from 'hooks/useIsChatReady'

describe('useIsChatReady', () => {
    afterEach(() => {
        delete window.GorgiasChat
    })

    it('should return false initially when GorgiasChat is not loaded', () => {
        const { result } = renderHook(() => useIsChatReady())

        expect(result.current).toBe(false)
    })

    it('should return true when GorgiasChat is already loaded and isOpen returns a boolean', () => {
        window.GorgiasChat = {
            on: jest.fn(),
            isOpen: jest.fn().mockReturnValue(false),
        } as unknown as typeof window.GorgiasChat

        const { result } = renderHook(() => useIsChatReady())

        expect(result.current).toBe(true)
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

    describe('retry polling', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.runOnlyPendingTimers()
            jest.useRealTimers()
        })

        it('should poll until GorgiasChat becomes available', () => {
            const { result } = renderHook(() => useIsChatReady())
            expect(result.current).toBe(false)

            // first retry fires at 500ms — still no GorgiasChat
            act(() => {
                jest.advanceTimersByTime(500)
            })
            expect(result.current).toBe(false)

            window.GorgiasChat = {
                on: jest.fn(),
                isOpen: jest.fn().mockReturnValue(false),
            } as unknown as typeof window.GorgiasChat

            // second retry fires at 1000ms more (increasing delay)
            act(() => {
                jest.advanceTimersByTime(1000)
            })

            expect(result.current).toBe(true)
        })

        it('should give up after MAX_ATTEMPTS when GorgiasChat never loads', () => {
            const { result } = renderHook(() => useIsChatReady())

            // total time across all 5 attempts: 500+1000+1500+2000+2500 = 7500ms
            act(() => {
                jest.advanceTimersByTime(8000)
            })

            expect(result.current).toBe(false)
        })

        it('should retry when GorgiasChat.on() throws before the API is initialized', () => {
            let onCallCount = 0
            window.GorgiasChat = {
                on: jest.fn().mockImplementation(() => {
                    onCallCount++
                    if (onCallCount < 2)
                        throw new Error(
                            'You are trying to use the Gorgias Chat API before its initialization',
                        )
                }),
                isOpen: jest.fn().mockReturnValue(false),
            } as unknown as typeof window.GorgiasChat

            const { result } = renderHook(() => useIsChatReady())
            expect(result.current).toBe(false)

            act(() => {
                jest.advanceTimersByTime(500)
            })

            expect(result.current).toBe(true)
        })

        it('should give up after MAX_ATTEMPTS when GorgiasChat.on() always throws', () => {
            window.GorgiasChat = {
                on: jest.fn().mockImplementation(() => {
                    throw new Error(
                        'You are trying to use the Gorgias Chat API before its initialization',
                    )
                }),
                isOpen: jest.fn(),
            } as unknown as typeof window.GorgiasChat

            const { result } = renderHook(() => useIsChatReady())
            expect(result.current).toBe(false)

            // total time across all 5 retries: 500+1000+1500+2000+2500 = 7500ms
            act(() => {
                jest.advanceTimersByTime(8000)
            })

            expect(result.current).toBe(false)
        })
    })
})
