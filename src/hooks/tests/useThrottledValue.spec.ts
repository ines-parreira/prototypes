import { act } from '@testing-library/react'

import useThrottledValue from 'hooks/useThrottledValue'
import { renderHook } from 'utils/testing/renderHook'

const mockedFn = jest.fn((value) => value as unknown)
jest.useFakeTimers()

const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout')

describe('useThrottledValue', () => {
    afterEach(() => {
        mockedFn.mockClear()
    })

    const renderUseThrottledValue = <T>(initialProps: T, ms: number) =>
        renderHook((props) => useThrottledValue(mockedFn, [props], ms), {
            initialProps,
        })

    it('should return the value that the given function return', () => {
        const hook = renderUseThrottledValue(10, 100)

        expect(hook.result.current).toBe(10)
        expect(mockedFn).toHaveBeenCalledTimes(1)
    })

    it('should have same value if time is advanced less than the given time', () => {
        const hook = renderUseThrottledValue(10, 100)

        expect(hook.result.current).toBe(10)
        expect(mockedFn).toHaveBeenCalledTimes(1)

        hook.rerender(20)
        jest.advanceTimersByTime(50)

        expect(hook.result.current).toBe(10)
        expect(mockedFn).toHaveBeenCalledTimes(1)
        expect(jest.getTimerCount()).toBe(1)
    })

    it('should update the value after the given time when arguments change', () => {
        const hook = renderUseThrottledValue('boo', 100)

        expect(hook.result.current).toBe('boo')
        expect(mockedFn).toHaveBeenCalledTimes(1)

        hook.rerender('foo')
        act(() => {
            jest.advanceTimersByTime(100)
        })

        expect(hook.result.current).toBe('foo')
        expect(mockedFn).toHaveBeenCalledTimes(2)
    })

    it('should cancel timeout on unmount', () => {
        const hook = renderUseThrottledValue('boo', 100)

        expect(hook.result.current).toBe('boo')
        expect(mockedFn).toHaveBeenCalledTimes(1)

        hook.rerender('foo')
        hook.unmount()

        expect(clearTimeoutSpy).toBeCalledTimes(1)
        jest.advanceTimersByTime(100)
        expect(mockedFn).toHaveBeenCalledTimes(1)
    })
})
