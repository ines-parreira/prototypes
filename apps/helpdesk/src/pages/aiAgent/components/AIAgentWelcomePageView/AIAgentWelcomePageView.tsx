import { useCallback, useEffect, useRef } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { useHistory } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import { AiAgentNotificationType } from 'automate/notifications/types'
import { logEvent, SegmentEvent } from 'common/segment'
import {
    AiAgentOnboardingState,
    OnboardingNotificationState,
    StoreConfiguration,
} from 'models/aiAgent/types'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { WIZARD_UPDATE_QUERY_KEY } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'

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

    const history = useHistory()
    const sameVisitRef = useRef(false)

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

    const onOnboardingWizardClick = useCallback(() => {
        if (isAdmin) {
            void handleOnFinishSetupNotification()
        }

        logEvent(SegmentEvent.AiAgentWelcomePageCtaClicked, {
            version: 'Dynamic',
            store: props.shopName,
        })

        const path = aiAgentNavigation.routes.onboardingWizardStep(
            WizardStepEnum.CHANNELS,
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

    useEffect(() => {
        logEvent(SegmentEvent.AiAgentWelcomePageViewed, {
            version: 'Basic',
            store: props.shopName,
        })
    }, [props.shopName])

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

    return (
        <AiAgentPaywallView
            aiAgentPaywallFeature={AIAgentPaywallFeatures.SalesSetup}
        >
            <Button
                intent="primary"
                size="medium"
                onClick={onOnboardingWizardClick}
                trailingIcon="auto_awesome"
            >
                {isOnUpdateOnboardingWizard
                    ? 'Continue Setup'
                    : 'Set Up AI Agent'}
            </Button>
            <div data-candu-id="ai-agent-welcome-page" />
        </AiAgentPaywallView>
    )
}
