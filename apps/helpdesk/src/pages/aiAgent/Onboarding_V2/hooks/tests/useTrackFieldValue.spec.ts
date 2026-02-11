import { act, renderHook } from '@testing-library/react'

import { useTrackFieldValue } from '../useTrackFieldValue'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        AiAgentOnboardingFieldValueUpdated:
            'ai-agent-onboarding-field-value-updated',
    },
}))

const mockLogEvent = jest.requireMock('@repo/logging').logEvent as jest.Mock

describe('useTrackFieldValue', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    const defaultParams = {
        currentStep: 1,
        stepName: 'tone-of-voice',
        shopName: 'test-shop',
        fieldName: 'toneOfVoice',
        fieldType: 'select' as const,
        fieldValue: 'friendly',
    }

    it('should not track on initial render', () => {
        renderHook(() => useTrackFieldValue(defaultParams))

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        expect(mockLogEvent).not.toHaveBeenCalled()
    })

    it('should track when field value changes', () => {
        const { rerender } = renderHook((props) => useTrackFieldValue(props), {
            initialProps: defaultParams,
        })

        rerender({ ...defaultParams, fieldValue: 'professional' })

        act(() => {
            jest.advanceTimersByTime(0)
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            'ai-agent-onboarding-field-value-updated',
            expect.objectContaining({
                fieldName: 'toneOfVoice',
                fieldValue: 'professional',
                stepName: 'tone-of-voice',
            }),
        )
    })

    it('should debounce tracking when debounceMs is set', () => {
        const { rerender } = renderHook((props) => useTrackFieldValue(props), {
            initialProps: { ...defaultParams, debounceMs: 1000 },
        })

        rerender({ ...defaultParams, fieldValue: 'value1', debounceMs: 1000 })
        rerender({ ...defaultParams, fieldValue: 'value2', debounceMs: 1000 })
        rerender({ ...defaultParams, fieldValue: 'value3', debounceMs: 1000 })

        act(() => {
            jest.advanceTimersByTime(500)
        })
        expect(mockLogEvent).not.toHaveBeenCalled()

        act(() => {
            jest.advanceTimersByTime(500)
        })
        expect(mockLogEvent).toHaveBeenCalledTimes(1)
        expect(mockLogEvent).toHaveBeenCalledWith(
            'ai-agent-onboarding-field-value-updated',
            expect.objectContaining({ fieldValue: 'value3' }),
        )
    })

    it('should not track when value stays the same', () => {
        const { rerender } = renderHook((props) => useTrackFieldValue(props), {
            initialProps: defaultParams,
        })

        rerender(defaultParams)

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        expect(mockLogEvent).not.toHaveBeenCalled()
    })

    it('should use default values for optional params', () => {
        const { rerender } = renderHook((props) => useTrackFieldValue(props), {
            initialProps: {
                currentStep: 1,
                fieldName: 'test',
                fieldType: 'input' as const,
                fieldValue: 'initial',
            },
        })

        rerender({
            currentStep: 1,
            fieldName: 'test',
            fieldType: 'input' as const,
            fieldValue: 'changed',
        })

        act(() => {
            jest.advanceTimersByTime(0)
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            'ai-agent-onboarding-field-value-updated',
            expect.objectContaining({
                stepName: 'unknown',
                shopName: 'unknown',
            }),
        )
    })

    it('should clear timeout on unmount', () => {
        const { rerender, unmount } = renderHook(
            (props) => useTrackFieldValue(props),
            { initialProps: { ...defaultParams, debounceMs: 1000 } },
        )

        rerender({
            ...defaultParams,
            fieldValue: 'new-value',
            debounceMs: 1000,
        })
        unmount()

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        expect(mockLogEvent).not.toHaveBeenCalled()
    })
})
