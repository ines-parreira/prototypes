import type { IncrementalBackoffOptions } from '../incrementalBackoff'
import IncrementalBackoff from '../incrementalBackoff'

jest.useFakeTimers()

describe('IncrementalBackoff', () => {
    const defaultOptions: IncrementalBackoffOptions = {
        initialDelay: 4000,
        maxDelay: 10000,
    }

    describe('scheduleCall', () => {
        it('should call the scheduled function with the attempt number after the delay', () => {
            const fn = jest.fn()
            const backoff = new IncrementalBackoff(defaultOptions)

            backoff.scheduleCall(fn)
            jest.advanceTimersByTime(defaultOptions.initialDelay)

            expect(fn).toHaveBeenLastCalledWith(1)
        })

        it('should schedule the function only once', () => {
            const fn = jest.fn()
            const backoff = new IncrementalBackoff(defaultOptions)

            backoff.scheduleCall(fn)
            backoff.scheduleCall(fn)
            jest.advanceTimersByTime(defaultOptions.initialDelay)

            expect(fn).toHaveBeenCalledTimes(1)
        })

        it('should increase the delay exponentially on scheduled calls until it reaches max delay', () => {
            const fn = jest.fn()
            const backoff = new IncrementalBackoff(defaultOptions)

            for (
                let delay = defaultOptions.initialDelay;
                delay <= defaultOptions.maxDelay;
                delay *= 2
            ) {
                fn.mockClear()
                backoff.scheduleCall(fn)

                jest.advanceTimersByTime(delay - 10)
                expect(fn).not.toHaveBeenCalled()

                jest.advanceTimersByTime(10)
                expect(fn).toHaveBeenCalledTimes(1)
            }

            fn.mockClear()
            backoff.scheduleCall(fn)
            jest.advanceTimersByTime(defaultOptions.maxDelay)

            expect(fn).toHaveBeenCalledTimes(1)
        })
    })

    describe('reset', () => {
        it('should clear scheduled function', () => {
            const fn = jest.fn()
            const backoff = new IncrementalBackoff(defaultOptions)

            backoff.scheduleCall(fn)
            backoff.reset()
            jest.advanceTimersByTime(defaultOptions.initialDelay)

            expect(fn).not.toBeCalled()
        })

        it('should clear the backoff time', () => {
            const fn = jest.fn()
            const backoff = new IncrementalBackoff(defaultOptions)

            backoff.scheduleCall(fn)
            jest.advanceTimersByTime(defaultOptions.initialDelay)
            backoff.reset()
            backoff.scheduleCall(fn)
            jest.advanceTimersByTime(defaultOptions.initialDelay)

            expect(fn).toBeCalledTimes(2)
        })
    })
})
