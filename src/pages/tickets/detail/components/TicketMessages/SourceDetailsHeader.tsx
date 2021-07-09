import classnames from 'classnames'
import React, {ReactNode} from 'react'

import {TicketMessage} from '../../../../../models/ticket/types'
import {DatetimeLabel} from '../../../../common/utils/labels.js'

import SeenIndicator from './SeenIndicator'
import SourceActionsHeader from './SourceActionsHeader'
import css from './SourceDetails.less'

type Props = {
    message: TicketMessage
    isLastRead: boolean
    timezone: string
    className?: string
    isMessageDeleted?: boolean
}

const From = ({label, children}: {label: string; children?: ReactNode}) => (
    <span className={classnames(css.from)}>
        <span className={css.fromLabel}>{label}</span>{' '}
        <span className={css.fromValue}>{children}</span>
    </span>
)

export default function SourceDetailsHeader(props: Props) {
    const {message, isLastRead, timezone, isMessageDeleted} = props
    let actionHeader
    let infoWidget

    if (!isMessageDeleted) {
        actionHeader = (
            <SourceActionsHeader
                source={message.source}
                meta={message.meta!}
                integrationId={message.integration_id}
                messageId={message.message_id}
                fromAgent={message.from_agent}
                senderId={message.sender.id}
                ticketMessageId={message.id!}
                ticketId={message.ticket_id}
                bodyText={message.body_text}
                sender={message.sender}
                messageCreatedDatetime={message.created_datetime}
            />
        )
    }

    if (message?.meta?.is_duplicated) {
        infoWidget = (
            <From label="go to" key="ref-widget">
                <a
                    target="_blank"
                    href={message.meta.private_reply!.original_ticket_id}
                    rel="noopener noreferrer"
                >
                    ticket
                </a>
            </From>
        )
    } else {
        infoWidget = <DatetimeLabel dateTime={message.created_datetime} />
    }

    return (
        <div className={classnames(css.wrapper, props.className)}>
            {actionHeader}
            {message.from_agent && isLastRead && (
                <SeenIndicator
                    openedDatetime={message.opened_datetime}
                    timezone={timezone}
                />
            )}
            {infoWidget}
        </div>
    )
}
