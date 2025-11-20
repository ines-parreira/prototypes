import { z } from 'zod'

const parseBoolean = (value: string | null) => {
    const result = z.coerce.boolean().safeParse(value)
    if (!result.success) {
        return false
    }
    return result.data
}

export const TicketSearchParamsKeys = {
    showTicketEvents: {
        key: 'show_ticket_events',
        parse: (value: string | null) => parseBoolean(value),
    },
    showTicketQuickReplies: {
        key: 'show_ticket_quick_replies',
        parse: (value: string | null) => parseBoolean(value),
    },
} as const
