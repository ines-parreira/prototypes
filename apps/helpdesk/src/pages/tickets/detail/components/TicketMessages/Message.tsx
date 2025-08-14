import { useMemo, useState } from 'react'

import cn from 'classnames'

import { TicketMessage as TicketMessageType } from '@gorgias/helpdesk-types'

import { hasFailedAction, isFailed, isPending } from 'models/ticket/predicates'
import { TicketMessage } from 'models/ticket/types'
import { useTicketMessageTranslations } from 'tickets/core/hooks/useTicketMessageTranslations'
import { MessageActions } from 'tickets/ticket-detail/components/MessageActions'
import { MessageAttachments } from 'tickets/ticket-detail/components/MessageAttachments'
import { MessageMetadata } from 'tickets/ticket-detail/components/MessageMetadata'

import Body from './Body'
import Errors from './Errors'
import ReplyDetailsCard from './ReplyDetailsCard'
import SourceActionsHeader from './SourceActionsHeader'
import { useTicketMessageTranslationDisplay } from './TicketMessagesTranslationDisplay/context/useTicketMessageTranslationDisplay'

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

    const { ticketMessagesTranslationMap } = useTicketMessageTranslations({
        ticket_id: ticketId,
    })
    const { getTicketMessageTranslationDisplay } =
        useTicketMessageTranslationDisplay()

    const messageTranslations = useMemo(() => {
        if (!message?.id) return
        return ticketMessagesTranslationMap[message.id]
    }, [message.id, ticketMessagesTranslationMap])

    const displayedMessage = useMemo(() => {
        if (!message?.id) return message
        if (
            getTicketMessageTranslationDisplay(message.id) === 'translated' &&
            messageTranslations
        ) {
            return {
                ...message,
                stripped_html: messageTranslations?.stripped_html ?? null,
                stripped_text: messageTranslations?.stripped_text ?? null,
            }
        }
        return message
    }, [getTicketMessageTranslationDisplay, message, messageTranslations])

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
                    <SourceActionsHeader message={displayedMessage} />
                    <MessageMetadata
                        message={displayedMessage as TicketMessageType}
                    />
                </div>
            )}
            {!!displayedMessage?.meta?.replied_to && (
                <ReplyDetailsCard reply={displayedMessage.meta.replied_to} />
            )}
            <Body
                message={displayedMessage}
                hasError={hasError}
                messagePosition={messagePosition}
            />
            <MessageAttachments
                message={displayedMessage as TicketMessageType}
            />
            {!isAIAgentMessage && (
                <MessageActions
                    message={displayedMessage as TicketMessageType}
                />
            )}
            <Errors
                message={displayedMessage}
                ticketId={ticketId}
                loading={isPending(displayedMessage)}
                hasActionError={hasFailedAction(displayedMessage)}
                setStatus={setStatus}
            />
        </div>
    )
}
