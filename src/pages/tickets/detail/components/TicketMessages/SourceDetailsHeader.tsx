import classnames from 'classnames'
import React, {ReactNode, useState, createContext} from 'react'
import {useMeasure} from 'react-use'

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

    const collapseActions = width < 400
    const collapseIntents = width < 300

    const {message, isLastRead, timezone, isMessageDeleted} = props
    let actionHeader: ReactNode
    let infoWidget: ReactNode

    if (!isMessageDeleted) {
        actionHeader = (
            <SourceDetailsContext.Provider value={{setFocus}}>
                <SourceActionsHeader
                    message={message}
                    collapseActions={collapseActions}
                    collapseIntents={collapseIntents}
                />
            </SourceDetailsContext.Provider>
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
        <div
            className={classnames(css.wrapper, props.className)}
            data-focus={focus}
            ref={ref as React.LegacyRef<HTMLDivElement>}
        >
            <div className={classnames(css.content, props.contentClassName)}>
                {actionHeader}
                {message.from_agent && isLastRead && (
                    <SeenIndicator
                        openedDatetime={message.opened_datetime}
                        timezone={timezone}
                    />
                )}
                {infoWidget}
            </div>
        </div>
    )
}
