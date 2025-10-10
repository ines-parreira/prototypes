import { renderHook } from '@repo/testing/vitest'
import { act } from '@testing-library/react'

import { useNow } from '../useNow'

describe('useNow', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(1708689346000)
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should return now initially', () => {
        const { result } = renderHook(() => useNow())
        expect(result.current).toBe(1708689346000)
    })

    it('should return a new value every second by default', () => {
        const { result } = renderHook(() => useNow())

        act(() => {
            vi.advanceTimersByTime(999)
        })
        expect(result.current).toBe(1708689346000)

        act(() => {
            vi.advanceTimersByTime(1)
        })
        expect(result.current).toBe(1708689347000)
    })

    it('should return a new value every given interval', () => {
        const { result } = renderHook(() => useNow(5000))

        act(() => {
            vi.advanceTimersByTime(4999)
        })
        expect(result.current).toBe(1708689346000)

        act(() => {
            vi.advanceTimersByTime(1)
        })
        expect(result.current).toBe(1708689351000)
    })
})
