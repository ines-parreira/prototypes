import { useMemo, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import cn from 'classnames'

import {
    Language,
    TicketMessage as TicketMessageType,
} from '@gorgias/helpdesk-types'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { hasFailedAction, isFailed, isPending } from 'models/ticket/predicates'
import { TicketMessage } from 'models/ticket/types'
import { getTicket } from 'state/ticket/selectors'
import { useCurrentUserPreferredLanguage } from 'tickets/core/hooks/translations/useCurrentUserPreferredLanguage'
import { useTicketMessageTranslations } from 'tickets/core/hooks/translations/useTicketMessageTranslations'
import { MessageActions } from 'tickets/ticket-detail/components/MessageActions'
import { MessageAttachments } from 'tickets/ticket-detail/components/MessageAttachments'
import { DisplayedContent } from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/ticketMessageTranslationDisplayContext'
import { useTicketMessageTranslationDisplay } from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/useTicketMessageTranslationDisplay'

import Body from './Body'
import Errors from './Errors'
import ReplyDetailsCard from './ReplyDetailsCard'
import SourceActionsHeader from './SourceActionsHeader'
import { TranslationsDropdown } from './TranslationsDropdown/TranslationsDropdown'

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
    const hasMessagesTranslation = useFlag(FeatureFlagKey.MessagesTranslations)

    const hasError = isFailed(message)
    const [isOver, setIsOver] = useState(false)
    const ticket = useAppSelector(getTicket)

    const { getMessageTranslation } = useTicketMessageTranslations({
        ticket_id: ticketId,
    })

    const { getTicketMessageTranslationDisplay } =
        useTicketMessageTranslationDisplay()
    const { shouldShowTranslatedContent } = useCurrentUserPreferredLanguage()

    const messageTranslations = useMemo(
        () => (message?.id ? getMessageTranslation(message.id) : null),
        [message?.id, getMessageTranslation],
    )

    const displayedMessage = useMemo(() => {
        if (!message?.id) return message
        if (!shouldShowTranslatedContent(ticket.language as Language))
            return message

        const displayType = getTicketMessageTranslationDisplay(message.id)
        if (
            displayType.display === DisplayedContent.Translated &&
            messageTranslations
        ) {
            return {
                ...message,
                stripped_html: messageTranslations?.stripped_html ?? null,
                stripped_text: messageTranslations?.stripped_text ?? null,
            }
        }
        return message
    }, [
        message,
        messageTranslations,
        getTicketMessageTranslationDisplay,
        shouldShowTranslatedContent,
        ticket,
    ])

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
            {hasMessagesTranslation &&
                !!messageTranslations &&
                message.id &&
                shouldShowTranslatedContent(ticket.language as Language) && (
                    <TranslationsDropdown messageId={message.id} />
                )}
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
