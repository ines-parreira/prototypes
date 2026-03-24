import { useCallback } from 'react'

import { useHistory } from 'react-router-dom'

import { AiAgentNotificationType } from 'automate/notifications/types'
import { AiAgentOnboardingState } from 'models/aiAgent/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding_V2/types'

export const useAiAgentTrialOnboarding = ({
    shopName,
}: {
    shopName: string
}) => {
    const history = useHistory()
    const {
        isAdmin,
        onboardingNotificationState,
        handleOnSave,
        handleOnSendOrCancelNotification,
        handleOnPerformActionPostReceivedNotification,
    } = useAiAgentOnboardingNotification({ shopName })

    const aiAgentNavigation = useAiAgentNavigation({ shopName })

    const startOnboardingWizard = useCallback(async () => {
        if (isAdmin) {
            const isFinishedSetupNotificationAlreadyReceived =
                !!onboardingNotificationState?.finishAiAgentSetupNotificationReceivedDatetime

            if (!isFinishedSetupNotificationAlreadyReceived) {
                handleOnSendOrCancelNotification({
                    aiAgentNotificationType:
                        AiAgentNotificationType.FinishAiAgentSetup,
                })
            }

            handleOnSendOrCancelNotification({
                aiAgentNotificationType:
                    AiAgentNotificationType.StartAiAgentSetup,
                isCancel: true,
            })

            await handleOnSave({
                onboardingState: AiAgentOnboardingState.StartedSetup,
            })

            handleOnPerformActionPostReceivedNotification(
                AiAgentNotificationType.StartAiAgentSetup,
            )
        }

        const path = aiAgentNavigation.routes.onboardingWizardStep(
            WizardStepEnum.TONE_OF_VOICE,
        )

        history.push({ pathname: path })
    }, [
        isAdmin,
        onboardingNotificationState?.finishAiAgentSetupNotificationReceivedDatetime,
        handleOnSendOrCancelNotification,
        handleOnSave,
        handleOnPerformActionPostReceivedNotification,
        aiAgentNavigation.routes,
        history,
    ])

    return { startOnboardingWizard }
}
