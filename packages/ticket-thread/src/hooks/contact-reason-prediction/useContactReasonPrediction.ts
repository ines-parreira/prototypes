import { useCallback, useMemo } from 'react'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import { getQueryOptions } from '../shared/queryOption'
import type { TicketThreadItem } from '../types'
import { TicketThreadItemTag } from '../types'
import { getContactReasonSuggestionCount } from './predicate'

type UseContactReasonPredictionParams = {
    ticketId: number
}

export function useContactReasonPrediction({
    ticketId,
}: UseContactReasonPredictionParams) {
    const { data: ticket } = useGetTicket(ticketId, undefined, {
        query: {
            ...getQueryOptions(ticketId),
            select: (data) => data?.data,
        },
    })

    const contactReasonSuggestionCount = useMemo(
        () => getContactReasonSuggestionCount(ticket?.custom_fields),
        [ticket],
    )

    const insertContactReasonPrediction = useCallback(
        (items: TicketThreadItem[]): TicketThreadItem[] => {
            if (contactReasonSuggestionCount <= 0) {
                return items
            }

            const suggestions = Array.from(
                { length: contactReasonSuggestionCount },
                () => ({
                    _tag: TicketThreadItemTag.ContactReasonSuggestion,
                    data: null,
                }),
            )

            return [...suggestions, ...items]
        },
        [contactReasonSuggestionCount],
    )

    return { insertContactReasonPrediction }
}
