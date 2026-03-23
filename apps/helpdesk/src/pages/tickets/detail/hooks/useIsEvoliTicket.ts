import type { List, Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { getTicketState } from 'state/ticket/selectors'

const EVOLI_TAGS = ['ai_evolution', 'ai_next_gen']

export const useIsEvoliTicket = (): boolean => {
    const ticket = useAppSelector(getTicketState)
    const ticketTags = ticket.get('tags') as
        | List<Map<string, string>>
        | undefined

    return (
        ticketTags?.some((tag) =>
            EVOLI_TAGS.includes(tag?.get('name') ?? ''),
        ) ?? false
    )
}
