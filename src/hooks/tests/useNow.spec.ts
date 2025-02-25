import { act, renderHook } from '@testing-library/react-hooks'

import { useNow } from '../useNow'

describe('useNow', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        jest.setSystemTime(1708689346000)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should return now initially', () => {
        const { result } = renderHook(() => useNow())
        expect(result.current).toBe(1708689346000)
    })

    it('should return a new value every second by default', () => {
        const { result } = renderHook(() => useNow())

        act(() => {
            jest.advanceTimersByTime(999)
        })
        expect(result.current).toBe(1708689346000)

        act(() => {
            jest.advanceTimersByTime(1)
        })
        expect(result.current).toBe(1708689347000)
    })

    it('should return a new value every given interval', () => {
        const { result } = renderHook(() => useNow(5000))

        act(() => {
            jest.advanceTimersByTime(4999)
        })
        expect(result.current).toBe(1708689346000)

        act(() => {
            jest.advanceTimersByTime(1)
        })
        expect(result.current).toBe(1708689351000)
    })
})
