import classNames from 'classnames'
import React from 'react'

import {
    hasFailedAction,
    isFailed,
    isPending,
} from '../../../../../models/ticket/predicates'
import {TicketMessage} from '../../../../../models/ticket/types'

import Actions from './Actions'
import Attachments from './Attachments'
import Body from './Body'
import Errors from './Errors'
import css from './Message.less'
import SourceDetailsHeader from './SourceDetailsHeader'

type Props = {
    message: TicketMessage
    ticketId: number
    setStatus?: (status: string) => void
    showSourceDetails: boolean
    isLastRead: boolean
    timezone: string
}

export default function Message(props: Props) {
    const {message} = props
    const hasError = isFailed(message)

    const contentToRender = (
        <div
            className={classNames(css.wrapper, {
                [css.hasSourceDetails]: props.showSourceDetails,
            })}
        >
            {props.showSourceDetails && (
                <SourceDetailsHeader
                    className={classNames(css.sourceDetails, {
                        internal: !message.public,
                    })}
                    contentClassName={css.sourceDetailsContent}
                    message={message}
                    timezone={props.timezone}
                    isLastRead={props.isLastRead}
                />
            )}
            <Body message={message} hasError={hasError} />
            <Attachments message={message} />
            <Actions message={message} />
            <Errors
                message={message}
                ticketId={props.ticketId}
                loading={isPending(message)}
                hasActionError={hasFailedAction(message)}
                setStatus={props.setStatus}
            />
        </div>
    )

    return contentToRender
}
