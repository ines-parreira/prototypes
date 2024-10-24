import classNames from 'classnames'
import React, {useState} from 'react'

import {hasFailedAction, isFailed, isPending} from 'models/ticket/predicates'
import {TicketMessage} from 'models/ticket/types'

import Actions from './Actions'
import Attachments from './Attachments'
import Body from './Body'
import Errors from './Errors'
import css from './Message.less'
import ReplyDetailsCard from './ReplyDetailsCard'
import SourceDetailsHeader from './SourceDetailsHeader'

type Props = {
    message: TicketMessage
    setStatus?: (status: string) => void
    showMessageStatusIndicator?: boolean
    showSourceDetails: boolean
    ticketId: number
    timezone: string
    isAIAgentMessage: boolean
}

export default function Message({
    message,
    setStatus,
    showMessageStatusIndicator,
    showSourceDetails,
    ticketId,
    timezone,
    isAIAgentMessage,
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
            {!!message?.meta?.replied_to && (
                <ReplyDetailsCard reply={message.meta.replied_to} />
            )}
            <Body message={message} hasError={hasError} />
            <Attachments message={message} />
            {!isAIAgentMessage && <Actions message={message} />}
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
