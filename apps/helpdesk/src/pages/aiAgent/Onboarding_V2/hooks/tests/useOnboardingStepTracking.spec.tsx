import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useOnboardingStepTracking } from '../useOnboardingStepTracking'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        AiAgentOnboardingStepViewed: 'ai-agent-onboarding-step-viewed',
        AiAgentOnboardingStepCompleted: 'ai-agent-onboarding-step-completed',
        AiAgentOnboardingButtonClicked: 'ai-agent-onboarding-button-clicked',
        AiAgentOnboardingClosed: 'ai-agent-onboarding-closed',
    },
}))

const mockLogEvent = jest.requireMock('@repo/logging').logEvent as jest.Mock

const ROUTE_PATH = '/app/ai-agent/:shopType/:shopName/onboarding/:step'

const renderTracking = (
    params: Parameters<typeof useOnboardingStepTracking>[0],
    {
        step = 'tone of voice',
        shopName = 'test-shop',
    }: { step?: string; shopName?: string } = {},
) =>
    renderHook(() => useOnboardingStepTracking(params), {
        initialEntries: [
            `/app/ai-agent/shopify/${shopName}/onboarding/${step}`,
        ],
        path: ROUTE_PATH,
    })

describe('useOnboardingStepTracking', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('logs StepViewed once on mount with route params + step number', () => {
        const onNextClick = jest.fn()
        const onBackClick = jest.fn()

        renderTracking({
            currentStep: 1,
            totalSteps: 4,
            onNextClick,
            onBackClick,
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            'ai-agent-onboarding-step-viewed',
            {
                onboardingFlow: 'wizard',
                stepName: 'tone of voice',
                stepNumber: 1,
                shopName: 'test-shop',
            },
        )
    })

    it('logs ButtonClicked with buttonType="next" when not on the last step and forwards the click', () => {
        const onNextClick = jest.fn()
        const onBackClick = jest.fn()

        const { result } = renderTracking({
            currentStep: 2,
            totalSteps: 4,
            onNextClick,
            onBackClick,
        })

        act(() => result.current.onNextAction())

        expect(onNextClick).toHaveBeenCalledTimes(1)
        expect(mockLogEvent).toHaveBeenCalledWith(
            'ai-agent-onboarding-button-clicked',
            expect.objectContaining({
                buttonType: 'next',
                stepNumber: 2,
            }),
        )
    })

    it('logs ButtonClicked with buttonType="finish" on the last step', () => {
        const onNextClick = jest.fn()
        const onBackClick = jest.fn()

        const { result } = renderTracking({
            currentStep: 4,
            totalSteps: 4,
            onNextClick,
            onBackClick,
        })

        act(() => result.current.onNextAction())

        expect(mockLogEvent).toHaveBeenCalledWith(
            'ai-agent-onboarding-button-clicked',
            expect.objectContaining({
                buttonType: 'finish',
                stepNumber: 4,
            }),
        )
    })

    it('logs ButtonClicked with buttonType="back" and forwards the click', () => {
        const onNextClick = jest.fn()
        const onBackClick = jest.fn()

        const { result } = renderTracking({
            currentStep: 2,
            totalSteps: 4,
            onNextClick,
            onBackClick,
        })

        act(() => result.current.onBackAction())

        expect(onBackClick).toHaveBeenCalledTimes(1)
        expect(mockLogEvent).toHaveBeenCalledWith(
            'ai-agent-onboarding-button-clicked',
            expect.objectContaining({
                buttonType: 'back',
                stepNumber: 2,
            }),
        )
    })

    it('returns undefined onCloseAction when onCloseClick is not provided', () => {
        const { result } = renderTracking({
            currentStep: 1,
            totalSteps: 4,
            onNextClick: jest.fn(),
            onBackClick: jest.fn(),
        })

        expect(result.current.onCloseAction).toBeUndefined()
    })

    it('logs Closed and forwards the click when onCloseClick is provided', () => {
        const onCloseClick = jest.fn()

        const { result } = renderTracking({
            currentStep: 3,
            totalSteps: 4,
            onNextClick: jest.fn(),
            onBackClick: jest.fn(),
            onCloseClick,
        })

        act(() => result.current.onCloseAction?.())

        expect(onCloseClick).toHaveBeenCalledTimes(1)
        expect(mockLogEvent).toHaveBeenCalledWith(
            'ai-agent-onboarding-closed',
            expect.objectContaining({
                stepNumber: 3,
                isCompleted: false,
                shopName: 'test-shop',
            }),
        )
    })

    it('falls back to "unknown" for step and shop when route params are missing', () => {
        renderHook(
            () =>
                useOnboardingStepTracking({
                    currentStep: 1,
                    totalSteps: 4,
                    onNextClick: jest.fn(),
                    onBackClick: jest.fn(),
                }),
            { initialEntries: ['/somewhere/else'] },
        )

        expect(mockLogEvent).toHaveBeenCalledWith(
            'ai-agent-onboarding-step-viewed',
            expect.objectContaining({
                stepName: 'unknown',
                shopName: 'unknown',
            }),
        )
    })
})
