import {useFlags} from 'launchdarkly-react-client-sdk'
import hash from 'object-hash'

import {useCallback} from 'react'

import {
    AI_AGENT_SET_AND_OPTIMIZED_TYPE,
    AI_AGENT_SET_AND_OPTIMIZED_WORKFLOW,
} from 'automate/notifications/constants'
import {AiAgentNotificationType} from 'automate/notifications/types'
import {getNotificationReceivedDatetime} from 'automate/notifications/utils'
import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {UserRole} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {OnboardingNotificationState} from 'models/aiAgent/types'
import {NotificationEvent} from 'services/notificationTracker/constants'
import {
    getAdminRecipientIds,
    logNotificationEvent,
} from 'services/notificationTracker/notificationTracker'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

import {getCurrentUser} from 'state/currentUser/selectors'
import {notify} from 'state/notifications/actions'

import {NotificationStatus} from 'state/notifications/types'

import {hasRole} from 'utils'

import {useOnboardingNotificationState} from './useOnboardingNotificationState'
import {useOnboardingNotificationStateMutation} from './useOnboardingNotificationStateMutation'

export const NUMBER_OF_MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24
const NUMBER_OF_DAYS_TO_TRACK = 14

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

        const adminRecipientIdsList = getAdminRecipientIds() ?? []

        const idempotencyKey = `idempotency:${accountDomain}+${shopName}+${aiAgentNotificationType}+${hash(adminRecipientIdsList)}`
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

        if (!isCancel) {
            logEvent(SegmentEvent.AiAgentOnboardingNotificationTriggered, {
                type: aiAgentNotificationType,
            })
        }
    }

    const handleOnEnablementPostReceivedNotification = useCallback(() => {
        if (
            !isAiAgentOnboardingNotificationEnabled ||
            !shopName ||
            !onboardingNotificationState
        ) {
            return
        }

        const receivedNotificationDatetimes = [
            onboardingNotificationState?.meetAiAgentNotificationReceivedDatetime,
            onboardingNotificationState?.startAiAgentSetupNotificationReceivedDatetime,
            onboardingNotificationState?.finishAiAgentSetupNotificationReceivedDatetime,
            onboardingNotificationState?.activateAiAgentNotificationReceivedDatetime,
        ].filter((datetime: string | null): datetime is string =>
            Boolean(datetime)
        )

        const latestReceivedNotificationDatetime =
            receivedNotificationDatetimes.reduce((latest, current) => {
                const latestDate = new Date(latest)
                const currentDate = new Date(current)
                return currentDate > latestDate ? current : latest
            }, receivedNotificationDatetimes[0])

        if (!latestReceivedNotificationDatetime) return

        const receivedDatetime = new Date(latestReceivedNotificationDatetime)
        const currentDatetime = new Date()

        const daysDifference =
            (currentDatetime.getTime() - receivedDatetime.getTime()) /
            NUMBER_OF_MILLISECONDS_IN_A_DAY

        if (daysDifference <= NUMBER_OF_DAYS_TO_TRACK) {
            logEvent(
                SegmentEvent.AiAgentEnablementPostReceivedOnboardingNotification
            )
        }
    }, [
        isAiAgentOnboardingNotificationEnabled,
        onboardingNotificationState,
        shopName,
    ])

    const handleOnPerformActionPostReceivedNotification = useCallback(
        (type: AiAgentNotificationType) => {
            if (
                !isAiAgentOnboardingNotificationEnabled ||
                !shopName ||
                !onboardingNotificationState
            ) {
                return
            }

            const notificationReceivedDatetime =
                getNotificationReceivedDatetime(
                    type,
                    onboardingNotificationState
                )

            if (!notificationReceivedDatetime) return

            const receivedDatetime = new Date(notificationReceivedDatetime)
            const currentDatetime = new Date()

            const daysDifference =
                (currentDatetime.getTime() - receivedDatetime.getTime()) /
                NUMBER_OF_MILLISECONDS_IN_A_DAY

            if (daysDifference <= NUMBER_OF_DAYS_TO_TRACK) {
                logEvent(
                    SegmentEvent.AiAgentActionPerformedPostReceivedOnboardingNotification,
                    {
                        type,
                    }
                )
            }
        },
        [
            isAiAgentOnboardingNotificationEnabled,
            onboardingNotificationState,
            shopName,
        ]
    )

    return {
        isAdmin,
        onboardingNotificationState,
        handleOnSave,
        handleOnSendOrCancelNotification,
        handleOnEnablementPostReceivedNotification,
        handleOnPerformActionPostReceivedNotification,
        isLoading: isLoadingCreateOrUpdate || isLoadingGet,
        isAiAgentOnboardingNotificationEnabled,
    }
}
