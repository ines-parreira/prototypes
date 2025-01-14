import {useFlags} from 'launchdarkly-react-client-sdk'

import {useCallback} from 'react'

import {
    AI_AGENT_SET_AND_OPTIMIZED_TYPE,
    AI_AGENT_SET_AND_OPTIMIZED_WORKFLOW,
} from 'automate/notifications/constants'
import {AiAgentNotificationType} from 'automate/notifications/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {UserRole} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {OnboardingNotificationState} from 'models/aiAgent/types'
import {NotificationEvent} from 'services/notificationTracker/constants'
import {logNotificationEvent} from 'services/notificationTracker/notificationTracker'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

import {getCurrentUser} from 'state/currentUser/selectors'
import {notify} from 'state/notifications/actions'

import {NotificationStatus} from 'state/notifications/types'

import {hasRole} from 'utils'

import {useOnboardingNotificationState} from './useOnboardingNotificationState'
import {useOnboardingNotificationStateMutation} from './useOnboardingNotificationStateMutation'

type Params = {
    shopName: string | undefined
}

export const useAiAgentOnboardingNotification = ({shopName}: Params) => {
    const dispatch = useAppDispatch()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const currentUser = useAppSelector(getCurrentUser)
    const isAdmin = hasRole(currentUser, UserRole.Admin)

    const {onboardingNotificationState, isLoading: isLoadingGet} =
        useOnboardingNotificationState({
            accountDomain,
            shopName,
        })

    const {
        isLoading: isLoadingCreateOrUpdate,
        createOnboardingNotificationState,
        upsertOnboardingNotificationState,
    } = useOnboardingNotificationStateMutation({accountDomain, shopName})

    const isAiAgentOnboardingNotificationEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentOnboardingNotification]

    const handleOnSave = useCallback(
        async (
            payload: Partial<OnboardingNotificationState>
        ): Promise<OnboardingNotificationState | undefined> => {
            if (!isAiAgentOnboardingNotificationEnabled || !shopName) {
                return onboardingNotificationState
            }

            const isUpdate = !!onboardingNotificationState
            let result: OnboardingNotificationState | undefined

            try {
                if (isUpdate) {
                    const updatedValue = {
                        ...onboardingNotificationState,
                        ...payload,
                        shopName,
                    }
                    result =
                        await upsertOnboardingNotificationState(updatedValue)
                } else {
                    const initValues = {
                        ...payload,
                        shopName,
                    }
                    result = await createOnboardingNotificationState(initValues)
                }
            } catch (error) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Failed to save onboarding notification state',
                    })
                )
            }

            return result
        },
        [
            createOnboardingNotificationState,
            dispatch,
            isAiAgentOnboardingNotificationEnabled,
            onboardingNotificationState,
            shopName,
            upsertOnboardingNotificationState,
        ]
    )

    const handleOnSendOrCancelNotification = ({
        aiAgentNotificationType,
        isCancel = false,
    }: {
        aiAgentNotificationType: AiAgentNotificationType
        isCancel?: boolean
    }) => {
        if (!isAdmin || !isAiAgentOnboardingNotificationEnabled || !shopName) {
            return
        }

        const idempotencyKey = `idempotency:${accountDomain}+${shopName}+${aiAgentNotificationType}`
        const cancellationKey = `cancel:${accountDomain}+${shopName}+${aiAgentNotificationType}`
        const notificationData = {
            ai_agent_notification_type: aiAgentNotificationType,
            shop_name: shopName,
            shop_type: 'shopify',
        }
        const notificationProps = {
            command_type: 'cancel-notification',
            notification_workflow: AI_AGENT_SET_AND_OPTIMIZED_WORKFLOW,
            notification_type: AI_AGENT_SET_AND_OPTIMIZED_TYPE,
            cancellation_key: cancellationKey,
            idempotency_key: idempotencyKey,
            notification_data: {},
        }

        logNotificationEvent(
            NotificationEvent,
            isCancel
                ? notificationProps
                : {
                      ...notificationProps,
                      command_type: 'send-notification',
                      notification_data: notificationData,
                  }
        )
    }

    return {
        isAdmin,
        onboardingNotificationState,
        handleOnSave,
        handleOnSendOrCancelNotification,
        isLoading: isLoadingCreateOrUpdate || isLoadingGet,
        isAiAgentOnboardingNotificationEnabled,
    }
}
