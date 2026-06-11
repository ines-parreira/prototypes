import { useEffect, useRef } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { Excerpt, NotificationFeedItem } from '@repo/notifications'

import { AIThinking } from '@gorgias/axiom'

import { Content, Subtitle } from 'common/notifications'
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

export function AiAgentNotification({ notification, ...props }: Props) {
    const payload = notification.payload
    const { aiAgentTicketViewId } = useAccountStoreConfiguration({
        storeNames: [payload.shop_name],
    })
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

    const { isLoading, onboardingNotificationState, handleOnSave } =
        useAiAgentOnboardingNotification({
            shopName: payload.shop_name,
        })

    const { onRedirectToOpportunityPage } = useOpportunitiesTracking()

    const hasAttemptedSaveRef = useRef(false)

    useEffect(() => {
        if (hasAttemptedSaveRef.current) return

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
                AiAgentNotificationType.NewOpportunityGenerated ||
            payload.ai_agent_notification_type ===
                AiAgentNotificationType.DomainSyncCompleted ||
            payload.ai_agent_notification_type ===
                AiAgentNotificationType.DomainSyncFailed ||
            payload.ai_agent_notification_type ===
                AiAgentNotificationType.UrlSyncCompleted ||
            payload.ai_agent_notification_type ===
                AiAgentNotificationType.UrlSyncFailed ||
            payload.ai_agent_notification_type ===
                AiAgentNotificationType.SkillWizardReady ||
            payload.ai_agent_notification_type ===
                AiAgentNotificationType.SkillWizardNudge
        )
            return

        const isAlreadyReceived = isNotificationAlreadyReceived(
            payload,
            onboardingNotificationState,
        )

        if (!isAlreadyReceived) {
            hasAttemptedSaveRef.current = true

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

    if (hasWayfindingMS1Flag) {
        return (
            <NotificationFeedItem
                notification={notification}
                icon={<AIThinking size="sm" variant="static" />}
                title={notificationParams.title}
                href={notificationParams.redirectTo}
                onClick={handleOnClick}
            >
                <span
                    dangerouslySetInnerHTML={{
                        __html: notificationParams.subtitle,
                    }}
                />
                {notificationParams.excerpt && (
                    <Excerpt>{notificationParams.excerpt}</Excerpt>
                )}
            </NotificationFeedItem>
        )
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
