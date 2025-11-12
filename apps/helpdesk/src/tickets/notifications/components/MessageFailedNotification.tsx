import { logEvent, SegmentEvent } from '@repo/logging'

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
    const { customer, ticket } = notification.payload

    return (
        <Content
            {...props}
            icon={{ type: ERROR_ICON }}
            title="Message not delivered"
            url={`/app/ticket/${ticket.id}`}
            onClick={() => {
                onClick?.()
                logEvent(SegmentEvent.FailedMessageNotification, {
                    ticketId: ticket.id,
                })
            }}
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
