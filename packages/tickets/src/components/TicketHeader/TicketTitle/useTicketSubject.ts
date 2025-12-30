import { useMemo } from 'react'

import { useTitle } from '@repo/hooks'

import type { Ticket } from '@gorgias/helpdesk-types'

import { useCurrentUserLanguagePreferences } from '../../../translations/hooks/useCurrentUserLanguagePreferences'
import { useTicketsTranslatedProperties } from '../../../translations/hooks/useTicketsTranslatedProperties'
import { DisplayedContent } from '../../../translations/store/constants'
import { useTicketMessageTranslationDisplay } from '../../../translations/store/useTicketMessageTranslationDisplay'

export function useTicketSubject(ticket: Ticket) {
    const { shouldShowTranslatedContent } = useCurrentUserLanguagePreferences()
    const allMessageDisplayState = useTicketMessageTranslationDisplay(
        (state) => state.allMessageDisplayState,
    )
    const { translationMap, updateTicketTranslatedSubject, isInitialLoading } =
        useTicketsTranslatedProperties({
            ticket_ids: [ticket.id],
            ticketsRequiresTranslations: shouldShowTranslatedContent(
                ticket.language,
            ),
        })

    const translatedSubject = translationMap[ticket.id]?.subject
    const subject = useMemo(() => {
        if (!shouldShowTranslatedContent(ticket.language)) {
            return ticket.subject ?? 'New ticket'
        }

        if (translatedSubject) {
            return allMessageDisplayState === DisplayedContent.Translated
                ? translatedSubject
                : (ticket.subject ?? 'New ticket')
        }
        return ticket.subject ?? 'New ticket'
    }, [
        translatedSubject,
        allMessageDisplayState,
        ticket.language,
        ticket.subject,
        shouldShowTranslatedContent,
    ])

    useTitle(subject)

    return {
        subject,
        isInitialLoading,
        updateTicketTranslatedSubject,
    }
}
