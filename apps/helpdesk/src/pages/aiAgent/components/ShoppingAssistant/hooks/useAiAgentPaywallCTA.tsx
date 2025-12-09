import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import LinkButton from 'pages/common/components/button/LinkButton'
import RequestTrialModal from 'pages/common/components/RequestTrialModal/RequestTrialModal'
import TrialFinishSetupModal from 'pages/common/components/TrialFinishSetupModal/TrialFinishSetupModal'
import TrialTryModal from 'pages/common/components/TrialTryModal/TrialTryModal'

import { BookDemoContainer } from '../components'
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
    isAdmin: boolean
    learnMoreUrl: string

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

export type AiAgentCtas = {
    ctas: ReactNode
    modals: ReactNode
    afterCtas?: ReactNode
}

export const useAiAgentCtas = (props: AiAgentCtasParams): AiAgentCtas => {
    const {
        canStartOnboarding,
        hasAutomate,
        isDuringOrAfterTrial,
        canBookDemo,
        canNotifyAdmin,
        canSeeTrial,
        isAdmin,
        learnMoreUrl,
        onOpenWizard,
        onOpenSubscribeModal,
        onOpenTrialUpgradeModal,
        onOpenUpgradePlanModal,
        onOpenTrialRequestModal,
        onCloseTrialRequestModal,
        onCloseTrialFinishSetupModal,
        isNotifyAdminDisabled,
        trialModals,
        isOnUpdateOnboardingWizard,
    } = props

    const openDemoPage = useCallback(() => {
        window.open(EXTERNAL_URLS.BOOK_DEMO_AIAGENT, '_blank')
    }, [])

    const UpgradeNowSecondary = useMemo(
        () => (
            <>
                <Button
                    className={css.learnMoreButton}
                    fillStyle="ghost"
                    onClick={() => {
                        logInTrialEventFromPaywall(
                            TrialEventType.UpgradePlan,
                            hasAutomate
                                ? TrialType.ShoppingAssistant
                                : TrialType.AiAgent,
                        )
                        onOpenUpgradePlanModal(false)
                    }}
                >
                    Upgrade Now
                </Button>
            </>
        ),
        [onOpenUpgradePlanModal, hasAutomate],
    )
    const SetupAIAgentButton = useMemo(
        () => (
            <>
                <Button
                    intent="primary"
                    size="medium"
                    onClick={onOpenWizard}
                    trailingIcon={undefined}
                    className={css.upgradeButton}
                >
                    {isOnUpdateOnboardingWizard
                        ? 'Continue Setup'
                        : 'Set Up AI Agent'}
                </Button>
                <div data-candu-id="ai-agent-welcome-page" />
            </>
        ),
        [onOpenWizard, isOnUpdateOnboardingWizard],
    )

    const SubscribeNowPrimary = useMemo(
        () => (
            <Button
                intent="primary"
                size="medium"
                className={css.upgradeButton}
                onClick={() => {
                    logInTrialEventFromPaywall(
                        TrialEventType.UpgradePlan,
                        TrialType.AiAgent,
                    )
                    onOpenSubscribeModal()
                }}
            >
                Subscribe now
            </Button>
        ),
        [onOpenSubscribeModal],
    )

    const TryTrial = useMemo(
        () => (
            <Button
                size="medium"
                onClick={() => {
                    logInTrialEventFromPaywall(
                        TrialEventType.StartTrial,
                        hasAutomate
                            ? TrialType.ShoppingAssistant
                            : TrialType.AiAgent,
                    )
                    onOpenTrialUpgradeModal()
                }}
                className={css.upgradeButton}
            >
                {hasAutomate ? 'Try for 14 days' : 'Try for free'}
            </Button>
        ),
        [onOpenTrialUpgradeModal, hasAutomate],
    )

    const NotifyAdmin = useMemo(
        () => (
            <Button
                size="medium"
                onClick={() => {
                    logInTrialEventFromPaywall(
                        TrialEventType.NotifyAdmin,
                        hasAutomate
                            ? TrialType.ShoppingAssistant
                            : TrialType.AiAgent,
                    )
                    onOpenTrialRequestModal()
                }}
                className={!isNotifyAdminDisabled ? css.upgradeButton : ''}
                leadingIcon="notifications_none"
                isDisabled={isNotifyAdminDisabled}
            >
                {isNotifyAdminDisabled ? 'Admin notified' : 'Notify admin'}
            </Button>
        ),
        [onOpenTrialRequestModal, isNotifyAdminDisabled, hasAutomate],
    )

    const LearnMore = useMemo(
        () => (
            <LinkButton
                className={css.learnMoreButton}
                target="blank"
                fillStyle="ghost"
                href={learnMoreUrl}
                onClick={() => {
                    logInTrialEventFromPaywall(
                        TrialEventType.Learn,
                        TrialType.AiAgent,
                    )
                }}
            >
                Learn more
            </LinkButton>
        ),
        [learnMoreUrl],
    )

    const SubscribeNowLink = useMemo(
        () => (
            <LinkButton
                className={css.learnMoreButton}
                fillStyle="ghost"
                onClick={() => {
                    logInTrialEventFromPaywall(
                        TrialEventType.UpgradePlan,
                        hasAutomate
                            ? TrialType.ShoppingAssistant
                            : TrialType.AiAgent,
                    )
                    onOpenSubscribeModal()
                }}
            >
                Subscribe now
            </LinkButton>
        ),
        [onOpenSubscribeModal, hasAutomate],
    )

    const StartAIAgentOnly = useMemo(
        () => (
            <Button
                intent="secondary"
                size="medium"
                fillStyle="ghost"
                onClick={() => {
                    onOpenWizard()
                }}
            >
                Start AI Agent only
            </Button>
        ),
        [onOpenWizard],
    )

    const handleBookDemo = useCallback(() => {
        logInTrialEventFromPaywall(TrialEventType.Demo, TrialType.AiAgent)
        openDemoPage()
    }, [openDemoPage])

    const BookDemoComponent = useMemo(
        () => <BookDemoContainer onBookDemo={handleBookDemo} />,
        [handleBookDemo],
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
        // 1) onboarded, on Automate plan or trial expired
        if (canStartOnboarding) {
            return { ctas: SetupAIAgentButton }
        }

        // 2) During trial → Subscribe now + Learn more
        if (isDuringOrAfterTrial) {
            return {
                ctas: (
                    <>
                        {SubscribeNowPrimary}
                        {LearnMore}
                    </>
                ),
            }
        }

        // 3) Pro+ Admin: Try for free + Subscribe link + Book demo
        if (!hasAutomate && canBookDemo && isAdmin) {
            return {
                ctas: (
                    <>
                        <div className={css.welcomePageButtons}>
                            {TryTrial}
                            {SubscribeNowLink}
                        </div>
                    </>
                ),
                afterCtas: (
                    <div className={css.bookDemoButton}>
                        {BookDemoComponent}
                    </div>
                ),
            }
        }

        // 4) Pro+ Lead: Notify admin + Learn more + Book demo
        if (!hasAutomate && canBookDemo && canNotifyAdmin) {
            return {
                ctas: (
                    <>
                        <div className={css.welcomePageButtons}>
                            {NotifyAdmin}
                            {LearnMore}
                        </div>
                    </>
                ),
                afterCtas: (
                    <div className={css.bookDemoButton}>
                        {BookDemoComponent}
                    </div>
                ),
            }
        }

        // 5) Basic/Starter Admin: Try for free + Learn more
        if (!hasAutomate && canSeeTrial && isAdmin) {
            return {
                ctas: (
                    <>
                        {TryTrial}
                        {LearnMore}
                    </>
                ),
            }
        }

        // 6) Basic/Starter Lead: Notify admin + Learn more
        if (!hasAutomate && canNotifyAdmin) {
            return {
                ctas: (
                    <>
                        {NotifyAdmin}
                        {LearnMore}
                    </>
                ),
            }
        }

        // 7) Has Automate plan, no onboarding and Admin: Try for 14 days + Learn more
        if (canSeeTrial && isAdmin) {
            return {
                ctas: (
                    <>
                        {TryTrial}
                        {UpgradeNowSecondary}
                    </>
                ),
            }
        }

        // 8) Has Automate plan, no onboarding and Lead: Notify admin + Start AI Agent Only
        if (canNotifyAdmin) {
            return {
                ctas: (
                    <>
                        {NotifyAdmin}
                        {StartAIAgentOnly}
                    </>
                ),
            }
        }

        return { ctas: null }
    }, [
        canStartOnboarding,
        hasAutomate,
        isDuringOrAfterTrial,
        canBookDemo,
        canNotifyAdmin,
        canSeeTrial,
        isAdmin,
        SetupAIAgentButton,
        SubscribeNowPrimary,
        TryTrial,
        NotifyAdmin,
        LearnMore,
        SubscribeNowLink,
        BookDemoComponent,
        StartAIAgentOnly,
        UpgradeNowSecondary,
    ])

    return { ctas, modals, afterCtas }
}
