import { useEffect } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { Content, Excerpt, Subtitle } from 'common/notifications'
import type { ContentProps, Notification } from 'common/notifications'
import { useAccountStoreConfiguration } from 'pages/aiAgent/hooks/useAccountStoreConfiguration'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { useOpportunitiesTracking } from 'pages/aiAgent/opportunities/hooks/useOpportunitiesTracking'
import { OpportunityPageReferrer } from 'pages/aiAgent/opportunities/types'
import { AI_AGENT_ICON } from 'pages/common/components/SourceIcon'

import { AiAgentNotificationType } from '../types'
import type { AiAgentNotificationPayload } from '../types'
import {
    getNotificationParams,
    getNotificationReceivedDatetimePayload,
    isNotificationAlreadyReceived,
} from '../utils'

type Props = {
    notification: Notification<AiAgentNotificationPayload>
} & ContentProps

export default function AiAgentNotification({ notification, ...props }: Props) {
    const payload = notification.payload
    const { aiAgentTicketViewId } = useAccountStoreConfiguration({
        storeNames: [payload.shop_name],
    })

    const { isLoading, onboardingNotificationState, handleOnSave } =
        useAiAgentOnboardingNotification({
            shopName: payload.shop_name,
        })

    const { onRedirectToOpportunityPage } = useOpportunitiesTracking()

    useEffect(() => {
        if (
            isLoading ||
            !payload ||
            !payload.shop_name ||
            !payload.ai_agent_notification_type ||
            !onboardingNotificationState
        )
            return

        if (
            payload.ai_agent_notification_type ===
            AiAgentNotificationType.NewOpportunityGenerated
        )
            return

        const isAlreadyReceived = isNotificationAlreadyReceived(
            payload,
            onboardingNotificationState,
        )

        if (!isAlreadyReceived) {
            const notificationReceivedDatetimePayload =
                getNotificationReceivedDatetimePayload(
                    payload,
                    onboardingNotificationState,
                )
            void handleOnSave(notificationReceivedDatetimePayload)

            logEvent(SegmentEvent.AiAgentOnboardingNotificationReceived, {
                type: payload.ai_agent_notification_type,
            })
        }
    }, [handleOnSave, isLoading, onboardingNotificationState, payload])

    const notificationParams = getNotificationParams(
        payload,
        aiAgentTicketViewId,
    )

    if (!notificationParams) {
        return null
    }

    const handleOnClick = () => {
        if (props.onClick) {
            props.onClick()
        }

        if (
            payload.ai_agent_notification_type ===
            AiAgentNotificationType.NewOpportunityGenerated
        ) {
            onRedirectToOpportunityPage({
                referrer: OpportunityPageReferrer.IN_APP_NOTIFICATION,
            })
        } else {
            logEvent(SegmentEvent.AiAgentOnboardingNotificationClicked, {
                type: payload.ai_agent_notification_type,
            })
        }
    }

    return (
        <Content
            {...props}
            icon={{ type: AI_AGENT_ICON }}
            title={notificationParams.title}
            url={notificationParams.redirectTo}
            onClick={handleOnClick}
        >
            <Subtitle>
                <span
                    dangerouslySetInnerHTML={{
                        __html: notificationParams.subtitle,
                    }}
                />
            </Subtitle>
            {notificationParams.excerpt && (
                <Excerpt>{notificationParams.excerpt}</Excerpt>
            )}
        </Content>
    )
}
