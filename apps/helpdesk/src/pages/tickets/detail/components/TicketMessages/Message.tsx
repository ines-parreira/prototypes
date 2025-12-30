import { useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import {
    DisplayedContent,
    FetchingState,
    useCurrentUserLanguagePreferences,
    useTicketMessageDisplayState,
    useTicketMessageTranslations,
} from '@repo/tickets'
import cn from 'classnames'

import type {
    Language,
    TicketMessage as TicketMessageType,
} from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'
import { hasFailedAction, isFailed, isPending } from 'models/ticket/predicates'
import type { TicketMessage } from 'models/ticket/types'
import { getTicket } from 'state/ticket/selectors'
import { MessageActions } from 'tickets/ticket-detail/components/MessageActions'
import { MessageAttachments } from 'tickets/ticket-detail/components/MessageAttachments'

import { useMessageQuote } from '../MessageQuoteContext'
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

    const { toggleQuote, expandedQuotes } = useMessageQuote()

    const isMessageExpanded = useMemo(
        () => !!message.id && expandedQuotes.includes(message.id),
        [message.id, expandedQuotes],
    )

    const { getMessageTranslation } = useTicketMessageTranslations({
        ticket_id: ticketId,
    })

    const { display, fetchingState } = useTicketMessageDisplayState(
        message?.id ?? 0,
    )
    const { shouldShowTranslatedContent } = useCurrentUserLanguagePreferences()

    const messageTranslations = useMemo(
        () => (message?.id ? getMessageTranslation(message.id) : null),
        [message?.id, getMessageTranslation],
    )

    const displayedMessage = useMemo(() => {
        if (!message?.id) return message
        if (!shouldShowTranslatedContent(ticket.language as Language))
            return message

        if (display === DisplayedContent.Translated && messageTranslations) {
            return {
                ...message,
                translations: messageTranslations,
            }
        }
        return message
    }, [
        message,
        messageTranslations,
        display,
        shouldShowTranslatedContent,
        ticket,
    ])

    const showTranslationsDropdown = useMemo(
        () =>
            !isMessageExpanded &&
            hasMessagesTranslation &&
            shouldShowTranslatedContent(ticket.language as Language) &&
            (!!messageTranslations || fetchingState !== FetchingState.Idle),
        [
            isMessageExpanded,
            hasMessagesTranslation,
            messageTranslations,
            fetchingState,
            ticket.language,
            shouldShowTranslatedContent,
        ],
    )

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
                toggleQuote={toggleQuote}
                isMessageExpanded={isMessageExpanded}
            />
            {showTranslationsDropdown && message.id && (
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
