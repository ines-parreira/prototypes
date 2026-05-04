import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { Excerpt, NotificationFeedItem } from '@repo/notifications'
import { ticketMessageSourceToIconName } from '@repo/tickets'

import { Text } from '@gorgias/axiom'

import { TicketMessageSourceType } from 'business/types/ticket'
import {
    Content,
    Excerpt as LegacyExcerpt,
    Subtitle,
} from 'common/notifications'
import type { ContentProps, Notification } from 'common/notifications'

import type { EmailDomainPayload } from '../types'

type Props = {
    notification: Notification<EmailDomainPayload>
} & ContentProps

export default function DomainVerificationNotification({
    notification,
    ...props
}: Props) {
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()
    const { domain } = notification.payload

    if (hasWayfindingMS1Flag) {
        return (
            <NotificationFeedItem
                notification={notification}
                icon={ticketMessageSourceToIconName(
                    TicketMessageSourceType.SystemMessage,
                )}
                title="Domain verification complete"
                to="/app/settings/channels/email"
                onClick={props.onClick}
            >
                <Text>
                    <strong>System update</strong> from <strong>Gorgias</strong>
                </Text>
                <Excerpt>
                    Your domain has been verified! You can now send emails with
                    Gorgias using addresses ending in @{domain}.
                </Excerpt>
            </NotificationFeedItem>
        )
    }

    return (
        <Content
            {...props}
            icon={{ type: TicketMessageSourceType.SystemMessage }}
            title="Domain verification complete"
            url="/app/settings/channels/email"
        >
            <Subtitle>
                <strong>System update</strong> from <strong>Gorgias</strong>
            </Subtitle>
            <LegacyExcerpt>
                Your domain has been verified! You can now send emails with
                Gorgias using addresses ending in @{domain}.
            </LegacyExcerpt>
        </Content>
    )
}
