import { renderHook } from '@repo/testing/vitest'
import { act } from '@testing-library/react'

import { useDebouncedValue } from '../useDebouncedValue'

describe('useDebouncedValue', () => {
    it('should return the initial value on mount', () => {
        const { result } = renderHook(
            (props: [string, number]) => useDebouncedValue(...props),
            {
                initialProps: ['beep-boop', 250],
            },
        )

        expect(result.current).toBe('beep-boop')
    })

    it('should return the new value after the debounce period has passed', () => {
        vi.useFakeTimers()

        const { rerender, result } = renderHook(
            (props: [string, number]) => useDebouncedValue(...props),
            {
                initialProps: ['beep-boop', 250],
            },
        )

        rerender(['boop-beep', 250])
        expect(result.current).toBe('beep-boop')

        act(() => {
            vi.advanceTimersByTime(250)
        })
        expect(result.current).toBe('boop-beep')

        vi.useRealTimers()
    })

    it('should cancel previous updates if a new value is provided', () => {
        vi.useFakeTimers()

        const { rerender, result } = renderHook(
            (props: [string, number]) => useDebouncedValue(...props),
            {
                initialProps: ['beep-boop', 250],
            },
        )

        rerender(['boop-beep', 250])
        expect(result.current).toBe('beep-boop')

        vi.advanceTimersByTime(150)
        expect(result.current).toBe('beep-boop')

        rerender(['bippity-bop', 250])
        expect(result.current).toBe('beep-boop')

        vi.advanceTimersByTime(100)
        expect(result.current).toBe('beep-boop')

        act(() => {
            vi.advanceTimersByTime(150)
        })
        expect(result.current).toBe('bippity-bop')

        vi.useRealTimers()
    })
})
