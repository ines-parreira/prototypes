import { ReactNode, useCallback, useMemo } from 'react'

import { Button } from '@gorgias/axiom'

import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import LinkButton from 'pages/common/components/button/LinkButton'
import RequestTrialModal from 'pages/common/components/RequestTrialModal/RequestTrialModal'
import TrialTryModal from 'pages/common/components/TrialTryModal/TrialTryModal'

import { TrialEventType, TrialType } from '../types/ShoppingAssistant'
import { logInTrialEventFromPaywall } from '../utils/eventLogger'

import css from './useAiAgentPaywallCTA.less'

export type AiAgentCtasParams = {
    isBackwardCompatOrAutomatePlan: boolean
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
    onCloseTrialRequestModal: () => void
    isNotifyAdminDisabled: boolean
    trialModals: {
        isTrialModalOpen: boolean
        newTrialUpgradePlanModal: any
        isTrialRequestModalOpen: boolean
        trialRequestModal: any
    }

    showAutoAwesomeIcon?: boolean
    isOnUpdateOnboardingWizard?: boolean
}

export type AiAgentCtas = {
    ctas: ReactNode
    modals: ReactNode
    afterCtas?: ReactNode
}

export const useAiAgentCtas = (props: AiAgentCtasParams): AiAgentCtas => {
    const {
        isBackwardCompatOrAutomatePlan,
        isDuringOrAfterTrial,
        canBookDemo,
        canNotifyAdmin,
        canSeeTrial,
        isAdmin,
        learnMoreUrl,
        onOpenWizard,
        onOpenSubscribeModal,
        onOpenTrialUpgradeModal,
        onOpenTrialRequestModal,
        onCloseTrialRequestModal,
        isNotifyAdminDisabled,
        trialModals,
        showAutoAwesomeIcon,
        isOnUpdateOnboardingWizard,
    } = props

    const openDemoPage = useCallback(() => {
        window.open(EXTERNAL_URLS.BOOK_DEMO_PAYWALL, '_blank')
    }, [])

    const SetupAIAgentButton = useMemo(
        () => (
            <>
                <Button
                    intent="primary"
                    size="medium"
                    onClick={onOpenWizard}
                    trailingIcon={
                        showAutoAwesomeIcon ? 'auto_awesome' : undefined
                    }
                    className={showAutoAwesomeIcon ? '' : css.upgradeButton}
                >
                    {isOnUpdateOnboardingWizard
                        ? 'Continue Setup'
                        : 'Set Up AI Agent'}
                </Button>
                <div data-candu-id="ai-agent-welcome-page" />
            </>
        ),
        [onOpenWizard, showAutoAwesomeIcon, isOnUpdateOnboardingWizard],
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

    const TryForFree = useMemo(
        () => (
            <Button
                size="medium"
                onClick={() => {
                    logInTrialEventFromPaywall(
                        TrialEventType.StartTrial,
                        TrialType.AiAgent,
                    )
                    onOpenTrialUpgradeModal()
                }}
                className={css.upgradeButton}
            >
                Try for free
            </Button>
        ),
        [onOpenTrialUpgradeModal],
    )

    const NotifyAdmin = useMemo(
        () => (
            <Button
                size="medium"
                onClick={() => {
                    logInTrialEventFromPaywall(
                        TrialEventType.NotifyAdmin,
                        TrialType.AiAgent,
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
        [onOpenTrialRequestModal, isNotifyAdminDisabled],
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
                        TrialType.AiAgent,
                    )
                    onOpenSubscribeModal()
                }}
            >
                Subscribe now
            </LinkButton>
        ),
        [onOpenSubscribeModal],
    )

    const BookDemo = useMemo(
        () => (
            <Button
                fillStyle="ghost"
                intent="secondary"
                size="medium"
                onClick={() => {
                    logInTrialEventFromPaywall(
                        TrialEventType.Demo,
                        TrialType.AiAgent,
                    )
                    openDemoPage()
                }}
            >
                Let’s Talk?
                <span className={css.bookDemoButtonText}>Book a demo</span>
            </Button>
        ),
        [openDemoPage],
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
            </>
        ),
        [trialModals, onCloseTrialRequestModal],
    )

    const { ctas, afterCtas } = useMemo(() => {
        // 1) Back-compat OR already on Automate plan
        if (isBackwardCompatOrAutomatePlan) {
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
        if (canBookDemo && isAdmin) {
            return {
                ctas: (
                    <>
                        <div className={css.welcomePageButtons}>
                            {TryForFree}
                            {SubscribeNowLink}
                        </div>
                    </>
                ),
                afterCtas: <div className={css.bookDemoButton}>{BookDemo}</div>,
            }
        }

        // 4) Pro+ Lead: Notify admin + Learn more + Book demo
        if (canBookDemo && canNotifyAdmin) {
            return {
                ctas: (
                    <>
                        <div className={css.welcomePageButtons}>
                            {NotifyAdmin}
                            {LearnMore}
                        </div>
                    </>
                ),
                afterCtas: <div className={css.bookDemoButton}>{BookDemo}</div>,
            }
        }

        // 5) Basic/Starter Admin: Try for free + Learn more
        if (canSeeTrial && isAdmin) {
            return {
                ctas: (
                    <>
                        {TryForFree}
                        {LearnMore}
                    </>
                ),
            }
        }

        // 6) Basic/Starter Lead: Notify admin + Learn more
        if (canNotifyAdmin) {
            return {
                ctas: (
                    <>
                        {NotifyAdmin}
                        {LearnMore}
                    </>
                ),
            }
        }

        return { ctas: null }
    }, [
        isBackwardCompatOrAutomatePlan,
        isDuringOrAfterTrial,
        canBookDemo,
        canNotifyAdmin,
        canSeeTrial,
        isAdmin,
        SetupAIAgentButton,
        SubscribeNowPrimary,
        TryForFree,
        NotifyAdmin,
        LearnMore,
        SubscribeNowLink,
        BookDemo,
    ])

    return { ctas, modals, afterCtas }
}
