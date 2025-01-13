import React, {useEffect} from 'react'

import {Content, Subtitle} from 'common/notifications'
import type {ContentProps, Notification} from 'common/notifications'

import {useAccountStoreConfiguration} from 'pages/aiAgent/hooks/useAccountStoreConfiguration'

import {useAiAgentOnboardingNotification} from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import {AI_AGENT_ICON} from 'pages/common/components/SourceIcon'

import {AiAgentNotificationPayload} from '../types'
import {
    getNotificationParams,
    getNotificationReceivedDatetime,
    isNotificationAlreadyReceived,
} from '../utils'

type Props = {
    notification: Notification<AiAgentNotificationPayload>
} & ContentProps

export default function AiAgentNotification({notification, ...props}: Props) {
    const payload = notification.payload
    const {aiAgentTicketViewId} = useAccountStoreConfiguration({
        storeNames: [payload.shop_name],
    })

    const {isLoading, onboardingNotificationState, handleOnSave} =
        useAiAgentOnboardingNotification({
            shopName: payload.shop_name,
        })

    useEffect(() => {
        if (
            isLoading ||
            !payload ||
            !payload.shop_name ||
            !payload.ai_agent_notification_type
        )
            return

        const isAlreadyReceived = isNotificationAlreadyReceived(
            payload.ai_agent_notification_type,
            onboardingNotificationState
        )

        if (!isAlreadyReceived) {
            const notificationReceivedDatetime =
                getNotificationReceivedDatetime(
                    payload.ai_agent_notification_type
                )
            void handleOnSave(notificationReceivedDatetime)
        }
    }, [handleOnSave, isLoading, onboardingNotificationState, payload])

    const notificationParams = getNotificationParams(
        payload,
        aiAgentTicketViewId
    )

    if (!notificationParams) {
        return null
    }

    return (
        <Content
            {...props}
            icon={{type: AI_AGENT_ICON}}
            title={notificationParams.title}
            url={notificationParams.redirectTo}
        >
            <Subtitle>{notificationParams.subtitle}</Subtitle>
        </Content>
    )
}
