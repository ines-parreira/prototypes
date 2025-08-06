import { useCallback, useMemo } from 'react'

import { useCreateAiShoppingAssistantTrialRequest } from '@gorgias/helpdesk-queries'

import { isLessThan24HoursAgo } from 'automate/notifications/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { getAccountAdminsJS } from 'state/agents/selectors'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useNotifyAdmins = (
    shopName: string | undefined,
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
                (request) => request.userId === currentUser.get('id'),
            )

        return !!(
            existingUser && isLessThan24HoursAgo(existingUser.receivedDatetime)
        )
    }, [currentUser, onboardingNotificationState])

    const handleNotifyAdmins = useCallback(
        (additionalNote?: string) => {
            if (!shopName) {
                return
            }

            try {
                handleOnTriggerTrialRequestNotification()

                void createAiShoppingAssistantTrialRequest({
                    data: {
                        account_id: currentAccountId,
                        current_user_id: currentUser.get('id'),
                        shop_name: shopName,
                        additional_note: additionalNote,
                    },
                })

                onSuccess?.()

                void dispatch(
                    notify({
                        message:
                            'Your request to Shopping Assistant trial has been sent to all Gorgias admins.',
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
        ],
    )

    return {
        isLoading: isLoadingOnboardingNotificationState,
        isDisabled,
        handleNotifyAdmins,
        accountAdmins,
    }
}
