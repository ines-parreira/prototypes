import { act, renderHook } from '@testing-library/react'

import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

import type { AiAgentCtasParams } from '../hooks/useAiAgentPaywallCTA'
import { useAiAgentCtas } from '../hooks/useAiAgentPaywallCTA'
import { TrialEventType, TrialType } from '../types/ShoppingAssistant'
import { logInTrialEventFromPaywall } from '../utils/eventLogger'

jest.mock('../utils/eventLogger', () => ({
    logInTrialEventFromPaywall: jest.fn(),
}))

const mockLogInTrialEventFromPaywall = logInTrialEventFromPaywall as jest.Mock

const createDefaultProps = (overrides = {}): AiAgentCtasParams => ({
    canStartOnboarding: false,
    hasAutomate: false,
    isDuringOrAfterTrial: false,
    canBookDemo: false,
    canNotifyAdmin: false,
    canSeeTrial: false,
    canSeeSubscribeNow: false,
    isAdmin: false,
    learnMoreUrl: EXTERNAL_URLS.AI_AGENT_TRIAL_LEARN_MORE_PAYWALL,
    onOpenWizard: jest.fn(),
    onOpenSubscribeModal: jest.fn(),
    onOpenTrialUpgradeModal: jest.fn(),
    onOpenUpgradePlanModal: jest.fn(),
    onOpenTrialRequestModal: jest.fn(),
    onCloseTrialRequestModal: jest.fn(),
    onCloseTrialFinishSetupModal: jest.fn(),
    isOnboarded: false,
    isNotifyAdminDisabled: false,
    trialModals: {
        isTrialModalOpen: false,
        newTrialUpgradePlanModal: {},
        isTrialRequestModalOpen: false,
        trialRequestModal: {},
        isTrialFinishSetupModalOpen: false,
        trialFinishSetupModal: {},
    },
    isOnUpdateOnboardingWizard: false,
    ...overrides,
})

describe('useAiAgentCtas', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders TrialTryModal with correct props', () => {
        const newTrialUpgradePlanModal = { someModalProp: 'test' }
        const props = createDefaultProps({
            trialModals: {
                isTrialModalOpen: true,
                newTrialUpgradePlanModal,
                isTrialRequestModalOpen: false,
                trialRequestModal: {},
                isTrialFinishSetupModalOpen: false,
                trialFinishSetupModal: {},
            },
        })

        const { result } = renderHook(() => useAiAgentCtas(props))

        const modals = result.current.modals as any
        const TrialTryModalComponent = modals.props.children[0]

        expect(TrialTryModalComponent.type.name).toBe('TrialTryModal')
        expect(TrialTryModalComponent.props.isOpen).toBe(true)
        expect(TrialTryModalComponent.props.someModalProp).toBe('test')
    })

    it('renders RequestTrialModal with correct props', () => {
        const onCloseTrialRequestModal = jest.fn()
        const trialRequestModal = { someModalProp: 'test' }
        const props = createDefaultProps({
            onCloseTrialRequestModal,
            trialModals: {
                isTrialModalOpen: false,
                newTrialUpgradePlanModal: {},
                isTrialRequestModalOpen: true,
                trialRequestModal,
                isTrialFinishSetupModalOpen: false,
                trialFinishSetupModal: {},
            },
        })

        const { result } = renderHook(() => useAiAgentCtas(props))

        const modals = result.current.modals as any
        const RequestTrialModalComponent = modals.props.children[1]

        expect(RequestTrialModalComponent.type.name).toBe('RequestTrialModal')
        expect(RequestTrialModalComponent.props.isOpen).toBe(true)
        expect(RequestTrialModalComponent.props.onClose).toBe(
            onCloseTrialRequestModal,
        )
        expect(RequestTrialModalComponent.props.someModalProp).toBe('test')
    })

    it('renders TrialFinishSetupModal with correct props', () => {
        const onCloseTrialFinishSetupModal = jest.fn()
        const trialFinishSetupModal = { someModalProp: 'test' }
        const props = createDefaultProps({
            onCloseTrialFinishSetupModal,
            trialModals: {
                isTrialModalOpen: false,
                newTrialUpgradePlanModal: {},
                isTrialRequestModalOpen: false,
                trialRequestModal: {},
                isTrialFinishSetupModalOpen: true,
                trialFinishSetupModal,
            },
        })

        const { result } = renderHook(() => useAiAgentCtas(props))

        const modals = result.current.modals as any
        const trialFinishSetupModalComponent = modals.props.children[2]

        expect(trialFinishSetupModalComponent.type.name).toBe(
            'TrialFinishSetupModal',
        )
        expect(trialFinishSetupModalComponent.props.isOpen).toBe(true)
        expect(trialFinishSetupModalComponent.props.onClose).toBe(
            onCloseTrialFinishSetupModal,
        )
        expect(trialFinishSetupModalComponent.props.someModalProp).toBe('test')
    })

    it.each([true, false])(
        'returns SetupAIAgentAction if user can start onboarding [isOnUpdateOnboardingWizard: %s]',
        async (isOnUpdateOnboardingWizard: boolean) => {
            const onOpenWizard = jest.fn()
            const props = createDefaultProps({
                canStartOnboarding: true,
                isOnUpdateOnboardingWizard,
                onOpenWizard,
            })

            const { result } = renderHook(() => useAiAgentCtas(props))
            const {
                primaryButtonText,
                primaryButtonOnClick,
                secondaryButton,
                tertiaryButton,
            } = extract(result)

            expect(primaryButtonText).toBe(
                isOnUpdateOnboardingWizard
                    ? 'Continue Setup'
                    : 'Set Up AI Agent',
            )

            await act(() => primaryButtonOnClick())
            expect(onOpenWizard).toHaveBeenCalled()

            expect(secondaryButton).toBeUndefined()

            expect(tertiaryButton).toBeUndefined()
        },
    )

    describe('as a non-admin user', () => {
        it('returns nothing if the user cannot notify an admin', () => {
            const props = createDefaultProps({})

            const { result } = renderHook(() => useAiAgentCtas(props))
            const { primaryButton, secondaryButton, tertiaryButton } =
                extract(result)

            expect(primaryButton).toBeUndefined()

            expect(secondaryButton).toBeUndefined()

            expect(tertiaryButton).toBeUndefined()
        })

        describe.each([true, false])(
            'when the merchant has [AIAgent: %s]',
            (hasAutomate: boolean) => {
                it.each([true, false])(
                    'returns NotifyAdminAction and LearnMoreAction if the user can notify an admin but cant book a demo [isNotifyAdminDisabled: %s]',
                    async (isNotifyAdminDisabled: boolean) => {
                        const onOpenTrialRequestModal = jest.fn()
                        const props = createDefaultProps({
                            canNotifyAdmin: true,
                            learnMoreUrl: 'http://foo.bar.com/',
                            hasAutomate,
                            isNotifyAdminDisabled,
                            onOpenTrialRequestModal,
                        })

                        const { result } = renderHook(() =>
                            useAiAgentCtas(props),
                        )
                        const {
                            primaryButton,
                            primaryButtonText,
                            primaryButtonOnClick,
                            secondaryButtonText,
                            secondaryButtonOnClick,
                            secondaryButtonHref,
                            tertiaryButton,
                        } = extract(result)

                        expect(primaryButtonText).toBe(
                            isNotifyAdminDisabled
                                ? 'Admin notified'
                                : 'Notify admin',
                        )

                        if (isNotifyAdminDisabled) {
                            expect(primaryButton.isDisabled).toBeTruthy()
                        } else {
                            expect(primaryButton.isDisabled).toBeFalsy()

                            await act(() => primaryButtonOnClick())

                            expect(onOpenTrialRequestModal).toHaveBeenCalled()
                            expect(
                                mockLogInTrialEventFromPaywall,
                            ).toHaveBeenCalledWith(
                                TrialEventType.NotifyAdmin,
                                hasAutomate
                                    ? TrialType.ShoppingAssistant
                                    : TrialType.AiAgent,
                            )
                        }

                        expect(secondaryButtonText).toBe('Learn more')
                        expect(secondaryButtonHref).toBe('http://foo.bar.com/')

                        await act(() => secondaryButtonOnClick())

                        expect(
                            mockLogInTrialEventFromPaywall,
                        ).toHaveBeenCalledWith(
                            TrialEventType.Learn,
                            hasAutomate
                                ? TrialType.ShoppingAssistant
                                : TrialType.AiAgent,
                        )

                        expect(tertiaryButton).toBeUndefined()
                    },
                )

                it.each([true, false])(
                    'returns NotifyAdminAction, BookADemo, and LearnMoreAction if the user can notify an admin and can book a demo [isNotifyAdminDisabled: %s]',
                    async (isNotifyAdminDisabled: boolean) => {
                        const mockWindowOpen = jest.fn()
                        global.window.open = mockWindowOpen

                        const onOpenTrialRequestModal = jest.fn()

                        const props = createDefaultProps({
                            canNotifyAdmin: true,
                            canBookDemo: true,
                            learnMoreUrl: 'http://foo.bar.com/',
                            hasAutomate,
                            isNotifyAdminDisabled,
                            onOpenTrialRequestModal,
                        })

                        const { result } = renderHook(() =>
                            useAiAgentCtas(props),
                        )
                        const {
                            primaryButton,
                            primaryButtonText,
                            primaryButtonOnClick,
                            secondaryButtonText,
                            secondaryButtonOnClick,
                            tertiaryButtonText,
                            tertiaryButtonOnClick,
                            tertiaryButtonHref,
                        } = extract(result)

                        expect(primaryButtonText).toBe(
                            isNotifyAdminDisabled
                                ? 'Admin notified'
                                : 'Notify admin',
                        )

                        if (isNotifyAdminDisabled) {
                            expect(primaryButton.isDisabled).toBeTruthy()
                        } else {
                            expect(primaryButton.isDisabled).toBeFalsy()

                            await act(() => primaryButtonOnClick())

                            expect(onOpenTrialRequestModal).toHaveBeenCalled()
                            expect(
                                mockLogInTrialEventFromPaywall,
                            ).toHaveBeenCalledWith(
                                TrialEventType.NotifyAdmin,
                                hasAutomate
                                    ? TrialType.ShoppingAssistant
                                    : TrialType.AiAgent,
                            )
                        }

                        expect(secondaryButtonText).toBe('Book a demo')

                        await act(() => secondaryButtonOnClick())

                        expect(mockWindowOpen).toHaveBeenCalledWith(
                            hasAutomate
                                ? EXTERNAL_URLS.BOOK_DEMO_SHOPPING_ASSISTANT
                                : EXTERNAL_URLS.BOOK_DEMO_AIAGENT,
                            '_blank',
                        )
                        expect(
                            mockLogInTrialEventFromPaywall,
                        ).toHaveBeenCalledWith(
                            TrialEventType.Demo,
                            hasAutomate
                                ? TrialType.ShoppingAssistant
                                : TrialType.AiAgent,
                        )

                        expect(tertiaryButtonText).toBe('Learn more')
                        expect(tertiaryButtonHref).toBe('http://foo.bar.com/')

                        await act(() => tertiaryButtonOnClick())

                        expect(
                            mockLogInTrialEventFromPaywall,
                        ).toHaveBeenCalledWith(
                            TrialEventType.Learn,
                            hasAutomate
                                ? TrialType.ShoppingAssistant
                                : TrialType.AiAgent,
                        )
                    },
                )
            },
        )
    })

    describe('as an admin user', () => {
        it('returns LearnMoreAction if the user has no available actions', async () => {
            const props = createDefaultProps({
                isAdmin: true,
                canSeeTrial: false,
                canSeeSubscribeNow: false,
                canBookDemo: false,
                learnMoreUrl: 'http://foo.bar.com/',
            })

            const { result } = renderHook(() => useAiAgentCtas(props))
            const {
                primaryButtonText,
                primaryButtonHref,
                primaryButtonOnClick,
                secondaryButton,
                tertiaryButton,
            } = extract(result)

            expect(primaryButtonText).toBe('Learn more')
            expect(primaryButtonHref).toBe('http://foo.bar.com/')

            await act(() => primaryButtonOnClick())

            expect(mockLogInTrialEventFromPaywall).toHaveBeenCalledWith(
                TrialEventType.Learn,
                TrialType.AiAgent,
            )

            expect(secondaryButton).toBeUndefined()
            expect(tertiaryButton).toBeUndefined()
        })

        describe('when the merchant does not have AI Agent', () => {
            it.each([true, false])(
                'returns SubscribeNowAction if the user can see subscribe now CTA [canBookDemo: %s]',
                async (canBookDemo: boolean) => {
                    const mockWindowOpen = jest.fn()
                    global.window.open = mockWindowOpen

                    const onOpenSubscribeModal = jest.fn()
                    const onOpenWizard = jest.fn()

                    const props = createDefaultProps({
                        isAdmin: true,
                        canSeeSubscribeNow: true,
                        canBookDemo,
                        learnMoreUrl: 'http://foo.bar.com/',
                        onOpenSubscribeModal,
                        onOpenWizard,
                    })

                    const { result } = renderHook(() => useAiAgentCtas(props))
                    const {
                        primaryButtonText,
                        primaryButtonOnClick,
                        secondaryButtonText,
                        secondaryButtonOnClick,
                        secondaryButtonHref,
                        tertiaryButton,
                        tertiaryButtonText,
                        tertiaryButtonOnClick,
                        tertiaryButtonHref,
                    } = extract(result)

                    expect(primaryButtonText).toBe('Subscribe now')

                    await act(() => primaryButtonOnClick())

                    expect(onOpenSubscribeModal).toHaveBeenCalled()
                    expect(mockLogInTrialEventFromPaywall).toHaveBeenCalledWith(
                        TrialEventType.UpgradePlan,
                        TrialType.AiAgent,
                    )

                    if (canBookDemo) {
                        expect(secondaryButtonText).toBe('Book a demo')

                        await act(() => secondaryButtonOnClick())

                        expect(mockWindowOpen).toHaveBeenCalledWith(
                            'https://www.gorgias.com/demo/customers/automate?utm_source=product&utm_medium=in_product&utm_campaign=ai_agent_paywall',
                            '_blank',
                        )
                        expect(
                            mockLogInTrialEventFromPaywall,
                        ).toHaveBeenCalledWith(
                            TrialEventType.Demo,
                            TrialType.AiAgent,
                        )
                    } else {
                        expect(secondaryButtonText).toBe('Learn more')
                        expect(secondaryButtonHref).toBe('http://foo.bar.com/')

                        await act(() => secondaryButtonOnClick())

                        expect(
                            mockLogInTrialEventFromPaywall,
                        ).toHaveBeenCalledWith(
                            TrialEventType.Learn,
                            TrialType.AiAgent,
                        )
                    }

                    if (canBookDemo) {
                        expect(tertiaryButtonText).toBe('Learn more')
                        expect(tertiaryButtonHref).toBe('http://foo.bar.com/')

                        await act(() => tertiaryButtonOnClick())

                        expect(
                            mockLogInTrialEventFromPaywall,
                        ).toHaveBeenCalledWith(
                            TrialEventType.Learn,
                            TrialType.AiAgent,
                        )
                    } else {
                        expect(tertiaryButton).toBeUndefined()
                    }
                },
            )

            it.each([true, false])(
                'returns TryTrialAction is the user can see try trial CTA [canBookDemo: %s]',
                async (canBookDemo: boolean) => {
                    const mockWindowOpen = jest.fn()
                    global.window.open = mockWindowOpen

                    const onOpenTrialUpgradeModal = jest.fn()
                    const onOpenWizard = jest.fn()

                    const props = createDefaultProps({
                        isAdmin: true,
                        canSeeTrial: true,
                        canBookDemo,
                        learnMoreUrl: 'http://foo.bar.com/',
                        onOpenTrialUpgradeModal,
                        onOpenWizard,
                    })

                    const { result } = renderHook(() => useAiAgentCtas(props))
                    const {
                        primaryButtonText,
                        primaryButtonOnClick,
                        secondaryButtonText,
                        secondaryButtonOnClick,
                        secondaryButtonHref,
                        tertiaryButton,
                        tertiaryButtonText,
                        tertiaryButtonOnClick,
                        tertiaryButtonHref,
                    } = extract(result)

                    expect(primaryButtonText).toBe('Try for free')

                    await act(() => primaryButtonOnClick())

                    expect(onOpenTrialUpgradeModal).toHaveBeenCalled()
                    expect(mockLogInTrialEventFromPaywall).toHaveBeenCalledWith(
                        TrialEventType.StartTrial,
                        TrialType.AiAgent,
                    )

                    if (canBookDemo) {
                        expect(secondaryButtonText).toBe('Book a demo')

                        await act(() => secondaryButtonOnClick())

                        expect(mockWindowOpen).toHaveBeenCalledWith(
                            'https://www.gorgias.com/demo/customers/automate?utm_source=product&utm_medium=in_product&utm_campaign=ai_agent_paywall',
                            '_blank',
                        )
                        expect(
                            mockLogInTrialEventFromPaywall,
                        ).toHaveBeenCalledWith(
                            TrialEventType.Demo,
                            TrialType.AiAgent,
                        )
                    } else {
                        expect(secondaryButtonText).toBe('Learn more')
                        expect(secondaryButtonHref).toBe('http://foo.bar.com/')

                        await act(() => secondaryButtonOnClick())

                        expect(
                            mockLogInTrialEventFromPaywall,
                        ).toHaveBeenCalledWith(
                            TrialEventType.Learn,
                            TrialType.AiAgent,
                        )
                    }

                    if (canBookDemo) {
                        expect(tertiaryButtonText).toBe('Learn more')
                        expect(tertiaryButtonHref).toBe('http://foo.bar.com/')

                        await act(() => tertiaryButtonOnClick())

                        expect(
                            mockLogInTrialEventFromPaywall,
                        ).toHaveBeenCalledWith(
                            TrialEventType.Learn,
                            TrialType.AiAgent,
                        )
                    } else {
                        expect(tertiaryButton).toBeUndefined()
                    }
                },
            )
        })

        describe('when the merchant has AI Agent', () => {
            it.each([true, false])(
                'returns SubscribeNowAction if the user can see subscribe now CTA [canBookDemo: %s]',
                async (canBookDemo: boolean) => {
                    const mockWindowOpen = jest.fn()
                    global.window.open = mockWindowOpen

                    const onOpenSubscribeModal = jest.fn()
                    const onOpenWizard = jest.fn()

                    const props = createDefaultProps({
                        isAdmin: true,
                        hasAutomate: true,
                        canSeeSubscribeNow: true,
                        canBookDemo,
                        learnMoreUrl: 'http://foo.bar.com/',
                        onOpenSubscribeModal,
                        onOpenWizard,
                    })

                    const { result } = renderHook(() => useAiAgentCtas(props))
                    const {
                        primaryButtonText,
                        primaryButtonOnClick,
                        secondaryButtonText,
                        secondaryButtonOnClick,
                        secondaryButtonHref,
                        tertiaryButtonText,
                        tertiaryButtonOnClick,
                    } = extract(result)

                    expect(primaryButtonText).toBe('Upgrade now')

                    await act(() => primaryButtonOnClick())

                    expect(onOpenSubscribeModal).toHaveBeenCalled()
                    expect(mockLogInTrialEventFromPaywall).toHaveBeenCalledWith(
                        TrialEventType.UpgradePlan,
                        TrialType.ShoppingAssistant,
                    )

                    if (canBookDemo) {
                        expect(secondaryButtonText).toBe('Book a demo')

                        await act(() => secondaryButtonOnClick())

                        expect(mockWindowOpen).toHaveBeenCalledWith(
                            'https://www.gorgias.com/demo/customers/automate?utm_source=product&utm_medium=in_product&utm_campaign=shop_assistant_paywall',
                            '_blank',
                        )
                        expect(
                            mockLogInTrialEventFromPaywall,
                        ).toHaveBeenCalledWith(
                            TrialEventType.Demo,
                            TrialType.ShoppingAssistant,
                        )
                    } else {
                        expect(secondaryButtonText).toBe('Learn more')
                        expect(secondaryButtonHref).toBe('http://foo.bar.com/')

                        await act(() => secondaryButtonOnClick())

                        expect(
                            mockLogInTrialEventFromPaywall,
                        ).toHaveBeenCalledWith(
                            TrialEventType.Learn,
                            TrialType.ShoppingAssistant,
                        )
                    }

                    expect(tertiaryButtonText).toBe('Start AI Agent only')

                    await act(() => tertiaryButtonOnClick())

                    expect(onOpenWizard).toHaveBeenCalled()
                },
            )

            it.each([true, false])(
                'returns TryTrialAction is the user can see try trial CTA [canBookDemo: %s]',
                async (canBookDemo: boolean) => {
                    const mockWindowOpen = jest.fn()
                    global.window.open = mockWindowOpen

                    const onOpenTrialUpgradeModal = jest.fn()
                    const onOpenWizard = jest.fn()

                    const props = createDefaultProps({
                        isAdmin: true,
                        hasAutomate: true,
                        canSeeTrial: true,
                        canBookDemo,
                        learnMoreUrl: 'http://foo.bar.com/',
                        onOpenTrialUpgradeModal,
                        onOpenWizard,
                    })

                    const { result } = renderHook(() => useAiAgentCtas(props))
                    const {
                        primaryButtonText,
                        primaryButtonOnClick,
                        secondaryButtonText,
                        secondaryButtonOnClick,
                        secondaryButtonHref,
                        tertiaryButtonText,
                        tertiaryButtonOnClick,
                    } = extract(result)

                    expect(primaryButtonText).toBe('Try for 14 days')

                    await act(() => primaryButtonOnClick())

                    expect(onOpenTrialUpgradeModal).toHaveBeenCalled()
                    expect(mockLogInTrialEventFromPaywall).toHaveBeenCalledWith(
                        TrialEventType.StartTrial,
                        TrialType.ShoppingAssistant,
                    )

                    if (canBookDemo) {
                        expect(secondaryButtonText).toBe('Book a demo')

                        await act(() => secondaryButtonOnClick())

                        expect(mockWindowOpen).toHaveBeenCalledWith(
                            'https://www.gorgias.com/demo/customers/automate?utm_source=product&utm_medium=in_product&utm_campaign=shop_assistant_paywall',
                            '_blank',
                        )
                        expect(
                            mockLogInTrialEventFromPaywall,
                        ).toHaveBeenCalledWith(
                            TrialEventType.Demo,
                            TrialType.ShoppingAssistant,
                        )
                    } else {
                        expect(secondaryButtonText).toBe('Learn more')
                        expect(secondaryButtonHref).toBe('http://foo.bar.com/')

                        await act(() => secondaryButtonOnClick())

                        expect(
                            mockLogInTrialEventFromPaywall,
                        ).toHaveBeenCalledWith(
                            TrialEventType.Learn,
                            TrialType.ShoppingAssistant,
                        )
                    }

                    expect(tertiaryButtonText).toBe('Start AI Agent only')

                    await act(() => tertiaryButtonOnClick())

                    expect(onOpenWizard).toHaveBeenCalled()
                },
            )

            it.each([true, false])(
                'does NOT return StartAIAgentAction when AI Agent is already onboarded [canBookDemo: %s]',
                async (canBookDemo: boolean) => {
                    const mockWindowOpen = jest.fn()
                    global.window.open = mockWindowOpen

                    const onOpenSubscribeModal = jest.fn()
                    const onOpenWizard = jest.fn()

                    const props = createDefaultProps({
                        isAdmin: true,
                        hasAutomate: true,
                        isOnboarded: true, // AI Agent already onboarded
                        canSeeSubscribeNow: true,
                        canBookDemo,
                        learnMoreUrl: 'http://foo.bar.com/',
                        onOpenSubscribeModal,
                        onOpenWizard,
                    })

                    const { result } = renderHook(() => useAiAgentCtas(props))
                    const {
                        primaryButtonText,
                        secondaryButtonText,
                        tertiaryButtonText,
                    } = extract(result)

                    expect(primaryButtonText).toBe('Upgrade now')

                    if (canBookDemo) {
                        expect(secondaryButtonText).toBe('Book a demo')
                        // No tertiary button when canBookDemo is true
                        expect(tertiaryButtonText).toBeUndefined()
                    } else {
                        expect(secondaryButtonText).toBe('Learn more')
                        // No tertiary button because AI Agent is already onboarded
                        expect(tertiaryButtonText).toBeUndefined()
                    }
                },
            )

            it('does NOT return StartAIAgentAction when AI Agent is already onboarded with trial CTA', async () => {
                const onOpenTrialUpgradeModal = jest.fn()
                const onOpenWizard = jest.fn()

                const props = createDefaultProps({
                    isAdmin: true,
                    hasAutomate: true,
                    isOnboarded: true, // AI Agent already onboarded
                    canSeeTrial: true,
                    canBookDemo: false,
                    learnMoreUrl: 'http://foo.bar.com/',
                    onOpenTrialUpgradeModal,
                    onOpenWizard,
                })

                const { result } = renderHook(() => useAiAgentCtas(props))
                const {
                    primaryButtonText,
                    secondaryButtonText,
                    tertiaryButtonText,
                } = extract(result)

                expect(primaryButtonText).toBe('Try for 14 days')
                expect(secondaryButtonText).toBe('Learn more')
                // No tertiary button because AI Agent is already onboarded
                expect(tertiaryButtonText).toBeUndefined()
            })
        })
    })
})

function extract(result: any) {
    const ctas = result.current.ctas as any
    const afterctas = result.current.afterCtas as any

    const primaryButton =
        ctas?.props.children.props.children[0]?.props.children[0].props
    const primaryButtonText = primaryButton?.children
    const primaryButtonOnClick = primaryButton?.onClick
    const primaryButtonHref = primaryButton?.href

    const secondaryButton = ctas?.props.children.props.children[1]?.props
    const secondaryButtonText = secondaryButton?.children
    const secondaryButtonOnClick = secondaryButton?.onClick
    const secondaryButtonHref = secondaryButton?.href

    const tertiaryButton =
        afterctas?.props.children.props.children.props.children.props
    const tertiaryButtonText = tertiaryButton?.children.props.children
    const tertiaryButtonOnClick = tertiaryButton?.onClick
    const tertiaryButtonHref = tertiaryButton?.href

    return {
        primaryButton,
        primaryButtonText,
        primaryButtonOnClick,
        primaryButtonHref,
        secondaryButton,
        secondaryButtonText,
        secondaryButtonOnClick,
        secondaryButtonHref,
        tertiaryButton,
        tertiaryButtonText,
        tertiaryButtonOnClick,
        tertiaryButtonHref,
    }
}
