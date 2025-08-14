import { useCallback, useMemo, useRef } from 'react'

import { isNumber } from 'lodash'

import {
    Language,
    useRequestTicketTranslation,
} from '@gorgias/helpdesk-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { TicketMessage } from 'models/ticket/types'

import { useCurrentUserPreferredLanguage } from './useCurrentUserPreferredLanguage'
import { useTicketTranslations } from './useTicketTranslations'

type UseGenerateTicketTranslationsParams = {
    ticketId: number
    ticketLanguage?: Language
    ticketMessages?: TicketMessage[]
}

const createRequestId = (
    ticketId: number,
    ticketMessages: TicketMessage[],
    primary: Language,
) =>
    `${ticketId}-${ticketMessages
        .map((message) => message.id)
        .filter(isNumber)
        .sort((a, b) => a - b)
        .join('-')}-${primary}`

export function useGenerateTicketTranslations({
    ticketId,
    ticketLanguage,
    ticketMessages = [],
}: UseGenerateTicketTranslationsParams) {
    const hasMessagesTranslation = useFlag(FeatureFlagKey.MessagesTranslations)
    const pendingRequestsRef = useRef<Set<string>>(new Set())
    const { primary, languagesNotToTranslateFor } =
        useCurrentUserPreferredLanguage()

    const { data: ticketTranslations } = useTicketTranslations({
        ticket_id: ticketId,
    })

    const { mutate: requestTicketTranslation } = useRequestTicketTranslation()

    const shouldGenerateTicketTranslations = useMemo(() => {
        if (!hasMessagesTranslation) return false

        // if no ticketId or ticketLanguage, don't generate translations
        if (!ticketId || !ticketLanguage || !primary) return false

        if (languagesNotToTranslateFor.includes(ticketLanguage)) return false

        // We first need to check if the ticket has already generated translations and how many of them
        if (!ticketTranslations?.data.data) return false

        const hasAllMessagesTranslated = ticketMessages.every((message) => {
            const messageTranslation = ticketTranslations.data.data.find(
                (translation) => translation.ticket_message_id === message.id,
            )
            return Boolean(messageTranslation)
        })

        if (hasAllMessagesTranslated) return false

        const requestId = createRequestId(ticketId, ticketMessages, primary)

        return !pendingRequestsRef.current.has(requestId)
    }, [
        ticketId,
        ticketLanguage,
        ticketMessages,
        languagesNotToTranslateFor,
        primary,
        hasMessagesTranslation,
        ticketTranslations,
    ])

    const generateTicketTranslations = useCallback(() => {
        if (!primary) return

        const requestId = createRequestId(ticketId, ticketMessages, primary)
        pendingRequestsRef.current.add(requestId)

        requestTicketTranslation({
            data: {
                ticket_id: ticketId,
                language: primary,
            },
        })
    }, [ticketId, ticketMessages, primary, requestTicketTranslation])

    return {
        generateTicketTranslations,
        shouldGenerateTicketTranslations,
    }
}
