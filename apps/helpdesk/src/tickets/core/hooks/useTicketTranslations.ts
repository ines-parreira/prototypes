import { useListTicketMessageTranslations } from '@gorgias/helpdesk-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import { useCurrentUserPreferredLanguage } from './useCurrentUserPreferredLanguage'

type TicketTranslationsParams = {
    ticket_id: number
}

export function useTicketTranslations({ ticket_id }: TicketTranslationsParams) {
    const hasMessagesTranslation = useFlag(FeatureFlagKey.MessagesTranslations)
    const { primary } = useCurrentUserPreferredLanguage()

    return useListTicketMessageTranslations(
        {
            ticket_id,
            language: primary as string,
        },
        {
            query: {
                enabled:
                    Boolean(primary) &&
                    Boolean(ticket_id) &&
                    hasMessagesTranslation,
            },
        },
    )
}
