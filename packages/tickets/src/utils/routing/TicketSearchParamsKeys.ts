import { z } from 'zod'

const parseBoolean = (value: string | null) => {
    const result = z.coerce.boolean().safeParse(value)
    if (!result.success) {
        return false
    }
    return result.data
}

export const TicketSearchParamsKeys = {
    showAllEvents: {
        key: 'show_all_events',
        parse: (value: string | null) => parseBoolean(value),
    },
    showAllQuickReplies: {
        key: 'show_all_quick_replies',
        parse: (value: string | null) => parseBoolean(value),
    },
} as const
