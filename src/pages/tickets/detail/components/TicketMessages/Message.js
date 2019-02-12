//@flow
import React from 'react'
import classNamesBind from 'classnames/bind'

import {TicketMessage, isFailed, isPending, hasFailedAction} from '../../../../../models/ticketElement'

import Actions from './Actions'
import Body from './Body'
import Attachments from './Attachments'
import Errors from './Errors'
import SourceDetails from './SourceDetails'
import css from './Message.less'

const classNames = classNamesBind.bind(css)

type Props = {
    message: TicketMessage,
    ticketId: number,
    setStatus: () => void,
    showSourceDetails: boolean,
    isLastRead: boolean,
    timezone: string
}

export default (props: Props) => {
    const {message} = props
    const hasError = isFailed(message)
    return (
        <div
            className={classNames('wrapper', {
                hasSourceDetails: props.showSourceDetails
            })}
        >
            {props.showSourceDetails && (
                <SourceDetails
                    className={classNames('sourceDetails', {
                        internal: !message.public
                    })}
                    message={message}
                    timezone={props.timezone}
                    isLastRead={props.isLastRead}
                />
            )}
            <Body
                message={message}
                hasError={hasError}
            />
            <Attachments message={message}/>
            <Actions message={message}/>
            <Errors
                message={message}
                ticketId={props.ticketId}
                loading={isPending(message)}
                hasActionError={hasFailedAction(message)}
                setStatus={props.setStatus}
            />
        </div>
    )
}
