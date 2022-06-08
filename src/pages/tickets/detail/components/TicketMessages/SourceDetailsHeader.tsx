import classnames from 'classnames'
import React, {ReactNode} from 'react'

import {TicketMessage} from 'models/ticket/types'
import {DatetimeLabel} from 'pages/common/utils/labels'

import SeenIndicator from './SeenIndicator'
import SourceActionsHeader from './SourceActionsHeader'
import css from './SourceDetails.less'

type Props = {
    message: TicketMessage
    isLastRead: boolean
    timezone: string
    className?: string
    isMessageDeleted?: boolean
    collapseActions?: boolean
}

const From = ({label, children}: {label: string; children?: ReactNode}) => (
    <span className={classnames(css.from)}>
        <span className={css.fromLabel}>{label}</span>{' '}
        <span className={css.fromValue}>{children}</span>
    </span>
)

export default function SourceDetailsHeader(props: Props) {
    const {message, isLastRead, timezone, isMessageDeleted, collapseActions} =
        props
    let actionHeader: ReactNode
    let infoWidget: ReactNode

    if (!isMessageDeleted) {
        actionHeader = (
            <SourceActionsHeader
                message={message}
                collapseActions={collapseActions}
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
