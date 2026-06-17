import {
    FetchingState,
    useCurrentUserLanguagePreferences,
    useTicketMessageDisplayState,
    useTicketMessageTranslations,
} from '@repo/tickets'
import { isNumber } from 'lodash'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import { useExpandedMessages } from '#ticket-messages/context/ExpandedMessages'

type UseMessageTranslationsParams = {
    messageId: number | null | undefined
    ticketId: number
    showTranslations?: boolean
}

export function useMessageTranslations({
    messageId,
    ticketId,
    showTranslations = true,
}: UseMessageTranslationsParams) {
    const { data: ticketData } = useGetTicket(ticketId)
    const ticketLanguage = ticketData?.data?.language
    const { shouldShowTranslatedContent } = useCurrentUserLanguagePreferences()
    const { getMessageTranslation } = useTicketMessageTranslations({
        ticket_id: ticketId,
    })
    const {
        display,
        fetchingState,
        hasRegeneratedOnce,
        setTicketMessageTranslationDisplay,
    } = useTicketMessageDisplayState(messageId ?? 0)
    const { isMessageExpanded } = useExpandedMessages()

    const normalizedMessageId = isNumber(messageId) ? messageId : null
    const isExpanded = normalizedMessageId
        ? isMessageExpanded(normalizedMessageId)
        : false
    const hasTranslation = normalizedMessageId
        ? !!getMessageTranslation(normalizedMessageId)
        : false
    const isActive = fetchingState !== FetchingState.Idle || hasTranslation

    return {
        shouldRender:
            showTranslations &&
            normalizedMessageId !== null &&
            shouldShowTranslatedContent(ticketLanguage) &&
            isActive &&
            !isExpanded,
        ticketLanguage,
        display,
        fetchingState,
        hasRegeneratedOnce,
        setTicketMessageTranslationDisplay,
    }
}
