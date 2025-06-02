import React, { ReactNode, useMemo, useState } from 'react'

import classnames from 'classnames'

import { TicketMessage } from '@gorgias/helpdesk-types'

import useDebouncedValue from 'hooks/useDebouncedValue'
import useMeasure from 'hooks/useMeasure'
import { TicketMessage as TicketMessage_DEPRECATED } from 'models/ticket/types'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import MessageStatusIndicator from 'tickets/ticket-detail/components/MessageStatusIndicator'

import SourceActionsHeader from './SourceActionsHeader'
import SourceDetailsContext from './SourceDetailsContext'

import css from './SourceDetails.less'

type Props = {
    className?: string
    contentClassName?: string
    showMessageStatusIndicator?: boolean
    hideTimestamp?: boolean
    isMessageDeleted?: boolean
    message: TicketMessage_DEPRECATED | TicketMessage
    showIntents?: boolean
}

const From = ({ label, children }: { label: string; children?: ReactNode }) => (
    <span className={classnames(css.from)}>
        <span className={css.fromLabel}>{label}</span>{' '}
        <span className={css.fromValue}>{children}</span>
    </span>
)

export default function SourceDetailsHeader({
    className,
    contentClassName,
    showMessageStatusIndicator = true,
    hideTimestamp = false,
    isMessageDeleted,
    message,
    showIntents = true,
}: Props) {
    const [focus, setFocus] = useState(false)

    const [ref, { width }] = useMeasure()
    const debouncedWidth = useDebouncedValue(width, 300)

    const actionHeader = useMemo(() => {
        const collapseActions = debouncedWidth < 400
        const collapseIntents = debouncedWidth < 300

        if (!isMessageDeleted) {
            return (
                <SourceDetailsContext.Provider value={{ setFocus }}>
                    <SourceActionsHeader
                        showIntents={showIntents}
                        message={message as TicketMessage_DEPRECATED}
                        collapseActions={collapseActions}
                        collapseIntents={collapseIntents}
                    />
                </SourceDetailsContext.Provider>
            )
        }

        return null
    }, [isMessageDeleted, message, debouncedWidth, showIntents])

    const meta = message.meta as TicketMessage_DEPRECATED['meta']

    const infoWidget = useMemo(() => {
        if (meta?.is_duplicated) {
            return (
                <From label="go to" key="ref-widget">
                    <a
                        target="_blank"
                        href={meta.private_reply!.original_ticket_id}
                        rel="noopener noreferrer"
                    >
                        ticket
                    </a>
                </From>
            )
        }
        return (
            <DatetimeLabel
                dateTime={message.created_datetime}
                className={classnames({ [css.hideTimestamp]: hideTimestamp })}
            />
        )
    }, [meta, message.created_datetime, hideTimestamp])

    return (
        <div
            className={classnames(css.wrapper, className)}
            data-focus={focus}
            ref={ref as React.LegacyRef<HTMLDivElement>}
        >
            <div className={classnames(css.content, contentClassName)}>
                {actionHeader}
                {showMessageStatusIndicator && (
                    <MessageStatusIndicator
                        message={message as TicketMessage}
                    />
                )}
                {infoWidget}
            </div>
        </div>
    )
}
