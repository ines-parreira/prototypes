import classNames from 'classnames'
import React, {useState} from 'react'

import {hasFailedAction, isFailed, isPending} from 'models/ticket/predicates'
import {TicketMessage} from 'models/ticket/types'

import TicketMessageEmbeddedCard from '../../../../common/components/TicketMessageEmbeddedCard/TicketMessageEmbeddedCard'
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
    showMessageStatusIndicator?: boolean
}

export default function Message(props: Props) {
    const {message} = props
    const hasError = isFailed(message)
    const [isOver, setIsOver] = useState(false)

    const contentToRender = (
        <div
            className={classNames(css.wrapper, {
                [css.hasSourceDetails]: props.showSourceDetails,
            })}
            onMouseEnter={() => setIsOver(true)}
            onMouseLeave={() => setIsOver(false)}
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
                    displayMessageStatusIndicator={
                        isOver || props.showMessageStatusIndicator
                    }
                    hideTimestamp={!isOver}
                    showIntents={isOver}
                />
            )}
            {!!message?.replied_to && (
                <TicketMessageEmbeddedCard
                    integrationId={message.replied_to.integration_id}
                    messageText={message.replied_to.body_text}
                    source={message.replied_to.source}
                    sender={message.replied_to.customer}
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
