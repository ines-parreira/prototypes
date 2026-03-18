import { useMemo } from 'react'

import {
    DisplayedContent,
    useCurrentUserLanguagePreferences,
    useTicketMessageDisplayState,
    useTicketMessageTranslations,
} from '@repo/tickets'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import type { TicketThreadRegularMessageItem } from '../../../hooks/messages/types'

type UseDisplayedTicketMessageParams = {
    item: TicketThreadRegularMessageItem
}

export function useDisplayedTicketMessage({
    item,
}: UseDisplayedTicketMessageParams): TicketThreadRegularMessageItem {
    const ticketId = item.data.ticket_id
    const { display } = useTicketMessageDisplayState(item.data.id ?? 0)
    const { getMessageTranslation } = useTicketMessageTranslations({
        ticket_id: ticketId,
    })
    const { shouldShowTranslatedContent } = useCurrentUserLanguagePreferences()
    const { data: ticketData } = useGetTicket(ticketId)

    return useMemo(() => {
        if (
            !item.data.id ||
            !shouldShowTranslatedContent(ticketData?.data?.language)
        ) {
            return item
        }

        const translation = getMessageTranslation(item.data.id)

        if (display === DisplayedContent.Translated && translation) {
            return {
                ...item,
                data: {
                    ...item.data,
                    stripped_html:
                        translation.stripped_html ?? item.data.stripped_html,
                    stripped_text:
                        translation.stripped_text ?? item.data.stripped_text,
                },
            }
        }

        return item
    }, [
        item,
        display,
        getMessageTranslation,
        shouldShowTranslatedContent,
        ticketData,
    ])
}
