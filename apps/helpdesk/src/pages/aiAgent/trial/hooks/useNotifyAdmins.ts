import { useCallback, useMemo } from 'react'

import { useCreateAiShoppingAssistantTrialRequest } from '@gorgias/helpdesk-queries'

import { AiAgentNotificationType } from 'automate/notifications/types'
import {
    isLessThan24HoursAgo,
    isTrialNotificationOfType,
} from 'automate/notifications/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { getAccountAdminsJS } from 'state/agents/selectors'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

const getSuccessMessage = (trialType: TrialType) => {
    const trialProduct =
        trialType === TrialType.AiAgent ? 'AI Agent' : 'Shopping Assistant'

    return `Your request to access the ${trialProduct} trial has been sent to all Gorgias admins.`
}

export const useNotifyAdmins = (
    shopName: string | undefined,
    trialType: TrialType,
    onSuccess?: () => void,
) => {
    const dispatch = useAppDispatch()
    const accountAdmins = useAppSelector(getAccountAdminsJS)
    const currentUser = useAppSelector(getCurrentUser)
    const currentAccountId = useAppSelector(getCurrentAccountId)

    const {
        handleOnTriggerTrialRequestNotification,
        onboardingNotificationState,
        isLoading: isLoadingOnboardingNotificationState,
    } = useAiAgentOnboardingNotification({
        shopName,
    })
    const { mutate: createAiShoppingAssistantTrialRequest } =
        useCreateAiShoppingAssistantTrialRequest()

    const isDisabled = useMemo(() => {
        const existingUser =
            onboardingNotificationState?.trialRequestNotification?.find(
                (request) =>
                    request.userId === currentUser.get('id') &&
                    isTrialNotificationOfType(request, trialType),
            )

        return !!(
            existingUser && isLessThan24HoursAgo(existingUser.receivedDatetime)
        )
    }, [currentUser, onboardingNotificationState, trialType])

    const handleNotifyAdmins = useCallback(
        (additionalNote?: string) => {
            if (!shopName) {
                return
            }

            try {
                const notificationType =
                    trialType === TrialType.AiAgent
                        ? AiAgentNotificationType.AiAgentTrialRequest
                        : AiAgentNotificationType.AiShoppingAssistantTrialRequest

                handleOnTriggerTrialRequestNotification(notificationType)

                // TODO(flywheel): temporarily we're sending email notification only for Shopping Assistant
                if (trialType === TrialType.ShoppingAssistant) {
                    void createAiShoppingAssistantTrialRequest({
                        data: {
                            account_id: currentAccountId,
                            current_user_id: currentUser.get('id'),
                            shop_name: shopName,
                            additional_note: additionalNote,
                        },
                    })
                }

                onSuccess?.()

                void dispatch(
                    notify({
                        message: getSuccessMessage(trialType),
                        status: NotificationStatus.Success,
                    }),
                )
            } catch (error) {
                console.error(error)
            }
        },
        [
            dispatch,
            handleOnTriggerTrialRequestNotification,
            currentAccountId,
            currentUser,
            shopName,
            createAiShoppingAssistantTrialRequest,
            onSuccess,
            trialType,
        ],
    )

    return {
        isLoading: isLoadingOnboardingNotificationState,
        isDisabled,
        handleNotifyAdmins,
        accountAdmins,
    }
}
