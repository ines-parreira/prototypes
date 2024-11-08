import React from 'react'

import {Content, Excerpt, Subject, Subtitle} from 'common/notifications'
import type {ContentProps, Notification} from 'common/notifications'

type Props = {
    notification: Notification
} & ContentProps

export default function UserMentionedNotification({
    notification,
    ...props
}: Props) {
    if (notification.type !== 'user.mentioned') return null

    const {sender, ticket} = notification.payload

    return (
        <Content
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
        </Content>
    )
}
