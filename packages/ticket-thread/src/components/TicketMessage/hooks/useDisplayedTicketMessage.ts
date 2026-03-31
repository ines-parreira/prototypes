import { useMemo } from 'react'

import {
    DisplayedContent,
    useCurrentUserLanguagePreferences,
    useTicketMessageDisplayState,
    useTicketMessageTranslations,
} from '@repo/tickets'

import { useGetTicket } from '@gorgias/helpdesk-queries'
import type { TicketMessageTranslation } from '@gorgias/helpdesk-types'

import type { TicketThreadRegularMessageItem } from '../../../hooks/messages/types'

type UseDisplayedTicketMessageParams = {
    item: TicketThreadRegularMessageItem
}

export type DisplayedTicketThreadRegularMessageItem = Omit<
    TicketThreadRegularMessageItem,
    'data'
> & {
    data: TicketThreadRegularMessageItem['data'] & {
        translations?: TicketMessageTranslation | null
    }
}

export function useDisplayedTicketMessage({
    item,
}: UseDisplayedTicketMessageParams): DisplayedTicketThreadRegularMessageItem {
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
                    translations: translation,
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
