import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useErrorThreshold } from '../useErrorThreshold'

const MOCK_THRESHOLD = 10
const mockOnThresholdReached = jest.fn()

describe('useErrorThreshold', () => {
    beforeEach(() => {
        mockOnThresholdReached.mockClear()
    })

    it('should return a function to increment error count', () => {
        const { result } = renderHook(() =>
            useErrorThreshold(MOCK_THRESHOLD, mockOnThresholdReached),
        )

        expect(result.current.incrementErrorCount).toBeInstanceOf(Function)
    })

    it('should handle error threshold behavior correctly', () => {
        const { result } = renderHook(() =>
            useErrorThreshold(MOCK_THRESHOLD, mockOnThresholdReached),
        )

        // test before threshold
        for (let i = 0; i < MOCK_THRESHOLD - 1; i++) {
            act(() => {
                result.current.incrementErrorCount()
            })
        }

        expect(mockOnThresholdReached).not.toHaveBeenCalled()

        // test at threshold
        act(() => {
            result.current.incrementErrorCount()
        })

        expect(mockOnThresholdReached).toHaveBeenCalledTimes(1)

        // test beyond threshold
        act(() => {
            result.current.incrementErrorCount()
            result.current.incrementErrorCount()
            result.current.incrementErrorCount()
        })

        expect(mockOnThresholdReached).toHaveBeenCalledTimes(1)
    })

    it('should reset error count when resetErrorCount is called', () => {
        const { result } = renderHook(() =>
            useErrorThreshold(MOCK_THRESHOLD, mockOnThresholdReached),
        )

        // test before threshold
        for (let i = 0; i < MOCK_THRESHOLD - 1; i++) {
            act(() => {
                result.current.incrementErrorCount()
            })
        }
        act(() => {
            result.current.resetErrorCount()
            result.current.incrementErrorCount()
        })

        expect(mockOnThresholdReached).not.toHaveBeenCalled()
    })
})
