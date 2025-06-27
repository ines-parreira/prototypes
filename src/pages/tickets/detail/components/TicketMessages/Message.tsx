import { useState } from 'react'

import cn from 'classnames'

import { TicketMessage as TicketMessageType } from '@gorgias/helpdesk-types'

import { hasFailedAction, isFailed, isPending } from 'models/ticket/predicates'
import { TicketMessage } from 'models/ticket/types'
import { MessageActions } from 'tickets/ticket-detail/components/MessageActions'
import { MessageAttachments } from 'tickets/ticket-detail/components/MessageAttachments'
import { MessageMetadata } from 'tickets/ticket-detail/components/MessageMetadata'

import Body from './Body'
import Errors from './Errors'
import ReplyDetailsCard from './ReplyDetailsCard'
import SourceActionsHeader from './SourceActionsHeader'

import css from './Message.less'

type Props = {
    message: TicketMessage
    setStatus?: (status: string) => void
    showSourceDetails: boolean
    ticketId: number
    isAIAgentMessage: boolean
    messagePosition: number
}

export default function Message({
    message,
    setStatus,
    showSourceDetails,
    ticketId,
    isAIAgentMessage,
    messagePosition,
}: Props) {
    const hasError = isFailed(message)
    const [isOver, setIsOver] = useState(false)

    return (
        <div
            className={cn(css.wrapper, {
                [css.hasSourceDetails]: showSourceDetails,
            })}
            onMouseEnter={() => setIsOver(true)}
            onMouseLeave={() => setIsOver(false)}
        >
            {showSourceDetails && (
                <div
                    className={cn(css.rightWrapper, {
                        [css.visible]: isOver,
                    })}
                >
                    <SourceActionsHeader message={message} />
                    <MessageMetadata message={message as TicketMessageType} />
                </div>
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
                <MessageActions message={message as TicketMessageType} />
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
