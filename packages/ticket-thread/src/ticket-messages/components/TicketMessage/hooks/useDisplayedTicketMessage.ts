import { useMemo } from 'react'

import {
    DisplayedContent,
    useCurrentUserLanguagePreferences,
    useTicketMessageDisplayState,
    useTicketMessageTranslations,
} from '@repo/tickets'

import { useGetTicket } from '@gorgias/helpdesk-queries'
import type { TicketMessageTranslation } from '@gorgias/helpdesk-types'

import type { TicketThreadMessageData } from '../../../types'

type TranslatableTicketThreadMessageItem = {
    data: TicketThreadMessageData
}

type UseDisplayedTicketMessageParams<
    TItem extends TranslatableTicketThreadMessageItem,
> = {
    item: TItem
}

export type DisplayedTicketThreadMessageItem<
    TItem extends TranslatableTicketThreadMessageItem,
> = Omit<TItem, 'data'> & {
    data: TItem['data'] & {
        translations?: TicketMessageTranslation | null
    }
}

export function useDisplayedTicketMessage<
    TItem extends TranslatableTicketThreadMessageItem,
>({
    item,
}: UseDisplayedTicketMessageParams<TItem>): DisplayedTicketThreadMessageItem<TItem> {
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
            return item as DisplayedTicketThreadMessageItem<TItem>
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

        return item as DisplayedTicketThreadMessageItem<TItem>
    }, [
        item,
        display,
        getMessageTranslation,
        shouldShowTranslatedContent,
        ticketData,
    ])
}
