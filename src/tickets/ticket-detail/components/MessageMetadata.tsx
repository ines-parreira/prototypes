import { useMemo } from 'react'

import classnames from 'classnames'

import { TicketMessage } from '@gorgias/helpdesk-types'

import { TicketMessage as TicketMessage_DEPRECATED } from 'models/ticket/types'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import { MessageStatusIndicator } from './MessageStatusIndicator'

import css from './MessageMetadata.less'

type Props = {
    message: TicketMessage
}

export function MessageMetadata({ message }: Props) {
    const meta = message.meta as TicketMessage_DEPRECATED['meta']
    const infoWidget = useMemo(() => {
        if (meta?.is_duplicated) {
            return (
                <GoToOriginalTicket
                    originalTicketIdURL={meta.private_reply!.original_ticket_id}
                />
            )
        }
        return <DatetimeLabel dateTime={message.created_datetime} />
    }, [meta, message.created_datetime])

    return (
        <div className={classnames(css.wrapper)}>
            <MessageStatusIndicator message={message} />
            {infoWidget}
        </div>
    )
}

const GoToOriginalTicket = ({
    originalTicketIdURL,
}: {
    originalTicketIdURL: string | undefined
}) => (
    <span className={classnames(css.from)}>
        <span className={css.fromLabel}>go to</span>{' '}
        <span className={css.fromValue}>
            <a
                target="_blank"
                href={originalTicketIdURL}
                rel="noopener noreferrer"
            >
                ticket
            </a>
        </span>
    </span>
)
