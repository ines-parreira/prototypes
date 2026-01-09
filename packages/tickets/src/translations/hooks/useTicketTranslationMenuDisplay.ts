import { useMemo } from 'react'

import type { Ticket } from '@gorgias/helpdesk-types'

import { useCurrentUserLanguagePreferences } from './useCurrentUserLanguagePreferences'
import { useTicketsTranslatedProperties } from './useTicketsTranslatedProperties'

export function useTicketTranslationMenuDisplay(ticket: Ticket) {
    const { shouldShowTranslatedContent } = useCurrentUserLanguagePreferences()
    const { translationMap } = useTicketsTranslatedProperties({
        ticket_ids: [ticket.id],
        ticketsRequiresTranslations: shouldShowTranslatedContent(
            ticket.language,
        ),
    })

    return useMemo(
        () =>
            shouldShowTranslatedContent(ticket.language) &&
            translationMap[ticket.id]?.subject,
        [
            shouldShowTranslatedContent,
            translationMap,
            ticket.id,
            ticket.language,
        ],
    )
}
