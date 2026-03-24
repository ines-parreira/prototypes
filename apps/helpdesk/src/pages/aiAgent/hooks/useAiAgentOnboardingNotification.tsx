import { useCallback } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import hash from 'object-hash'

import {
    AI_AGENT_SET_AND_OPTIMIZED_TYPE,
    AI_AGENT_SET_AND_OPTIMIZED_WORKFLOW,
} from 'automate/notifications/constants'
import { AiAgentNotificationType } from 'automate/notifications/types'
import {
    getNotificationReceivedDatetime,
    getNotificationReceivedDatetimePayload,
} from 'automate/notifications/utils'
import { UserRole } from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { getOnboardingNotificationState } from 'models/aiAgent/resources/configuration'
import type { OnboardingNotificationState } from 'models/aiAgent/types'
import { AiAgentOnboardingState } from 'models/aiAgent/types'
import { NotificationEvent } from 'services/notificationTracker/constants'
import {
    getAdminRecipientIds,
    logNotificationEvent,
} from 'services/notificationTracker/notificationTracker'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { hasRole } from 'utils'

import { useOnboardingNotificationState } from './useOnboardingNotificationState'
import { useOnboardingNotificationStateMutation } from './useOnboardingNotificationStateMutation'

export const NUMBER_OF_MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24
const NUMBER_OF_DAYS_TO_TRACK = 14

type Params = {
    shopName: string | undefined
    hasAutomateSubscription?: boolean
}

export const useAiAgentOnboardingNotification = ({
    shopName,
    hasAutomateSubscription,
}: Params) => {
    const dispatch = useAppDispatch()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const currentUser = useAppSelector(getCurrentUser)
    const isAdmin = hasRole(currentUser, UserRole.Admin)

    const { onboardingNotificationState, isLoading: isLoadingGet } =
        useOnboardingNotificationState({
            accountDomain,
            shopName,
            enabled: hasAutomateSubscription,
        })

    const {
        isLoading: isLoadingCreateOrUpdate,
        upsertOnboardingNotificationState,
    } = useOnboardingNotificationStateMutation({ accountDomain, shopName })

    const isAiAgentOnboardingNotificationEnabled = useFlag(
        FeatureFlagKey.AiAgentOnboardingNotification,
    )

    const handleOnSave = useCallback(
        async (
            payload: Partial<OnboardingNotificationState>,
        ): Promise<OnboardingNotificationState | undefined> => {
            if (
                !isAiAgentOnboardingNotificationEnabled ||
                !shopName ||
                !onboardingNotificationState
            ) {
                return onboardingNotificationState
            }

            let result: OnboardingNotificationState | undefined

            try {
                const updatedValue = {
                    ...onboardingNotificationState,
                    ...payload,
                    shopName,
                }
                result = await upsertOnboardingNotificationState(updatedValue)
            } catch {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Failed to save onboarding notification state',
                    }),
                )
            }

            return result
        },
        [
            dispatch,
            isAiAgentOnboardingNotificationEnabled,
            onboardingNotificationState,
            shopName,
            upsertOnboardingNotificationState,
        ],
    )

    const handleOnSendOrCancelNotification = useCallback(
        ({
            aiAgentNotificationType,
            isCancel = false,
            agentId,
        }: {
            aiAgentNotificationType: AiAgentNotificationType
            isCancel?: boolean
            agentId?: number
        }) => {
            if (
                !isAiAgentOnboardingNotificationEnabled ||
                !shopName ||
                !onboardingNotificationState
            ) {
                return
            }

            if (
                [
                    AiAgentNotificationType.AiShoppingAssistantTrialRequest,
                    AiAgentNotificationType.AiAgentTrialRequest,
                ].includes(aiAgentNotificationType) &&
                !agentId
            ) {
                return
            }

            const adminRecipientIdsList = getAdminRecipientIds() ?? []

            const userIdPart = agentId ? `+${agentId}` : ''

            const idempotencyKey = `idempotent:${accountDomain}+${shopName}+${aiAgentNotificationType}${userIdPart}+${hash(adminRecipientIdsList)}`
            const cancellationKey = `cancel:${accountDomain}+${shopName}+${aiAgentNotificationType}${userIdPart}`

            const notificationData = {
                ai_agent_notification_type: aiAgentNotificationType,
                shop_name: shopName,
                shop_type: 'shopify',
                agent_id: agentId,
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
                      },
            )

            if (!isCancel) {
                logEvent(SegmentEvent.AiAgentOnboardingNotificationTriggered, {
                    type: aiAgentNotificationType,
                })
            }
        },
        [
            accountDomain,
            isAiAgentOnboardingNotificationEnabled,
            onboardingNotificationState,
            shopName,
        ],
    )

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
            Boolean(datetime),
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
                SegmentEvent.AiAgentEnablementPostReceivedOnboardingNotification,
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
                    onboardingNotificationState,
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
                    },
                )
            }
        },
        [
            isAiAgentOnboardingNotificationEnabled,
            onboardingNotificationState,
            shopName,
        ],
    )

    const handleOnTriggerActivateAiAgentNotification = useCallback(() => {
        if (
            !isAiAgentOnboardingNotificationEnabled ||
            !isAdmin ||
            !shopName ||
            !onboardingNotificationState
        )
            return

        const isFullyOnboarded =
            onboardingNotificationState.onboardingState ===
            AiAgentOnboardingState.FullyOnboarded
        const isActivated =
            onboardingNotificationState.onboardingState ===
            AiAgentOnboardingState.Activated
        const isActivateAiAgentNotificationAlreadyReceived =
            !!onboardingNotificationState?.activateAiAgentNotificationReceivedDatetime

        if (
            isFullyOnboarded ||
            isActivated ||
            isActivateAiAgentNotificationAlreadyReceived
        )
            return

        handleOnSendOrCancelNotification({
            aiAgentNotificationType: AiAgentNotificationType.ActivateAiAgent,
        })
    }, [
        handleOnSendOrCancelNotification,
        isAdmin,
        isAiAgentOnboardingNotificationEnabled,
        onboardingNotificationState,
        shopName,
    ])

    const handleOnCancelActivateAiAgentNotification = useCallback(() => {
        if (
            !isAiAgentOnboardingNotificationEnabled ||
            !shopName ||
            !onboardingNotificationState
        )
            return

        const isFullyOnboarded =
            onboardingNotificationState.onboardingState ===
            AiAgentOnboardingState.FullyOnboarded
        const isActivated =
            onboardingNotificationState.onboardingState ===
            AiAgentOnboardingState.Activated

        if (isFullyOnboarded || isActivated) return

        handleOnSendOrCancelNotification({
            aiAgentNotificationType: AiAgentNotificationType.ActivateAiAgent,
            isCancel: true,
        })

        const payload: Partial<OnboardingNotificationState> = {
            onboardingState: AiAgentOnboardingState.Activated,
            firstActivationDatetime:
                onboardingNotificationState?.firstActivationDatetime ??
                new Date().toISOString(),
        }

        void handleOnSave(payload)

        handleOnEnablementPostReceivedNotification()
        handleOnPerformActionPostReceivedNotification(
            AiAgentNotificationType.ActivateAiAgent,
        )
    }, [
        handleOnEnablementPostReceivedNotification,
        handleOnPerformActionPostReceivedNotification,
        handleOnSave,
        handleOnSendOrCancelNotification,
        isAiAgentOnboardingNotificationEnabled,
        onboardingNotificationState,
        shopName,
    ])

    const handleOnTriggerTrialRequestNotification = useCallback(
        async (
            notificationType:
                | AiAgentNotificationType.AiShoppingAssistantTrialRequest
                | AiAgentNotificationType.AiAgentTrialRequest,
        ) => {
            if (!isAiAgentOnboardingNotificationEnabled || !shopName) return

            const { data } = await getOnboardingNotificationState(
                accountDomain,
                shopName,
            )

            handleOnSendOrCancelNotification({
                aiAgentNotificationType: notificationType,
                isCancel: false,
                agentId: currentUser.get('id'),
            })

            const payload = getNotificationReceivedDatetimePayload(
                {
                    ai_agent_notification_type: notificationType,
                    shop_name: shopName,
                    shop_type: 'shopify',
                    agent_id: currentUser.get('id'),
                },
                data.onboardingNotificationState,
            )

            void handleOnSave(payload)
        },
        [
            handleOnSave,
            handleOnSendOrCancelNotification,
            isAiAgentOnboardingNotificationEnabled,
            shopName,
            currentUser,
            accountDomain,
        ],
    )

    return {
        isAdmin,
        onboardingNotificationState,
        handleOnSave,
        handleOnSendOrCancelNotification,
        handleOnEnablementPostReceivedNotification,
        handleOnPerformActionPostReceivedNotification,
        handleOnTriggerActivateAiAgentNotification,
        handleOnCancelActivateAiAgentNotification,
        handleOnTriggerTrialRequestNotification,
        isLoading: isLoadingCreateOrUpdate || isLoadingGet,
        isAiAgentOnboardingNotificationEnabled,
    }
}
