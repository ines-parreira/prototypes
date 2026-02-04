import type { ComponentProps, ReactNode } from 'react'
import { useMemo } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import LinkButton from 'pages/common/components/button/LinkButton'
import RequestTrialModal from 'pages/common/components/RequestTrialModal/RequestTrialModal'
import TrialFinishSetupModal from 'pages/common/components/TrialFinishSetupModal/TrialFinishSetupModal'
import TrialTryModal from 'pages/common/components/TrialTryModal/TrialTryModal'

import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from '../constants/shoppingAssistant'
import { TrialEventType, TrialType } from '../types/ShoppingAssistant'
import { logInTrialEventFromPaywall } from '../utils/eventLogger'

import css from './useAiAgentPaywallCTA.less'

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
    onOpenTrialUpgradeModal: () => void
    onOpenTrialRequestModal: () => void
    onOpenUpgradePlanModal: (isInTrial: boolean) => void
    onCloseTrialRequestModal: () => void
    onCloseTrialFinishSetupModal: () => void
    isNotifyAdminDisabled: boolean
    trialModals: {
        isTrialModalOpen: boolean
        newTrialUpgradePlanModal: any
        isTrialRequestModalOpen: boolean
        trialRequestModal: any
        isTrialFinishSetupModalOpen: boolean
        trialFinishSetupModal: any
    }
    isOnUpdateOnboardingWizard?: boolean
}

export type AIAgentCTAOptions = {
    label: string
    href?: ComponentProps<typeof LinkButton>['href']
    'data-candu-id'?: string
    leadingIcon?: ComponentProps<typeof Button>['leadingIcon']
    isDisabled?: ComponentProps<typeof Button>['isDisabled']
    onClick?: () => void
}

export type AiAgentCtas = {
    ctas: ReactNode
    modals: ReactNode
    afterCtas?: ReactNode
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
        onOpenTrialUpgradeModal,
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
                onOpenTrialUpgradeModal()
            },
        }),
        [onOpenTrialUpgradeModal, hasAutomate],
    )

    const NotifyAdminAction = useMemo(
        (): AIAgentCTAOptions => ({
            label: isNotifyAdminDisabled ? 'Admin notified' : 'Notify admin',
            leadingIcon: 'notifications_none',
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
            onClick: () => {
                logInTrialEventFromPaywall(
                    TrialEventType.Demo,
                    hasAutomate
                        ? TrialType.ShoppingAssistant
                        : TrialType.AiAgent,
                )

                window.open(
                    hasAutomate
                        ? EXTERNAL_URLS.BOOK_DEMO_SHOPPING_ASSISTANT
                        : EXTERNAL_URLS.BOOK_DEMO_AIAGENT,
                    '_blank',
                )
            },
        }),
        [hasAutomate],
    )

    const modals = useMemo(
        () => (
            <>
                <TrialTryModal
                    {...trialModals.newTrialUpgradePlanModal}
                    isOpen={trialModals.isTrialModalOpen}
                />
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

    const { ctas, afterCtas } = useMemo(() => {
        const actionsOrderedByPriority: (AIAgentCTAOptions | null)[] = []

        // If onboarding is possible, anyone can start it and that's the only option we allow
        if (canStartOnboarding) {
            actionsOrderedByPriority.push(SetupAIAgentAction)
        } else if (!isAdmin) {
            // If the non-admin user cannot notify an admin, show nothing
            if (!canNotifyAdmin) {
                return { ctas: null }
            }

            actionsOrderedByPriority.push(
                NotifyAdminAction,
                canBookDemo ? BookDemoAction : LearnMoreAction,
                canBookDemo ? LearnMoreAction : null,
            )
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

        return {
            ctas: (
                <>
                    <div className={css.ctaButtons}>
                        {
                            <>
                                {filteredActions[0].href === undefined ? (
                                    <Button
                                        className={
                                            filteredActions[0].isDisabled
                                                ? ''
                                                : css.primaryButton
                                        }
                                        intent="primary"
                                        size="medium"
                                        onClick={filteredActions[0].onClick}
                                        leadingIcon={
                                            filteredActions[0].leadingIcon
                                        }
                                        isDisabled={
                                            filteredActions[0].isDisabled
                                        }
                                    >
                                        {filteredActions[0].label}
                                    </Button>
                                ) : (
                                    // Edge case - LearnMore as primary needs href
                                    // Button doesn't support href
                                    // LinkButton doesn't support leadingIcon
                                    <LinkButton
                                        className={css.primaryButton}
                                        intent="primary"
                                        size="medium"
                                        onClick={filteredActions[0].onClick}
                                        href={filteredActions[0].href}
                                    >
                                        {filteredActions[0].label}
                                    </LinkButton>
                                )}
                                <div
                                    data-candu-id={
                                        filteredActions[0]['data-candu-id']
                                    }
                                />
                            </>
                        }
                        {filteredActions[1] ? (
                            <LinkButton
                                className={css.secondaryButton}
                                fillStyle="ghost"
                                onClick={filteredActions[1].onClick}
                                href={filteredActions[1].href}
                                isDisabled={filteredActions[1].isDisabled}
                            >
                                {filteredActions[1].label}
                            </LinkButton>
                        ) : null}
                    </div>
                </>
            ),
            afterCtas: filteredActions[2] ? (
                <>
                    <div className={css.tertiaryButton}>
                        <div className={css.tertiaryContainer}>
                            <LinkButton
                                className={css.tertiaryContainerButton}
                                fillStyle="ghost"
                                intent="secondary"
                                size="medium"
                                href={filteredActions[2].href}
                                onClick={filteredActions[2].onClick}
                                isDisabled={filteredActions[2].isDisabled}
                            >
                                <span className={css.tertiaryButtonText}>
                                    {filteredActions[2].label}
                                </span>
                            </LinkButton>
                        </div>
                    </div>
                </>
            ) : null,
        }
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

    return { ctas, modals, afterCtas }
}
