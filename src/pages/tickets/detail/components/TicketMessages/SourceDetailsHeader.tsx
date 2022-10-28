import classnames from 'classnames'
import React, {ReactNode, useState, createContext, useMemo} from 'react'
import {useDebounce, useMeasure} from 'react-use'

import _noop from 'lodash/noop'

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
    contentClassName?: string
    isMessageDeleted?: boolean
    showIntents?: boolean
    displayMessageStatusIndicator?: boolean
    hideTimestamp?: boolean
}

const From = ({label, children}: {label: string; children?: ReactNode}) => (
    <span className={classnames(css.from)}>
        <span className={css.fromLabel}>{label}</span>{' '}
        <span className={css.fromValue}>{children}</span>
    </span>
)

export const SourceDetailsContext = createContext({setFocus: _noop})

export default function SourceDetailsHeader(props: Props) {
    const [focus, setFocus] = useState(false)

    const [ref, {width}] = useMeasure()
    const [debouncedWidth, setDebouncedWidth] = useState(width)

    useDebounce(() => setDebouncedWidth(width), 300, [width])

    const {
        message,
        timezone,
        isMessageDeleted,
        displayMessageStatusIndicator = false,
        hideTimestamp = false,
    } = props

    const actionHeader = useMemo(() => {
        const collapseActions = debouncedWidth < 400
        const collapseIntents = debouncedWidth < 300

        if (!isMessageDeleted) {
            return (
                <SourceDetailsContext.Provider value={{setFocus}}>
                    <SourceActionsHeader
                        message={message}
                        collapseActions={collapseActions}
                        collapseIntents={collapseIntents}
                    />
                </SourceDetailsContext.Provider>
            )
        }

        return null
    }, [isMessageDeleted, message, debouncedWidth])

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
                className={classnames({[css.hideTimestamp]: hideTimestamp})}
            />
        )
    }, [message?.meta, message.created_datetime, hideTimestamp])

    return (
        <div
            className={classnames(css.wrapper, props.className)}
            data-focus={focus}
            ref={ref as React.LegacyRef<HTMLDivElement>}
        >
            <div className={classnames(css.content, props.contentClassName)}>
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
