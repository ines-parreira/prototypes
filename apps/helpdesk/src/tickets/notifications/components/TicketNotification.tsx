import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { Excerpt, NotificationFeedItem, Subject } from '@repo/notifications'
import { ticketMessageSourceToIconName } from '@repo/tickets'

import { Box, Text } from '@gorgias/axiom'

import {
    Content,
    Subject as LegacySubject,
    Subtitle,
} from 'common/notifications'
import type { ContentProps, Notification } from 'common/notifications'

import type { TicketPayload } from '../types'

type Props = {
    notification: Notification<TicketPayload>
} & ContentProps

const subIcons: Record<string, ContentProps['subIcon']> = {
    'ticket.assigned': { family: 'fill', name: 'person' },
    'ticket.snooze-expired': { name: 'snooze' },
}

const titleOverrides: Record<string, string> = {
    'ticket.assigned': `You've been assigned to a ticket`,
    'ticket.snooze-expired': 'Snooze expired',
}

export default function TicketNotification({ notification, ...props }: Props) {
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()
    const { sender, ticket } = notification.payload
    const title = titleOverrides[notification.type] || 'New message'

    if (hasWayfindingMS1Flag) {
        return (
            <NotificationFeedItem
                notification={notification}
                icon={ticketMessageSourceToIconName(ticket.channel)}
                title={title}
                href={`/app/ticket/${ticket.id}`}
                onClick={props.onClick}
            >
                <Box gap="xxs" flexDirection="column">
                    <Text>
                        <Subject>{ticket.subject}</Subject>
                        {sender?.name && (
                            <>
                                {' '}
                                from <Subject>{sender.name}</Subject>
                            </>
                        )}
                    </Text>
                    {!!ticket.excerpt && <Excerpt>{ticket.excerpt}</Excerpt>}
                </Box>
            </NotificationFeedItem>
        )
    }

    return (
        <Content
            {...props}
            icon={{ status: ticket.status, type: ticket.channel }}
            subIcon={subIcons[notification.type]}
            title={title}
            url={`/app/ticket/${ticket.id}`}
        >
            <Subtitle>
                {/* the extra space here is intentional */}
                <LegacySubject>{ticket.subject} </LegacySubject>
                {!!sender?.name && (
                    <>
                        {' '}
                        from <strong>{sender.name}</strong>
                    </>
                )}
            </Subtitle>
            {!!ticket.excerpt && <Excerpt>{ticket.excerpt}</Excerpt>}
        </Content>
    )
}
