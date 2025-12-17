import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import type { TicketLanguage } from '@gorgias/helpdesk-queries'
import { useListTicketMessageTranslations } from '@gorgias/helpdesk-queries'

import { useCurrentUserLanguagePreferences } from './useCurrentUserLanguagePreferences'

type TicketTranslationsParams = {
    ticket_id?: number
    enabled?: boolean
}

export function useTicketTranslations({
    ticket_id,
    enabled = true,
}: TicketTranslationsParams) {
    const hasMessagesTranslation = useFlag(FeatureFlagKey.MessagesTranslations)
    const { primary } = useCurrentUserLanguagePreferences()

    return useListTicketMessageTranslations(
        {
            // The query enabled will prevent the query from being called with undefined ticket_id
            ticket_id: ticket_id as number,
            language: primary as TicketLanguage,
        },
        {
            query: {
                staleTime: 60000 * 5,
                enabled:
                    enabled &&
                    Boolean(primary) &&
                    Boolean(ticket_id) &&
                    hasMessagesTranslation,
            },
        },
    )
}
