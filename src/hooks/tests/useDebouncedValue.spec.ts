import { act, renderHook } from '@testing-library/react-hooks'

import useDebouncedValue from '../useDebouncedValue'

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
        jest.useFakeTimers()

        const { rerender, result } = renderHook(
            (props: [string, number]) => useDebouncedValue(...props),
            {
                initialProps: ['beep-boop', 250],
            },
        )

        rerender(['boop-beep', 250])
        expect(result.current).toBe('beep-boop')

        act(() => {
            jest.advanceTimersByTime(250)
        })
        expect(result.current).toBe('boop-beep')

        jest.useRealTimers()
    })

    it('should cancel previous updates if a new value is provided', () => {
        jest.useFakeTimers()

        const { rerender, result } = renderHook(
            (props: [string, number]) => useDebouncedValue(...props),
            {
                initialProps: ['beep-boop', 250],
            },
        )

        rerender(['boop-beep', 250])
        expect(result.current).toBe('beep-boop')

        jest.advanceTimersByTime(150)
        expect(result.current).toBe('beep-boop')

        rerender(['bippity-bop', 250])
        expect(result.current).toBe('beep-boop')

        jest.advanceTimersByTime(100)
        expect(result.current).toBe('beep-boop')

        act(() => {
            jest.advanceTimersByTime(150)
        })
        expect(result.current).toBe('bippity-bop')

        jest.useRealTimers()
    })
})
