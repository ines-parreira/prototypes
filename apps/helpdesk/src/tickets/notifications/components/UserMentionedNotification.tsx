import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { Excerpt, NotificationFeedItem, Subject } from '@repo/notifications'

import { Box, IconBox, Text } from '@gorgias/axiom'

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

export default function UserMentionedNotification({
    notification,
    ...props
}: Props) {
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()
    const { sender, ticket } = notification.payload

    if (hasWayfindingMS1Flag) {
        return (
            <NotificationFeedItem
                notification={notification}
                icon={
                    <IconBox
                        icon="mention"
                        alt="mention"
                        size="sm"
                        color="coral"
                    />
                }
                title="New mention"
                href={`/app/ticket/${ticket.id}`}
                onClick={props.onClick}
            >
                <Box gap="xxs" flexDirection="column">
                    {sender ? (
                        <Text size="sm">
                            <Subject>{sender.name}</Subject> mentioned you in{' '}
                            <Subject>{ticket.subject}</Subject>
                        </Text>
                    ) : (
                        <Text size="sm">
                            You were mentioned in{' '}
                            <Subject>{ticket.subject}</Subject>
                        </Text>
                    )}
                    {!!ticket.excerpt && <Excerpt>{ticket.excerpt}</Excerpt>}
                </Box>
            </NotificationFeedItem>
        )
    }

    return (
        <Content
            {...props}
            icon={{ type: ticket.channel }}
            subIcon={{ color: '--feedback-warning-3', name: 'alternate_email' }}
            title="New mention"
            url={`/app/ticket/${ticket.id}`}
        >
            <Subtitle>
                {!!sender ? (
                    <>
                        <strong>{sender.name}</strong> mentioned you in{' '}
                    </>
                ) : (
                    <>You were mentioned in </>
                )}
                <LegacySubject>{ticket.subject}</LegacySubject>
            </Subtitle>
            {!!ticket.excerpt && <Excerpt>{ticket.excerpt}</Excerpt>}
        </Content>
    )
}
