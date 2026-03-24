import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useHistory } from 'react-router-dom'

import { AiAgentNotificationType } from 'automate/notifications/types'
import type {
    OnboardingNotificationState,
    StoreConfiguration,
} from 'models/aiAgent/types'
import { AiAgentOnboardingState } from 'models/aiAgent/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { useAiAgentCtas } from 'pages/aiAgent/components/ShoppingAssistant/hooks/useAiAgentPaywallCTA'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { WIZARD_UPDATE_QUERY_KEY } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import {
    OnboardingState,
    useAiAgentOnboardingState,
} from 'pages/aiAgent/hooks/useAiAgentOnboardingState'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding_V2/types'
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useNotifyAdmins } from 'pages/aiAgent/trial/hooks/useNotifyAdmins'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import {
    EXTERNAL_URLS,
    useTrialModalProps,
} from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'
import { hasAutomatePlanAboveGen6 } from 'pages/aiAgent/utils/trial.utils'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'

export type DynamicItem = {
    checked: boolean
    link?: string
}

export type AiAgentWelcomePageProps = {
    accountDomain: string
    shopType: string
    shopName: string
    storeConfiguration?: StoreConfiguration
}

export const AIAgentWelcomePageView = (props: AiAgentWelcomePageProps) => {
    const {
        isAdmin,
        isLoading: isLoadingOnboardingNotificationState,
        onboardingNotificationState,
        handleOnSave,
        handleOnSendOrCancelNotification,
        handleOnPerformActionPostReceivedNotification,
        isAiAgentOnboardingNotificationEnabled,
    } = useAiAgentOnboardingNotification({ shopName: props.shopName })

    const isOnStorePage =
        extractShopNameFromUrl(window.location.href) === props.shopName
    const onboardingState = useAiAgentOnboardingState(props.shopName)

    const trialAccess = useTrialAccess(props.shopName)
    const isAiAgentTrial = trialAccess.trialType === TrialType.AiAgent

    const trialModalProps = useTrialModalProps({
        storeName: props.shopName,
    })

    const { storeActivations } = useStoreActivations({
        storeName: props.shopName,
        withChatIntegrationsStatus: true,
        withStoresKnowledgeStatus: true,
    })

    const trialFlow = useShoppingAssistantTrialFlow({
        accountDomain: props.accountDomain,
        storeActivations,
        trialType: trialAccess.trialType,
    })

    const history = useHistory()
    const sameVisitRef = useRef(false)

    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)

    const isOnUpdateOnboardingWizard =
        props.storeConfiguration?.wizard?.completedDatetime === null

    const aiAgentNavigation = useAiAgentNavigation({ shopName: props.shopName })

    const handleOnFinishSetupNotification = useCallback(async () => {
        const isFinishedSetupNotificationAlreadyReceived =
            !!onboardingNotificationState?.finishAiAgentSetupNotificationReceivedDatetime

        if (!isFinishedSetupNotificationAlreadyReceived) {
            handleOnSendOrCancelNotification({
                aiAgentNotificationType:
                    AiAgentNotificationType.FinishAiAgentSetup,
            })
        }

        if (isOnUpdateOnboardingWizard) return

        handleOnSendOrCancelNotification({
            aiAgentNotificationType: AiAgentNotificationType.StartAiAgentSetup,
            isCancel: true,
        })

        await handleOnSave({
            onboardingState: AiAgentOnboardingState.StartedSetup,
        })

        handleOnPerformActionPostReceivedNotification(
            AiAgentNotificationType.StartAiAgentSetup,
        )
    }, [
        handleOnSave,
        handleOnSendOrCancelNotification,
        handleOnPerformActionPostReceivedNotification,
        isOnUpdateOnboardingWizard,
        onboardingNotificationState?.finishAiAgentSetupNotificationReceivedDatetime,
    ])

    useEffectOnce(() => {
        logEvent(SegmentEvent.AiAgentNewOnboardingWizardPaywallPageViewed, {
            shopName: props.shopName,
        })
    })

    const { isDisabled: isNotifyAdminDisabled } = useNotifyAdmins(
        props.shopName,
        trialAccess.trialType,
    )

    const onOnboardingWizardClick = useCallback(() => {
        if (isAdmin) {
            void handleOnFinishSetupNotification()
        }

        logEvent(SegmentEvent.AiAgentWelcomePageCtaClicked, {
            version: 'Dynamic',
            store: props.shopName,
        })

        const path = aiAgentNavigation.routes.onboardingWizardStep(
            WizardStepEnum.TONE_OF_VOICE,
        )

        history.push({
            pathname: path,
            search: isOnUpdateOnboardingWizard
                ? `?${WIZARD_UPDATE_QUERY_KEY}=true`
                : '',
        })
    }, [
        aiAgentNavigation.routes,
        handleOnFinishSetupNotification,
        history,
        isAdmin,
        isOnUpdateOnboardingWizard,
        props.shopName,
    ])

    /*
     *  We need to open back the onboarding wizard if the trial is currently active and onboarding not completed - it is a required step to continue with trial.
     */
    useEffect(() => {
        if (!isOnStorePage || onboardingState === OnboardingState.Loading)
            return

        const requiresOnboardingWizard =
            onboardingState === OnboardingState.OnboardingWizard &&
            trialAccess.isInAiAgentTrial &&
            !trialFlow.isTrialFinishSetupModalOpen // to prevent immediate redirect that blocks this modal to be displayed

        if (requiresOnboardingWizard) {
            onOnboardingWizardClick()
        }
    }, [
        isOnStorePage,
        onboardingState,
        props.shopName,
        trialAccess.isInAiAgentTrial,
        trialFlow.isTrialFinishSetupModalOpen,
        onOnboardingWizardClick,
    ])

    useEffect(() => {
        logEvent(SegmentEvent.AiAgentWelcomePageViewed, {
            version: 'Basic',
            store: props.shopName,
        })

        if (trialAccess.canSeeTrialCTA) {
            logEvent(SegmentEvent.TrialLinkPaywallViewed, {
                trialType: TrialType.AiAgent,
            })
        }
    }, [props.shopName, trialAccess.canSeeTrialCTA])

    const handleOnStartSetupNotification = useCallback(async () => {
        const isStartedSetup =
            onboardingNotificationState?.onboardingState ===
            AiAgentOnboardingState.StartedSetup

        const isStartedSetupNotificationAlreadyReceived =
            !!onboardingNotificationState?.startAiAgentSetupNotificationReceivedDatetime

        if (
            sameVisitRef.current ||
            isStartedSetup ||
            isStartedSetupNotificationAlreadyReceived
        )
            return

        sameVisitRef.current = true

        handleOnSendOrCancelNotification({
            aiAgentNotificationType: AiAgentNotificationType.MeetAiAgent,
            isCancel: true,
        })

        const isFirstVisit =
            !onboardingNotificationState?.welcomePageVisitedDatetimes &&
            !onboardingNotificationState?.welcomePageVisitedDatetimes?.length

        if (isFirstVisit) {
            handleOnPerformActionPostReceivedNotification(
                AiAgentNotificationType.MeetAiAgent,
            )
        }

        let payload: Partial<OnboardingNotificationState> = {}
        if (isOnUpdateOnboardingWizard) {
            payload = {
                onboardingState: AiAgentOnboardingState.StartedSetup,
            }
        } else {
            payload = {
                onboardingState: AiAgentOnboardingState.VisitedAiAgent,
                welcomePageVisitedDatetimes: onboardingNotificationState
                    ? [
                          ...onboardingNotificationState.welcomePageVisitedDatetimes,
                          new Date().toISOString(),
                      ]
                    : [new Date().toISOString()],
            }
        }
        const updatedOnboardingNotificationState = await handleOnSave(payload)

        if (
            updatedOnboardingNotificationState?.welcomePageVisitedDatetimes &&
            updatedOnboardingNotificationState.welcomePageVisitedDatetimes
                .length >= 3
        ) {
            handleOnSendOrCancelNotification({
                aiAgentNotificationType:
                    AiAgentNotificationType.StartAiAgentSetup,
            })
        }
    }, [
        handleOnSave,
        handleOnSendOrCancelNotification,
        handleOnPerformActionPostReceivedNotification,
        isOnUpdateOnboardingWizard,
        onboardingNotificationState,
    ])

    useEffect(() => {
        if (
            isLoadingOnboardingNotificationState ||
            !isAdmin ||
            !isAiAgentOnboardingNotificationEnabled
        )
            return

        void handleOnStartSetupNotification()
    }, [
        handleOnStartSetupNotification,
        isAdmin,
        isAiAgentOnboardingNotificationEnabled,
        isLoadingOnboardingNotificationState,
    ])

    const hasAutomate = !!trialAccess.currentAutomatePlan
    const canStartOnboarding =
        (trialAccess.hasCurrentStoreTrialExpired ||
            trialAccess.isTrialingSubscription ||
            hasAutomatePlanAboveGen6(trialAccess.currentAutomatePlan)) &&
        !trialAccess.isOnboarded

    const isDuringOrAfterTrial =
        trialAccess.hasCurrentStoreTrialStarted ||
        trialAccess.hasCurrentStoreTrialExpired ||
        trialAccess.hasCurrentStoreTrialOptedOut

    const canBookDemo = trialAccess.canBookDemo
    const canNotifyAdmin = trialAccess.canNotifyAdmin
    const canSeeTrial = trialAccess.canSeeTrialCTA
    const canSeeSubscribeNow = trialAccess.canSeeSubscribeNowCTA

    const learnMoreUrl = isAiAgentTrial
        ? EXTERNAL_URLS.AI_AGENT_TRIAL_LEARN_MORE_PAYWALL
        : EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE_PAYWALL

    const { ctas, modals, afterCtas } = useAiAgentCtas({
        canStartOnboarding,
        hasAutomate,
        isDuringOrAfterTrial,
        canBookDemo,
        canNotifyAdmin,
        canSeeTrial,
        canSeeSubscribeNow,
        isAdmin,
        learnMoreUrl,
        isOnboarded: !!trialAccess.isOnboarded,
        onOpenWizard: onOnboardingWizardClick,
        onOpenSubscribeModal: () => setIsAutomationModalOpened(true),
        onOpenTrialUpgradeModal: trialFlow.openTrialUpgradeModal,
        onOpenTrialRequestModal: trialFlow.openTrialRequestModal,
        onOpenUpgradePlanModal: trialFlow.openUpgradePlanModal,
        onCloseTrialRequestModal: trialFlow.closeTrialRequestModal,
        onCloseTrialFinishSetupModal: trialFlow.closeTrialFinishSetupModal,
        isNotifyAdminDisabled,
        trialModals: {
            isTrialModalOpen: trialFlow.isTrialModalOpen,
            newTrialUpgradePlanModal: trialModalProps.newTrialUpgradePlanModal,
            isTrialRequestModalOpen: trialFlow.isTrialRequestModalOpen,
            trialRequestModal: trialModalProps.trialRequestModal,
            isTrialFinishSetupModalOpen: trialFlow.isTrialFinishSetupModalOpen,
            trialFinishSetupModal: trialModalProps.trialFinishSetupModal,
        },
        isOnUpdateOnboardingWizard,
    })

    const paywallFeature = useMemo(
        () =>
            isAiAgentTrial || canStartOnboarding
                ? AIAgentPaywallFeatures.TrialSetup
                : AIAgentPaywallFeatures.ShoppingAssistantTrialSetup,
        [isAiAgentTrial, canStartOnboarding],
    )

    return (
        <AiAgentPaywallView aiAgentPaywallFeature={paywallFeature}>
            {ctas}
            {afterCtas}
            {modals}

            {trialModalProps.upgradePlanModal.isOpen && (
                <UpgradePlanModal {...trialModalProps.upgradePlanModal} />
            )}

            <AutomateSubscriptionModal
                confirmLabel="Subscribe"
                isOpen={isAutomationModalOpened}
                onClose={() => setIsAutomationModalOpened(false)}
            />
        </AiAgentPaywallView>
    )
}
