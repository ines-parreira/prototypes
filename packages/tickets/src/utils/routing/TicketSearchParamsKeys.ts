import { z } from 'zod'

const parseBoolean = (value: string | null) => {
    const result = z.coerce.boolean().safeParse(value)
    if (!result.success) {
        return false
    }
    return result.data
}

export const parseSearchString = (value: string | null) => {
    if (value === null) {
        return ''
    }

    return value
}

export const parseSearchOptionalString = (value: string | null) => {
    if (value === null) {
        return undefined
    }

    return value
}

export const TicketSearchParamsKeys = {
    query: {
        key: 'q',
        parse: parseSearchString,
    },
    filters: {
        key: 'filters',
        parse: parseSearchString,
    },
    cursor: {
        key: 'cursor',
        parse: parseSearchOptionalString,
    },
    showTicketEvents: {
        key: 'show_ticket_events',
        parse: (value: string | null) => parseBoolean(value),
    },
    showTicketQuickReplies: {
        key: 'show_ticket_quick_replies',
        parse: (value: string | null) => parseBoolean(value),
    },
} as const
