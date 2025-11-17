import { renderHook } from '@testing-library/react'

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
    isAdmin: false,
    learnMoreUrl: EXTERNAL_URLS.AI_AGENT_TRIAL_LEARN_MORE_PAYWALL,
    onOpenWizard: jest.fn(),
    onOpenSubscribeModal: jest.fn(),
    onOpenTrialUpgradeModal: jest.fn(),
    onOpenUpgradePlanModal: jest.fn(),
    onOpenTrialRequestModal: jest.fn(),
    onCloseTrialRequestModal: jest.fn(),
    onCloseTrialFinishSetupModal: jest.fn(),
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

    it('returns SetupAIAgentButton for backward compatibility or automate plan', () => {
        const props = createDefaultProps({
            canStartOnboarding: true,
        })

        const { result } = renderHook(() => useAiAgentCtas(props))

        const ctas = result.current.ctas as any
        const button = ctas.props.children[0]
        const canduElement = ctas.props.children[1]

        expect(button.props.children).toBe('Set Up AI Agent')
        expect(canduElement.props['data-candu-id']).toBe(
            'ai-agent-welcome-page',
        )
        expect(result.current.afterCtas).toBeUndefined()
    })

    it('returns SetupAIAgentButton with "Continue Setup" text when in update onboarding wizard', () => {
        const props = createDefaultProps({
            canStartOnboarding: true,
            isOnUpdateOnboardingWizard: true,
        })

        const { result } = renderHook(() => useAiAgentCtas(props))

        const ctas = result.current.ctas as any
        const button = ctas.props.children[0]

        expect(button.props.children).toBe('Continue Setup')
        expect(result.current.afterCtas).toBeUndefined()
    })

    it('returns SubscribeNowPrimary and LearnMore buttons during trial', () => {
        const props = createDefaultProps({
            isDuringOrAfterTrial: true,
        })

        const { result } = renderHook(() => useAiAgentCtas(props))

        const ctas = result.current.ctas as any
        const subscribeButton = ctas.props.children[0]
        const learnMoreButton = ctas.props.children[1]

        expect(subscribeButton.props.children).toBe('Subscribe now')
        expect(learnMoreButton.props.children).toBe('Learn more')
        expect(result.current.afterCtas).toBeUndefined()
    })

    it('returns TryForFree, SubscribeNowLink, and BookDemo for Pro+ Admin', () => {
        const props = createDefaultProps({
            canBookDemo: true,
            isAdmin: true,
        })

        const { result } = renderHook(() => useAiAgentCtas(props))

        const ctas = result.current.ctas as any
        const buttonsWrapper = ctas.props.children
        const tryForFreeButton = buttonsWrapper.props.children[0]
        const subscribeButton = buttonsWrapper.props.children[1]

        expect(tryForFreeButton.props.children).toBe('Try for free')
        expect(subscribeButton.props.children).toBe('Subscribe now')

        const afterCtas = result.current.afterCtas as any
        const bookDemoContainer = afterCtas.props.children
        expect(bookDemoContainer.type.name).toBe('BookDemoContainer')
    })

    it('returns NotifyAdmin, LearnMore, and BookDemo for Pro+ Lead', () => {
        const props = createDefaultProps({
            canBookDemo: true,
            canNotifyAdmin: true,
        })

        const { result } = renderHook(() => useAiAgentCtas(props))

        const ctas = result.current.ctas as any
        const buttonsWrapper = ctas.props.children
        const notifyAdminButton = buttonsWrapper.props.children[0]
        const learnMoreButton = buttonsWrapper.props.children[1]

        expect(notifyAdminButton.props.children).toBe('Notify admin')
        expect(learnMoreButton.props.children).toBe('Learn more')

        const afterCtas = result.current.afterCtas as any
        const bookDemoContainer = afterCtas.props.children
        expect(bookDemoContainer.type.name).toBe('BookDemoContainer')
    })

    it('returns NotifyAdmin with "Admin notified" text when notify admin is disabled', () => {
        const props = createDefaultProps({
            canBookDemo: true,
            canNotifyAdmin: true,
            isNotifyAdminDisabled: true,
        })

        const { result } = renderHook(() => useAiAgentCtas(props))

        const ctas = result.current.ctas as any
        const buttonsWrapper = ctas.props.children
        const notifyAdminButton = buttonsWrapper.props.children[0]

        expect(notifyAdminButton.props.children).toBe('Admin notified')
        expect(notifyAdminButton.props.isDisabled).toBe(true)
    })

    it('returns TryForFree and LearnMore for Basic/Starter Admin', () => {
        const props = createDefaultProps({
            canSeeTrial: true,
            isAdmin: true,
        })

        const { result } = renderHook(() => useAiAgentCtas(props))

        const ctas = result.current.ctas as any
        const tryForFreeButton = ctas.props.children[0]
        const learnMoreButton = ctas.props.children[1]

        expect(tryForFreeButton.props.children).toBe('Try for free')
        expect(learnMoreButton.props.children).toBe('Learn more')
        expect(result.current.afterCtas).toBeUndefined()
    })

    it('returns NotifyAdmin and LearnMore for Basic/Starter Lead', () => {
        const props = createDefaultProps({
            canNotifyAdmin: true,
        })

        const { result } = renderHook(() => useAiAgentCtas(props))

        const ctas = result.current.ctas as any
        const notifyAdminButton = ctas.props.children[0]
        const learnMoreButton = ctas.props.children[1]

        expect(notifyAdminButton.props.children).toBe('Notify admin')
        expect(learnMoreButton.props.children).toBe('Learn more')
        expect(result.current.afterCtas).toBeUndefined()
    })

    it('calls onOpenWizard when SetupAIAgentButton is clicked', () => {
        const onOpenWizard = jest.fn()
        const props = createDefaultProps({
            canStartOnboarding: true,
            onOpenWizard,
        })

        const { result } = renderHook(() => useAiAgentCtas(props))
        const ctas = result.current.ctas as any
        const button = ctas.props.children[0]

        button.props.onClick()

        expect(onOpenWizard).toHaveBeenCalled()
    })

    it('calls onOpenSubscribeModal when SubscribeNowPrimary is clicked', () => {
        const onOpenSubscribeModal = jest.fn()
        const props = createDefaultProps({
            isDuringOrAfterTrial: true,
            onOpenSubscribeModal,
        })

        const { result } = renderHook(() => useAiAgentCtas(props))
        const ctas = result.current.ctas as any
        const button = ctas.props.children[0]

        button.props.onClick()

        expect(onOpenSubscribeModal).toHaveBeenCalled()
    })

    it('calls onOpenTrialUpgradeModal when TryForFree is clicked', () => {
        const onOpenTrialUpgradeModal = jest.fn()
        const props = createDefaultProps({
            canSeeTrial: true,
            isAdmin: true,
            onOpenTrialUpgradeModal,
        })

        const { result } = renderHook(() => useAiAgentCtas(props))
        const ctas = result.current.ctas as any
        const button = ctas.props.children[0]

        button.props.onClick()

        expect(onOpenTrialUpgradeModal).toHaveBeenCalled()
    })

    it('calls onOpenTrialRequestModal when NotifyAdmin is clicked', () => {
        const onOpenTrialRequestModal = jest.fn()
        const props = createDefaultProps({
            canNotifyAdmin: true,
            onOpenTrialRequestModal,
        })

        const { result } = renderHook(() => useAiAgentCtas(props))
        const ctas = result.current.ctas as any
        const button = ctas.props.children[0]

        button.props.onClick()

        expect(onOpenTrialRequestModal).toHaveBeenCalled()
    })

    it('uses the correct learn more URL based on trial type', () => {
        const aiAgentUrl = EXTERNAL_URLS.AI_AGENT_TRIAL_LEARN_MORE_PAYWALL
        const shoppingAssistantUrl =
            EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE_PAYWALL

        // Test with AI Agent URL
        const propsWithAiAgentUrl = createDefaultProps({
            canNotifyAdmin: true,
            learnMoreUrl: aiAgentUrl,
        })

        const { result: resultWithAiAgentUrl } = renderHook(() =>
            useAiAgentCtas(propsWithAiAgentUrl),
        )
        const ctasWithAiAgentUrl = resultWithAiAgentUrl.current.ctas as any
        const learnMoreButtonWithAiAgentUrl =
            ctasWithAiAgentUrl.props.children[1]

        expect(learnMoreButtonWithAiAgentUrl.props.href).toBe(aiAgentUrl)

        // Test with Shopping Assistant URL
        const propsWithShoppingAssistantUrl = createDefaultProps({
            canNotifyAdmin: true,
            learnMoreUrl: shoppingAssistantUrl,
        })

        const { result: resultWithShoppingAssistantUrl } = renderHook(() =>
            useAiAgentCtas(propsWithShoppingAssistantUrl),
        )
        const ctasWithShoppingAssistantUrl = resultWithShoppingAssistantUrl
            .current.ctas as any
        const learnMoreButtonWithShoppingAssistantUrl =
            ctasWithShoppingAssistantUrl.props.children[1]

        expect(learnMoreButtonWithShoppingAssistantUrl.props.href).toBe(
            shoppingAssistantUrl,
        )
    })

    it('returns null ctas when no conditions match', () => {
        const props = createDefaultProps()

        const { result } = renderHook(() => useAiAgentCtas(props))

        expect(result.current.ctas).toBeNull()
        expect(result.current.afterCtas).toBeUndefined()

        // Check that modals are still rendered
        const modals = result.current.modals as any
        expect(modals.props.children.length).toBe(3)
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

    it('returns TryTrial and Upgrade Now for Has Automate plan Admin (Case 7)', () => {
        const onOpenTrialUpgradeModal = jest.fn()
        const onOpenUpgradePlanModal = jest.fn()
        const props = createDefaultProps({
            hasAutomate: true,
            canSeeTrial: true,
            isAdmin: true,
            onOpenTrialUpgradeModal,
            onOpenUpgradePlanModal,
        })

        const { result } = renderHook(() => useAiAgentCtas(props))

        const ctas = result.current.ctas as any
        const tryTrialButton = ctas.props.children[0]
        const upgradeNowWrapper = ctas.props.children[1]
        const upgradeNowButton = upgradeNowWrapper.props.children

        expect(tryTrialButton.props.children).toBe('Try for 14 days')
        expect(upgradeNowButton.props.children).toBe('Upgrade Now')
        expect(result.current.afterCtas).toBeUndefined()

        // click try trial button to test events on primary CTA
        tryTrialButton.props.onClick()

        expect(onOpenTrialUpgradeModal).toHaveBeenCalled()
        expect(mockLogInTrialEventFromPaywall).toHaveBeenCalledWith(
            TrialEventType.StartTrial,
            TrialType.ShoppingAssistant,
        )

        upgradeNowButton.props.onClick()

        expect(onOpenUpgradePlanModal).toHaveBeenCalledWith(false)
        expect(mockLogInTrialEventFromPaywall).toHaveBeenCalledWith(
            TrialEventType.UpgradePlan,
            TrialType.ShoppingAssistant,
        )
    })

    it('returns NotifyAdmin and StartAIAgentOnly for Has Automate plan Lead (Case 8)', () => {
        const onOpenWizard = jest.fn()
        const onOpenTrialRequestModal = jest.fn()
        const props = createDefaultProps({
            hasAutomate: true,
            canNotifyAdmin: true,
            onOpenTrialRequestModal,
            onOpenWizard,
        })

        const { result } = renderHook(() => useAiAgentCtas(props))

        const ctas = result.current.ctas as any
        const notifyAdminButton = ctas.props.children[0]
        const startAiAgentButton = ctas.props.children[1]

        expect(notifyAdminButton.props.children).toBe('Notify admin')
        expect(startAiAgentButton.props.children).toBe('Start AI Agent only')
        expect(result.current.afterCtas).toBeUndefined()

        // click notify admin button to test events on primary CTA
        notifyAdminButton.props.onClick()

        expect(onOpenTrialRequestModal).toHaveBeenCalled()
        expect(mockLogInTrialEventFromPaywall).toHaveBeenCalledWith(
            TrialEventType.NotifyAdmin,
            TrialType.ShoppingAssistant,
        )

        // click start AI Agent button to test events on secondary CTA
        startAiAgentButton.props.onClick()

        expect(onOpenWizard).toHaveBeenCalled()
    })
})
