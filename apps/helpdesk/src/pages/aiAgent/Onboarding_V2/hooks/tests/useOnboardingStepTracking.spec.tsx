import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { mockFeatureFlags } from 'tests/mockFeatureFlags'

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
        jtbd,
        isV3 = false,
    }: {
        step?: string
        shopName?: string
        jtbd?: 'sales' | 'support' | string
        isV3?: boolean
    } = {},
) => {
    mockFeatureFlags({ [FeatureFlagKey.AiAgentOnboardingV3]: isV3 })
    const search = jtbd ? `?jtbd=${jtbd}` : ''
    return renderHook(() => useOnboardingStepTracking(params), {
        initialEntries: [
            `/app/ai-agent/shopify/${shopName}/onboarding/${step}${search}`,
        ],
        path: ROUTE_PATH,
    })
}

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
                jtbd: 'unknown',
                onboardingVersion: 'v2',
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

    it('does not stamp stepName on the Closed event', () => {
        const { result } = renderTracking({
            currentStep: 2,
            totalSteps: 4,
            onNextClick: jest.fn(),
            onBackClick: jest.fn(),
            onCloseClick: jest.fn(),
        })

        act(() => result.current.onCloseAction?.())

        const closedCall = mockLogEvent.mock.calls.find(
            ([eventName]) => eventName === 'ai-agent-onboarding-closed',
        )
        expect(closedCall?.[1]).not.toHaveProperty('stepName')
    })

    it('falls back to "unknown" for step and shop when route params are missing', () => {
        mockFeatureFlags({ [FeatureFlagKey.AiAgentOnboardingV3]: false })
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

    it('does not log StepViewed while the onboarding version flag is loading', () => {
        ;(useFlagWithLoading as jest.Mock).mockReturnValueOnce({
            value: false,
            isLoading: true,
        })

        renderHook(
            () =>
                useOnboardingStepTracking({
                    currentStep: 1,
                    totalSteps: 4,
                    onNextClick: jest.fn(),
                    onBackClick: jest.fn(),
                }),
            {
                initialEntries: [
                    '/app/ai-agent/shopify/test-shop/onboarding/tone-of-voice',
                ],
                path: ROUTE_PATH,
            },
        )

        expect(mockLogEvent).not.toHaveBeenCalled()
    })

    describe('jtbd + onboardingVersion stamping', () => {
        it.each([
            {
                label: 'V2 flag-off, no jtbd param',
                isV3: false,
                jtbd: undefined,
                expectedJtbd: 'unknown',
                expectedVersion: 'v2',
            },
            {
                label: 'V3 sales',
                isV3: true,
                jtbd: 'sales',
                expectedJtbd: 'sales',
                expectedVersion: 'v3',
            },
            {
                label: 'V3 support',
                isV3: true,
                jtbd: 'support',
                expectedJtbd: 'support',
                expectedVersion: 'v3',
            },
            {
                label: 'V3 with no jtbd param',
                isV3: true,
                jtbd: undefined,
                expectedJtbd: 'unknown',
                expectedVersion: 'v3',
            },
        ])(
            'stamps jtbd + onboardingVersion on all four events: $label',
            ({ isV3, jtbd, expectedJtbd, expectedVersion }) => {
                const { result } = renderTracking(
                    {
                        currentStep: 2,
                        totalSteps: 4,
                        onNextClick: jest.fn(),
                        onBackClick: jest.fn(),
                        onCloseClick: jest.fn(),
                    },
                    { isV3, jtbd },
                )

                act(() => result.current.onNextAction())
                act(() => result.current.onBackAction())
                act(() => result.current.onCloseAction?.())

                const expectedProps = expect.objectContaining({
                    jtbd: expectedJtbd,
                    onboardingVersion: expectedVersion,
                })

                expect(mockLogEvent).toHaveBeenCalledWith(
                    'ai-agent-onboarding-step-viewed',
                    expectedProps,
                )
                expect(mockLogEvent).toHaveBeenCalledWith(
                    'ai-agent-onboarding-step-completed',
                    expect.objectContaining({
                        jtbd: expectedJtbd,
                        onboardingVersion: expectedVersion,
                    }),
                )
                expect(mockLogEvent).toHaveBeenCalledWith(
                    'ai-agent-onboarding-button-clicked',
                    expect.objectContaining({
                        buttonType: 'next',
                        jtbd: expectedJtbd,
                        onboardingVersion: expectedVersion,
                    }),
                )
                expect(mockLogEvent).toHaveBeenCalledWith(
                    'ai-agent-onboarding-button-clicked',
                    expect.objectContaining({
                        buttonType: 'back',
                        jtbd: expectedJtbd,
                        onboardingVersion: expectedVersion,
                    }),
                )
                expect(mockLogEvent).toHaveBeenCalledWith(
                    'ai-agent-onboarding-closed',
                    expectedProps,
                )
            },
        )

        it('treats unrecognized jtbd values as "unknown"', () => {
            renderTracking(
                {
                    currentStep: 1,
                    totalSteps: 4,
                    onNextClick: jest.fn(),
                    onBackClick: jest.fn(),
                },
                { isV3: true, jtbd: 'bogus' },
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent-onboarding-step-viewed',
                expect.objectContaining({ jtbd: 'unknown' }),
            )
        })
    })
})
