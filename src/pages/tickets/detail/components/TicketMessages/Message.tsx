import React, { useState } from 'react'

import classNames from 'classnames'

import { TicketMessage as TicketMessageType } from '@gorgias/helpdesk-types'

import { hasFailedAction, isFailed, isPending } from 'models/ticket/predicates'
import { TicketMessage } from 'models/ticket/types'
import Actions from 'tickets/ticket-detail/components/MessageActions'
import { MessageAttachments } from 'tickets/ticket-detail/components/MessageAttachments'

import Body from './Body'
import Errors from './Errors'
import ReplyDetailsCard from './ReplyDetailsCard'
import SourceDetailsHeader from './SourceDetailsHeader'

import css from './Message.less'

type Props = {
    message: TicketMessage
    setStatus?: (status: string) => void
    showMessageStatusIndicator?: boolean
    showSourceDetails: boolean
    ticketId: number
    isAIAgentMessage: boolean
    messagePosition: number
}

export default function Message({
    message,
    setStatus,
    showMessageStatusIndicator,
    showSourceDetails,
    ticketId,
    isAIAgentMessage,
    messagePosition,
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
                    showMessageStatusIndicator={
                        isOver || showMessageStatusIndicator
                    }
                    hideTimestamp={!isOver}
                    showIntents={isOver}
                />
            )}
            {!!message?.meta?.replied_to && (
                <ReplyDetailsCard reply={message.meta.replied_to} />
            )}
            <Body
                message={message}
                hasError={hasError}
                messagePosition={messagePosition}
            />
            <MessageAttachments message={message as TicketMessageType} />
            {!isAIAgentMessage && (
                <Actions message={message as TicketMessageType} />
            )}
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
