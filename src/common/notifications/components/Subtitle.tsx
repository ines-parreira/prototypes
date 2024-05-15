import React from 'react'

import {Notification} from '../types'

import css from './Subtitle.less'

type Props = {
    notification: Notification
}

export default function Subtitle({notification}: Props) {
    if (notification.type === 'user.mentioned') {
        const {sender, ticket} = notification.payload
        return (
            <p className={css.subtitle}>
                {!!sender ? (
                    <>
                        <strong>{sender.name}</strong> mentioned you in
                    </>
                ) : (
                    <>You were mentioned in</>
                )}{' '}
                <strong className={css.subject}>{ticket.subject}</strong>
            </p>
        )
    }

    const {ticket} = notification.payload

    return (
        <p className={css.subtitle}>
            <strong className={css.subject}>{ticket.subject} </strong>
            {!!ticket.sender && (
                <>
                    {' '}
                    from <strong>{ticket.sender.name}</strong>
                </>
            )}
        </p>
    )
}
