import classNames from 'classnames'
import React, {useState} from 'react'

import {hasFailedAction, isFailed, isPending} from 'models/ticket/predicates'
import {TicketMessage} from 'models/ticket/types'

import TicketMessageEmbeddedCard from 'pages/common/components/TicketMessageEmbeddedCard/TicketMessageEmbeddedCard'

import Actions from './Actions'
import Attachments from './Attachments'
import Body from './Body'
import Errors from './Errors'
import css from './Message.less'
import SourceDetailsHeader from './SourceDetailsHeader'

type Props = {
    message: TicketMessage
    setStatus?: (status: string) => void
    showMessageStatusIndicator?: boolean
    showSourceDetails: boolean
    ticketId: number
    timezone: string
}

export default function Message({
    message,
    setStatus,
    showMessageStatusIndicator,
    showSourceDetails,
    ticketId,
    timezone,
}: Props) {
    const hasError = isFailed(message)
    const [isOver, setIsOver] = useState(false)

    return (
        <div
            className={classNames(css.wrapper, {
                [css.hasSourceDetails]: showSourceDetails,
            })}
            onMouseEnter={() => setIsOver(true)}
            onMouseLeave={() => setIsOver(false)}
        >
            {showSourceDetails && (
                <SourceDetailsHeader
                    className={css.sourceDetails}
                    contentClassName={css.sourceDetailsContent}
                    message={message}
                    timezone={timezone}
                    displayMessageStatusIndicator={
                        isOver || showMessageStatusIndicator
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
                ticketId={ticketId}
                loading={isPending(message)}
                hasActionError={hasFailedAction(message)}
                setStatus={setStatus}
            />
        </div>
    )
}
