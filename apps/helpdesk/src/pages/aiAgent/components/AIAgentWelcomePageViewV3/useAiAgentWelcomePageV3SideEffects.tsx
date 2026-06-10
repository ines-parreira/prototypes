import { useCallback, useEffect, useMemo, useRef } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useHistory, useLocation } from 'react-router-dom'
import { useEffectOnce } from '@gorgias/toolkit-react'

import { AiAgentNotificationType } from 'automate/notifications/types'
import type {
    OnboardingNotificationState,
    StoreConfiguration,
} from 'models/aiAgent/types'
import { AiAgentOnboardingState } from 'models/aiAgent/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { WIZARD_UPDATE_QUERY_KEY } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import {
    OnboardingState,
    useAiAgentOnboardingState,
} from 'pages/aiAgent/hooks/useAiAgentOnboardingState'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding_V2/types'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'
import { hasAutomatePlanAboveGen6 } from 'pages/aiAgent/utils/trial.utils'

const WELCOME_PAGE_VERSION = 'V3'

type Params = {
    shopName: string
    storeConfiguration?: StoreConfiguration
    isTrialFinishSetupModalOpen: boolean
}

type Result = {
    onCtaTransition: (extraSearchParams?: Record<string, string>) => void
    isOnUpdateOnboardingWizard: boolean
}

export const useAiAgentWelcomePageV3SideEffects = ({
    shopName,
    storeConfiguration,
    isTrialFinishSetupModalOpen,
}: Params): Result => {
    const {
        isAdmin,
        isLoading: isLoadingOnboardingNotificationState,
        onboardingNotificationState,
        handleOnSave,
        handleOnSendOrCancelNotification,
        handleOnPerformActionPostReceivedNotification,
        isAiAgentOnboardingNotificationEnabled,
    } = useAiAgentOnboardingNotification({ shopName })

    const onboardingState = useAiAgentOnboardingState(shopName)
    const trialAccess = useTrialAccess(shopName)

    const history = useHistory()
    const location = useLocation()
    const aiAgentNavigation = useAiAgentNavigation({ shopName })

    const isOnStorePage = extractShopNameFromUrl(location.pathname) === shopName
    const isOnUpdateOnboardingWizard =
        storeConfiguration?.wizard?.completedDatetime === null

    const sameVisitRef = useRef(false)

    useEffectOnce(() => {
        logEvent(SegmentEvent.AiAgentNewOnboardingWizardPaywallPageViewed, {
            shopName,
        })
    })

    useEffect(() => {
        logEvent(SegmentEvent.AiAgentWelcomePageViewed, {
            version: WELCOME_PAGE_VERSION,
            store: shopName,
        })

        if (trialAccess.canSeeTrialCTA) {
            logEvent(SegmentEvent.TrialLinkPaywallViewed, {
                trialType: TrialType.AiAgent,
            })
        }
    }, [shopName, trialAccess.canSeeTrialCTA])

    const isAiAgentTrial = trialAccess.trialType === TrialType.AiAgent
    const canStartOnboarding =
        (trialAccess.hasCurrentStoreTrialExpired ||
            trialAccess.isTrialingSubscription ||
            hasAutomatePlanAboveGen6(trialAccess.currentAutomatePlan)) &&
        !trialAccess.isOnboarded

    const paywallFeature = useMemo(
        () =>
            isAiAgentTrial || canStartOnboarding
                ? AIAgentPaywallFeatures.TrialSetup
                : AIAgentPaywallFeatures.ShoppingAssistantTrialSetup,
        [isAiAgentTrial, canStartOnboarding],
    )

    const automatePaywallFiredRef = useRef(false)
    useEffect(() => {
        if (
            trialAccess.isLoading ||
            trialAccess.isOnboarded === undefined ||
            automatePaywallFiredRef.current
        )
            return
        automatePaywallFiredRef.current = true
        logEvent(SegmentEvent.AutomatePaywallVisited, {
            location: paywallFeature,
        })
    }, [paywallFeature, trialAccess.isLoading, trialAccess.isOnboarded])

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

    const onCtaTransition = useCallback(
        (extraSearchParams?: Record<string, string>) => {
            if (isAdmin) {
                void handleOnFinishSetupNotification()
            }

            logEvent(SegmentEvent.AiAgentWelcomePageCtaClicked, {
                version: WELCOME_PAGE_VERSION,
                store: shopName,
            })

            const searchParams = new URLSearchParams(extraSearchParams)
            if (isOnUpdateOnboardingWizard) {
                searchParams.set(WIZARD_UPDATE_QUERY_KEY, 'true')
            }
            const search = searchParams.toString()

            history.push({
                pathname: aiAgentNavigation.routes.onboardingWizardStep(
                    WizardStepEnum.TONE_OF_VOICE,
                ),
                search: search ? `?${search}` : '',
            })
        },
        [
            aiAgentNavigation.routes,
            handleOnFinishSetupNotification,
            history,
            isAdmin,
            isOnUpdateOnboardingWizard,
            shopName,
        ],
    )

    useEffect(() => {
        if (!isOnStorePage || onboardingState === OnboardingState.Loading) {
            return
        }

        const requiresOnboardingWizard =
            onboardingState === OnboardingState.OnboardingWizard &&
            trialAccess.isInAiAgentTrial &&
            !isTrialFinishSetupModalOpen

        if (requiresOnboardingWizard) {
            onCtaTransition()
        }
    }, [
        isOnStorePage,
        onboardingState,
        trialAccess.isInAiAgentTrial,
        isTrialFinishSetupModalOpen,
        onCtaTransition,
    ])

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
        ) {
            return
        }

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

        const updatedState = await handleOnSave(payload)

        if (
            updatedState?.welcomePageVisitedDatetimes &&
            updatedState.welcomePageVisitedDatetimes.length >= 3
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
        ) {
            return
        }

        void handleOnStartSetupNotification()
    }, [
        handleOnStartSetupNotification,
        isAdmin,
        isAiAgentOnboardingNotificationEnabled,
        isLoadingOnboardingNotificationState,
    ])

    return { onCtaTransition, isOnUpdateOnboardingWizard }
}
