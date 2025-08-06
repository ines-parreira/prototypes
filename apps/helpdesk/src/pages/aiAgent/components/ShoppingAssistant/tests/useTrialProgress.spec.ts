import { renderHook } from '@testing-library/react'

import { useTrialProgress } from '../hooks/useTrialProgress'

describe('useTrialProgress', () => {
    it('calculates progress percentage and text correctly when days remain', () => {
        const { result } = renderHook(() => useTrialProgress(10))

        expect(result.current.progressPercentage).toBe(71) // 10/14 * 100 = ~71.43, rounded to 71
        expect(result.current.progressText).toBe('10 days left')
    })

    it('handles singular day case correctly', () => {
        const { result } = renderHook(() => useTrialProgress(1))

        expect(result.current.progressPercentage).toBe(7) // 1/14 * 100 = ~7.14, rounded to 7
        expect(result.current.progressText).toBe('1 day left')
    })

    it('handles zero days case correctly', () => {
        const { result } = renderHook(() => useTrialProgress(0))

        expect(result.current.progressPercentage).toBe(0)
        expect(result.current.progressText).toBe('Trial ends today')
    })

    it('caps progress percentage at 100% for values exceeding trial duration', () => {
        const { result } = renderHook(() => useTrialProgress(20))

        expect(result.current.progressPercentage).toBe(100)
        expect(result.current.progressText).toBe('20 days left')
    })

    it('sets progress percentage to 0% for negative values', () => {
        const { result } = renderHook(() => useTrialProgress(-5))

        expect(result.current.progressPercentage).toBe(0)
        expect(result.current.progressText).toBe('-5 days left')
    })
})
