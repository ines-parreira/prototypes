import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { NotificationFeedItem, Subject } from '@repo/notifications'

import { Icon, Text } from '@gorgias/axiom'

import type { ContentProps, Notification } from 'common/notifications'
import { Content, Subtitle } from 'common/notifications'
import { ERROR_ICON } from 'pages/common/components/SourceIcon'
import type { TicketPayload } from 'tickets/notifications/types'

type Props = {
    notification: Notification<TicketPayload>
} & ContentProps

const MessageFailedNotification = ({
    notification,
    onClick,
    ...props
}: Props) => {
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()
    const { customer, ticket } = notification.payload

    const handleOnClick = () => {
        onClick?.()
        logEvent(SegmentEvent.FailedMessageNotification, {
            ticketId: ticket.id,
        })
    }

    if (hasWayfindingMS1Flag) {
        return (
            <NotificationFeedItem
                notification={notification}
                icon={<Icon name="octagon-error" color="red" />}
                title="Message not delivered"
                href={`/app/ticket/${ticket.id}`}
                onClick={handleOnClick}
            >
                {customer?.name ? (
                    <Text>
                        Message to <Subject>{customer.name}</Subject>{' '}
                        didn&apos;t deliver. Please try again.
                    </Text>
                ) : (
                    <Text>Message didn&apos;t deliver. Please try again.</Text>
                )}
            </NotificationFeedItem>
        )
    }

    return (
        <Content
            {...props}
            icon={{ type: ERROR_ICON }}
            title="Message not delivered"
            url={`/app/ticket/${ticket.id}`}
            onClick={handleOnClick}
        >
            {customer?.name ? (
                <Subtitle>
                    Message to <strong>{customer?.name}</strong> didn’t deliver.
                    Please try again.
                </Subtitle>
            ) : (
                <Subtitle>Message didn’t deliver. Please try again.</Subtitle>
            )}
        </Content>
    )
}

export default MessageFailedNotification
