import React, {useEffect} from 'react'

import {Content, Subtitle} from 'common/notifications'
import type {ContentProps, Notification} from 'common/notifications'

import {logEvent, SegmentEvent} from 'common/segment'
import {useAccountStoreConfiguration} from 'pages/aiAgent/hooks/useAccountStoreConfiguration'

import {useAiAgentOnboardingNotification} from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import {AI_AGENT_ICON} from 'pages/common/components/SourceIcon'

import {AiAgentNotificationPayload} from '../types'
import {
    getNotificationParams,
    getNotificationReceivedDatetimePayload,
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
            !payload.ai_agent_notification_type ||
            !onboardingNotificationState
        )
            return

        const isAlreadyReceived = isNotificationAlreadyReceived(
            payload.ai_agent_notification_type,
            onboardingNotificationState
        )

        if (!isAlreadyReceived) {
            const notificationReceivedDatetimePayload =
                getNotificationReceivedDatetimePayload(
                    payload.ai_agent_notification_type
                )
            void handleOnSave(notificationReceivedDatetimePayload)

            logEvent(SegmentEvent.AiAgentOnboardingNotificationReceived, {
                type: payload.ai_agent_notification_type,
            })
        }
    }, [handleOnSave, isLoading, onboardingNotificationState, payload])

    const notificationParams = getNotificationParams(
        payload,
        aiAgentTicketViewId
    )

    if (!notificationParams) {
        return null
    }

    const handleOnClick = () => {
        if (props.onClick) {
            props.onClick()
        }

        logEvent(SegmentEvent.AiAgentOnboardingNotificationClicked, {
            type: payload.ai_agent_notification_type,
        })
    }

    return (
        <Content
            {...props}
            icon={{type: AI_AGENT_ICON}}
            title={notificationParams.title}
            url={notificationParams.redirectTo}
            onClick={handleOnClick}
        >
            <Subtitle>{notificationParams.subtitle}</Subtitle>
        </Content>
    )
}
