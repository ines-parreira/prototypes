//@flow
import classNamesBind from 'classnames/bind'
import React from 'react'

import {
    hasFailedAction,
    isFailed,
    isPending,
    TicketMessage,
} from '../../../../../models/ticket'

import Actions from './Actions'
import Attachments from './Attachments'
import Body from './Body'
import Errors from './Errors'
import css from './Message.less'
import SourceDetailsHeader from './SourceDetailsHeader'

const classNames = classNamesBind.bind(css)

type Props = {
    message: TicketMessage,
    ticketId: number,
    setStatus?: (status: string) => void,
    showSourceDetails: boolean,
    isLastRead: boolean,
    timezone: string,
}

export default function Message(props: Props) {
    const {message} = props
    const hasError = isFailed(message)

    const contentToRender = (
        <div
            className={classNames('wrapper', {
                hasSourceDetails: props.showSourceDetails,
            })}
        >
            {props.showSourceDetails && (
                <SourceDetailsHeader
                    className={classNames('sourceDetails', {
                        internal: !message.public,
                    })}
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
