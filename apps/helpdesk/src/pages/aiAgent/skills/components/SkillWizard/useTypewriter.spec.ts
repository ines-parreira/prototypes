import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useTypewriter } from './useTypewriter'

const enableBrowserAnimationEnv = () => {
    window.matchMedia = jest.fn().mockReturnValue({
        matches: false,
        media: '',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    }) as unknown as typeof window.matchMedia
}

const restoreJsdomEnv = () => {
    delete (window as { matchMedia?: unknown }).matchMedia
}

describe('useTypewriter', () => {
    describe('in a jsdom-detected environment (no matchMedia)', () => {
        it('returns the full text immediately when enabled', () => {
            const { result } = renderHook(() => useTypewriter('Hello'))

            expect(result.current.typed).toBe('Hello')
            expect(result.current.isComplete).toBe(true)
        })

        it('returns empty text and isComplete=false when disabled', () => {
            const { result } = renderHook(() =>
                useTypewriter('Hello', { enabled: false }),
            )

            expect(result.current.typed).toBe('')
            expect(result.current.isComplete).toBe(false)
        })

        it('returns empty text and isComplete=true when text is empty', () => {
            const { result } = renderHook(() => useTypewriter(''))

            expect(result.current.typed).toBe('')
            expect(result.current.isComplete).toBe(true)
        })
    })

    describe('with animation enabled (browser-like env)', () => {
        beforeEach(() => {
            jest.useFakeTimers()
            enableBrowserAnimationEnv()
        })

        afterEach(() => {
            jest.runOnlyPendingTimers()
            jest.useRealTimers()
            restoreJsdomEnv()
        })

        it('starts empty and types one character per tick', () => {
            const { result } = renderHook(() =>
                useTypewriter('Hi', { delayMs: 10 }),
            )

            expect(result.current.typed).toBe('')
            expect(result.current.isComplete).toBe(false)

            // The first tick is scheduled at t=0 (startAfterMs default); fire it
            // without advancing past delayMs so we observe just one character.
            act(() => {
                jest.advanceTimersByTime(1)
            })
            expect(result.current.typed).toBe('H')
            expect(result.current.isComplete).toBe(false)

            act(() => {
                jest.advanceTimersByTime(10)
            })
            expect(result.current.typed).toBe('Hi')
            expect(result.current.isComplete).toBe(true)
        })

        it('respects startAfterMs before typing begins', () => {
            const { result } = renderHook(() =>
                useTypewriter('AB', { delayMs: 10, startAfterMs: 50 }),
            )

            act(() => {
                jest.advanceTimersByTime(40)
            })
            expect(result.current.typed).toBe('')

            act(() => {
                jest.advanceTimersByTime(10)
            })
            expect(result.current.typed).toBe('A')

            act(() => {
                jest.advanceTimersByTime(10)
            })
            expect(result.current.typed).toBe('AB')
            expect(result.current.isComplete).toBe(true)
        })

        it('restarts when the text prop changes', () => {
            const { result, rerender } = renderHook(
                ({ text }: { text: string }) =>
                    useTypewriter(text, { delayMs: 10 }),
                { initialProps: { text: 'Hi' } },
            )

            act(() => {
                jest.advanceTimersByTime(20)
            })
            expect(result.current.typed).toBe('Hi')
            expect(result.current.isComplete).toBe(true)

            rerender({ text: 'Bye' })
            expect(result.current.typed).toBe('')
            expect(result.current.isComplete).toBe(false)

            act(() => {
                jest.advanceTimersByTime(30)
            })
            expect(result.current.typed).toBe('Bye')
            expect(result.current.isComplete).toBe(true)
        })

        it('stays empty while disabled and starts typing when enabled flips true', () => {
            const { result, rerender } = renderHook(
                ({ enabled }: { enabled: boolean }) =>
                    useTypewriter('Hi', { delayMs: 10, enabled }),
                { initialProps: { enabled: false } },
            )

            act(() => {
                jest.advanceTimersByTime(100)
            })
            expect(result.current.typed).toBe('')
            expect(result.current.isComplete).toBe(false)

            rerender({ enabled: true })
            expect(result.current.typed).toBe('')

            act(() => {
                jest.advanceTimersByTime(20)
            })
            expect(result.current.typed).toBe('Hi')
            expect(result.current.isComplete).toBe(true)
        })

        it('does not keep ticking after unmount', () => {
            const { result, unmount } = renderHook(() =>
                useTypewriter('Hello', { delayMs: 10 }),
            )

            act(() => {
                jest.advanceTimersByTime(1)
            })
            expect(result.current.typed).toBe('H')

            unmount()

            expect(() => {
                jest.advanceTimersByTime(100)
            }).not.toThrow()
        })
    })
})
