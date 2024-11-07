import React from 'react'

import type {Notification} from '../types'
import Excerpt from './Excerpt'
import NotificationContent from './NotificationContent'
import type {ParentProps} from './NotificationContent'
import Subject from './Subject'
import Subtitle from './Subtitle'

type Props = {
    notification: Notification
} & ParentProps

export default function UserMentionedNotification({
    notification,
    ...props
}: Props) {
    if (notification.type !== 'user.mentioned') return null

    const {sender, ticket} = notification.payload

    return (
        <NotificationContent
            {...props}
            icon={{type: ticket.channel}}
            subIcon={{color: '--feedback-warning-3', name: 'alternate_email'}}
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
                <Subject>{ticket.subject}</Subject>
            </Subtitle>
            {!!ticket.excerpt && <Excerpt>{ticket.excerpt}</Excerpt>}
        </NotificationContent>
    )
}
