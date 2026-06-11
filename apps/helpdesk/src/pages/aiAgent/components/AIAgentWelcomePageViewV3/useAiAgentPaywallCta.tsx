/**
 * V3 copy of V2's `useAiAgentCtas` (ShoppingAssistant/hooks/useAiAgentPaywallCTA).
 * Cohort logic must stay in sync with V2 — the parity contract is asserted by
 * `../AIAgentWelcomePageView/paywallCohortParity.spec.tsx`. V3 owns its own
 * rendering (axiom Button instead of LegacyButton + ghost LinkButton).
 */
import type { ComponentProps, ReactNode } from 'react'
import { useMemo } from 'react'

import { Box, Button, Icon } from '@gorgias/axiom'

import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from 'pages/aiAgent/components/ShoppingAssistant/constants/shoppingAssistant'
import {
    TrialEventType,
    TrialType,
} from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { logInTrialEventFromPaywall } from 'pages/aiAgent/components/ShoppingAssistant/utils/eventLogger'
import type { TrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { RequestTrialModal } from 'pages/common/components/RequestTrialModal/RequestTrialModal'
import { TrialFinishSetupModal } from 'pages/common/components/TrialFinishSetupModal/TrialFinishSetupModal'

export type AiAgentCtasParams = {
    canStartOnboarding: boolean
    hasAutomate: boolean
    isDuringOrAfterTrial: boolean
    canBookDemo: boolean
    canNotifyAdmin: boolean
    canSeeTrial: boolean
    canSeeSubscribeNow: boolean
    isAdmin: boolean
    learnMoreUrl: string
    isOnboarded: boolean
    onOpenWizard: () => void
    onOpenSubscribeModal: () => void
    onOpenTrialRequestModal: () => void
    onOpenUpgradePlanModal: (isInTrial: boolean) => void
    onCloseTrialRequestModal: () => void
    onCloseTrialFinishSetupModal: () => void
    isNotifyAdminDisabled: boolean
    trialModals: {
        isTrialRequestModalOpen: boolean
        trialRequestModal: TrialModalProps['trialRequestModal']
        isTrialFinishSetupModalOpen: boolean
        trialFinishSetupModal: TrialModalProps['trialFinishSetupModal']
    }
    isOnUpdateOnboardingWizard?: boolean
}

export type AIAgentCTAOptions = {
    label: string
    href?: string
    target?: string
    rel?: string
    'data-candu-id'?: string
    leadingSlot?: ComponentProps<typeof Button>['leadingSlot']
    isDisabled?: ComponentProps<typeof Button>['isDisabled']
    onClick?: () => void
}

export type AiAgentCtas = {
    ctas: ReactNode
    modals: ReactNode
}

export const useAiAgentCtas = (props: AiAgentCtasParams): AiAgentCtas => {
    const {
        canStartOnboarding,
        hasAutomate,
        canBookDemo,
        canNotifyAdmin,
        canSeeTrial,
        canSeeSubscribeNow,
        isAdmin,
        learnMoreUrl,
        isOnboarded,
        onOpenWizard,
        onOpenSubscribeModal,
        onOpenTrialRequestModal,
        onCloseTrialRequestModal,
        onCloseTrialFinishSetupModal,
        isNotifyAdminDisabled,
        trialModals,
        isOnUpdateOnboardingWizard,
    } = props

    const SetupAIAgentAction = useMemo(
        (): AIAgentCTAOptions => ({
            label: isOnUpdateOnboardingWizard
                ? 'Continue Setup'
                : 'Set Up AI Agent',
            'data-candu-id': 'ai-agent-welcome-page',
            onClick: onOpenWizard,
        }),
        [onOpenWizard, isOnUpdateOnboardingWizard],
    )

    const SubscribeNowAction = useMemo(
        (): AIAgentCTAOptions => ({
            label: hasAutomate ? 'Upgrade now' : 'Subscribe now',
            onClick: () => {
                logInTrialEventFromPaywall(
                    TrialEventType.UpgradePlan,
                    hasAutomate
                        ? TrialType.ShoppingAssistant
                        : TrialType.AiAgent,
                )
                onOpenSubscribeModal()
            },
        }),
        [hasAutomate, onOpenSubscribeModal],
    )

    const TryTrialAction = useMemo(
        (): AIAgentCTAOptions => ({
            label: hasAutomate
                ? `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`
                : 'Try for free',
            onClick: () => {
                logInTrialEventFromPaywall(
                    TrialEventType.StartTrial,
                    hasAutomate
                        ? TrialType.ShoppingAssistant
                        : TrialType.AiAgent,
                )
                onOpenWizard()
            },
        }),
        [onOpenWizard, hasAutomate],
    )

    const NotifyAdminAction = useMemo(
        (): AIAgentCTAOptions => ({
            label: isNotifyAdminDisabled ? 'Admin notified' : 'Notify admin',
            leadingSlot: <Icon name="bell" />,
            isDisabled: isNotifyAdminDisabled,
            onClick: () => {
                logInTrialEventFromPaywall(
                    TrialEventType.NotifyAdmin,
                    hasAutomate
                        ? TrialType.ShoppingAssistant
                        : TrialType.AiAgent,
                )
                onOpenTrialRequestModal()
            },
        }),
        [onOpenTrialRequestModal, isNotifyAdminDisabled, hasAutomate],
    )

    const LearnMoreAction = useMemo(
        (): AIAgentCTAOptions => ({
            label: 'Learn more',
            href: learnMoreUrl,
            target: '_blank',
            rel: 'noopener noreferrer',
            onClick: () => {
                logInTrialEventFromPaywall(
                    TrialEventType.Learn,
                    hasAutomate
                        ? TrialType.ShoppingAssistant
                        : TrialType.AiAgent,
                )
            },
        }),
        [hasAutomate, learnMoreUrl],
    )

    const StartAIAgentAction = useMemo(
        (): AIAgentCTAOptions => ({
            label: 'Start AI Agent only',
            onClick: onOpenWizard,
        }),
        [onOpenWizard],
    )

    const BookDemoAction = useMemo(
        (): AIAgentCTAOptions => ({
            label: 'Book a demo',
            href: hasAutomate
                ? EXTERNAL_URLS.BOOK_DEMO_SHOPPING_ASSISTANT
                : EXTERNAL_URLS.BOOK_DEMO_AIAGENT,
            target: '_blank',
            rel: 'noopener noreferrer',
            onClick: () => {
                logInTrialEventFromPaywall(
                    TrialEventType.Demo,
                    hasAutomate
                        ? TrialType.ShoppingAssistant
                        : TrialType.AiAgent,
                )
            },
        }),
        [hasAutomate],
    )

    const modals = useMemo(
        () => (
            <>
                <RequestTrialModal
                    {...trialModals.trialRequestModal}
                    isOpen={trialModals.isTrialRequestModalOpen}
                    onClose={onCloseTrialRequestModal}
                />
                <TrialFinishSetupModal
                    {...trialModals.trialFinishSetupModal}
                    isOpen={trialModals.isTrialFinishSetupModalOpen}
                    onClose={onCloseTrialFinishSetupModal}
                />
            </>
        ),
        [trialModals, onCloseTrialRequestModal, onCloseTrialFinishSetupModal],
    )

    const ctas = useMemo(() => {
        const actionsOrderedByPriority: (AIAgentCTAOptions | null)[] = []

        // If onboarding is possible, anyone can start it and that's the only option we allow
        if (canStartOnboarding) {
            actionsOrderedByPriority.push(SetupAIAgentAction)
        } else if (!isAdmin) {
            // If the non-admin user cannot notify an admin, show nothing
            if (!canNotifyAdmin) {
                return null
            }

            actionsOrderedByPriority.push(
                NotifyAdminAction,
                canBookDemo ? BookDemoAction : LearnMoreAction,
                canBookDemo ? LearnMoreAction : null,
            )
        } else if (hasAutomate && canSeeTrial && !isOnboarded) {
            // §5 collapse (CRMGROW-3797): USD-5 trial-eligible admins on a
            // not-yet-onboarded store get a single "Set Up AI Agent" CTA that
            // routes through the wizard. Trial opt-in is offered afterwards
            // via TrialOptInBanner → TrialActivationModal.
            actionsOrderedByPriority.push(SetupAIAgentAction)
        } else {
            // Only admins can self serve, but not all merchants can
            const selfService = canSeeSubscribeNow
                ? SubscribeNowAction
                : canSeeTrial
                  ? TryTrialAction
                  : null

            // Not all merchants can book demos
            const bookADemo = canBookDemo ? BookDemoAction : null

            // Learn more is always shown for AI Agent, but for Shopping Assistant
            // there isn't enough space, so it is only shown if the user can't
            // both self serve and book a demo
            const learnMore = !hasAutomate
                ? LearnMoreAction
                : (canSeeSubscribeNow || canSeeTrial) && canBookDemo
                  ? null
                  : LearnMoreAction

            // Show "Start AI Agent only" if merchant has AI Agent subscription
            // but hasn't onboarded it yet on the current store
            const startAIAgent =
                hasAutomate && !isOnboarded ? StartAIAgentAction : null

            actionsOrderedByPriority.push(
                selfService,
                bookADemo,
                learnMore,
                startAIAgent,
            )
        }

        // Actions are ordered but can be null, filter the nulls out
        const filteredActions: AIAgentCTAOptions[] =
            actionsOrderedByPriority.filter(Boolean) as AIAgentCTAOptions[]

        const primary = filteredActions[0]
        if (!primary) return null

        return (
            <Box gap="xs">
                {primary.href === undefined ? (
                    <Button
                        variant="primary"
                        size="md"
                        onClick={primary.onClick}
                        leadingSlot={primary.leadingSlot}
                        isDisabled={primary.isDisabled}
                        data-candu-id={primary['data-candu-id']}
                    >
                        {primary.label}
                    </Button>
                ) : (
                    <Button
                        as="a"
                        variant="primary"
                        size="md"
                        onClick={primary.onClick}
                        href={primary.href}
                        target={primary.target}
                        rel={primary.rel}
                        data-candu-id={primary['data-candu-id']}
                    >
                        {primary.label}
                    </Button>
                )}
                {filteredActions.slice(1).map((action, index) =>
                    action.href !== undefined ? (
                        <Button
                            as="a"
                            key={`${action.label}-${index}`}
                            variant="secondary"
                            onClick={action.onClick}
                            href={action.href}
                            target={action.target}
                            rel={action.rel}
                            isDisabled={action.isDisabled}
                        >
                            {action.label}
                        </Button>
                    ) : (
                        <Button
                            key={`${action.label}-${index}`}
                            variant="secondary"
                            onClick={action.onClick}
                            isDisabled={action.isDisabled}
                        >
                            {action.label}
                        </Button>
                    ),
                )}
            </Box>
        )
    }, [
        canStartOnboarding,
        hasAutomate,
        canBookDemo,
        canNotifyAdmin,
        canSeeTrial,
        canSeeSubscribeNow,
        isAdmin,
        isOnboarded,
        SetupAIAgentAction,
        SubscribeNowAction,
        TryTrialAction,
        NotifyAdminAction,
        LearnMoreAction,
        BookDemoAction,
        StartAIAgentAction,
    ])

    return { ctas, modals }
}
