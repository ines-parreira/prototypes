import React, {useMemo} from 'react'

import {Notification} from '../types'

import css from './Subtitle.less'

type Props = {
    notification: Notification
}

export default function Subtitle({notification}: Props) {
    const senderInfo = useMemo(() => {
        if (!('sender' in notification.payload)) return null

        const {sender} = notification.payload
        return (
            <>
                {' '}
                from <strong>{sender.name}</strong>
            </>
        )
    }, [notification.payload])

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
            {senderInfo}
        </p>
    )
}
