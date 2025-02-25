import React, { ReactNode, useMemo, useState } from 'react'

import classnames from 'classnames'

import useDebouncedValue from 'hooks/useDebouncedValue'
import useMeasure from 'hooks/useMeasure'
import { TicketMessage } from 'models/ticket/types'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import SeenIndicator from './SeenIndicator'
import SourceActionsHeader from './SourceActionsHeader'
import SourceDetailsContext from './SourceDetailsContext'

import css from './SourceDetails.less'

type Props = {
    className?: string
    contentClassName?: string
    displayMessageStatusIndicator?: boolean
    hideTimestamp?: boolean
    isMessageDeleted?: boolean
    message: TicketMessage
    showIntents?: boolean
    timezone: string
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
    displayMessageStatusIndicator = false,
    hideTimestamp = false,
    isMessageDeleted,
    message,
    showIntents = true,
    timezone,
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
                        message={message}
                        collapseActions={collapseActions}
                        collapseIntents={collapseIntents}
                    />
                </SourceDetailsContext.Provider>
            )
        }

        return null
    }, [isMessageDeleted, message, debouncedWidth, showIntents])

    const infoWidget = useMemo(() => {
        if (message?.meta?.is_duplicated) {
            return (
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
        }
        return (
            <DatetimeLabel
                dateTime={message.created_datetime}
                className={classnames({ [css.hideTimestamp]: hideTimestamp })}
            />
        )
    }, [message?.meta, message.created_datetime, hideTimestamp])

    return (
        <div
            className={classnames(css.wrapper, className)}
            data-focus={focus}
            ref={ref as React.LegacyRef<HTMLDivElement>}
        >
            <div className={classnames(css.content, contentClassName)}>
                {actionHeader}
                {message.from_agent && message.id && (
                    <SeenIndicator
                        displayMessageStatusIndicator={
                            displayMessageStatusIndicator
                        }
                        iconElementId={message.id}
                        openedDatetime={message.opened_datetime}
                        timezone={timezone}
                    />
                )}
                {infoWidget}
            </div>
        </div>
    )
}
