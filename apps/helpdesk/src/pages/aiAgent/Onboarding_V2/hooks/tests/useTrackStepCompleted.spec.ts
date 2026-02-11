import { act, renderHook } from '@testing-library/react'

import { useTrackStepCompleted } from '../useTrackStepCompleted'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        AiAgentOnboardingStepCompleted: 'ai-agent-onboarding-step-completed',
    },
}))

const mockLogEvent = jest.requireMock('@repo/logging').logEvent as jest.Mock

describe('useTrackStepCompleted', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    const defaultParams = {
        currentStep: 1,
        stepName: 'tone-of-voice',
        shopName: 'test-shop',
    }

    it('should return a function to track step completion', () => {
        const { result } = renderHook(() =>
            useTrackStepCompleted(defaultParams),
        )

        expect(typeof result.current).toBe('function')
    })

    it('should track step completion with time spent', () => {
        const { result } = renderHook(() =>
            useTrackStepCompleted(defaultParams),
        )

        act(() => {
            jest.advanceTimersByTime(30000)
        })

        act(() => {
            result.current()
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            'ai-agent-onboarding-step-completed',
            expect.objectContaining({
                onboardingFlow: 'wizard',
                stepName: 'tone-of-voice',
                stepNumber: 1,
                timeSpentSeconds: 30,
                shopName: 'test-shop',
            }),
        )
    })

    it('should reset entry time when step changes', () => {
        const { result, rerender } = renderHook(
            (props) => useTrackStepCompleted(props),
            { initialProps: defaultParams },
        )

        act(() => {
            jest.advanceTimersByTime(30000)
        })

        rerender({ ...defaultParams, currentStep: 2, stepName: 'personality' })

        act(() => {
            jest.advanceTimersByTime(10000)
        })

        act(() => {
            result.current()
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            'ai-agent-onboarding-step-completed',
            expect.objectContaining({
                stepNumber: 2,
                timeSpentSeconds: 10,
            }),
        )
    })

    it('should track 0 seconds when called immediately', () => {
        const { result } = renderHook(() =>
            useTrackStepCompleted(defaultParams),
        )

        act(() => {
            result.current()
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            'ai-agent-onboarding-step-completed',
            expect.objectContaining({
                timeSpentSeconds: 0,
            }),
        )
    })
})
