import React from 'react'

import {Content, Subtitle} from 'common/notifications'
import type {ContentProps, Notification} from 'common/notifications'

import {useAccountStoreConfiguration} from 'pages/automate/aiAgent/hooks/useAccountStoreConfiguration'

import {AI_AGENT_ICON} from 'pages/common/components/SourceIcon'

import {AiAgentNotificationPayload} from '../types'
import {getNotificationParams} from '../utils'

type Props = {
    notification: Notification<AiAgentNotificationPayload>
} & ContentProps

export default function AiAgentNotification({notification, ...props}: Props) {
    const payload = notification.payload
    const {aiAgentTicketViewId} = useAccountStoreConfiguration({
        storeNames: [payload.shop_name],
    })
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
