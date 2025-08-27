import { useListTicketMessageTranslations } from '@gorgias/helpdesk-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import { useCurrentUserPreferredLanguage } from './useCurrentUserPreferredLanguage'

type TicketTranslationsParams = {
    ticket_id?: number
}

export function useTicketTranslations({ ticket_id }: TicketTranslationsParams) {
    const hasMessagesTranslation = useFlag(FeatureFlagKey.MessagesTranslations)
    const { primary } = useCurrentUserPreferredLanguage()

    return useListTicketMessageTranslations(
        {
            // The query enabled will prevent the query from being called with undefined ticket_id
            ticket_id: ticket_id as number,
            language: primary as string,
        },
        {
            query: {
                staleTime: 60000 * 5,
                enabled:
                    Boolean(primary) &&
                    Boolean(ticket_id) &&
                    hasMessagesTranslation,
            },
        },
    )
}
