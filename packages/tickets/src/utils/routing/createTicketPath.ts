import { z } from 'zod'

export const CREATE_TICKET_PATH = '/app/ticket/new'
export const CREATE_TICKET_PREVIOUS_URL_PARAM = 'previousURL'

type LocationPath = {
    pathname: string
    search: string
    hash: string
}

export function getCreateTicketPathWithPreviousURL({
    pathname,
    search,
    hash,
}: LocationPath) {
    const searchParams = new URLSearchParams({
        [CREATE_TICKET_PREVIOUS_URL_PARAM]: `${pathname}${search}${hash}`,
    })

    return `${CREATE_TICKET_PATH}?${searchParams.toString()}`
}

export function isCreateTicketPath(pathname: string) {
    return (
        pathname === CREATE_TICKET_PATH ||
        pathname.startsWith(`${CREATE_TICKET_PATH}/`)
    )
}

const createTicketPreviousURLSchema = z
    .string()
    .min(1)
    .refine((value) => value.startsWith('/') && !value.startsWith('//'), {
        message: 'Invalid create ticket previous URL',
    })
    .refine((value) => !isCreateTicketPath(value.split(/[?#]/, 1)[0]), {
        message: 'Invalid create ticket previous URL',
    })

function parseCreateTicketPreviousURL(value: string | null) {
    const result = createTicketPreviousURLSchema.safeParse(value)

    if (!result.success) {
        return undefined
    }

    return result.data
}

export const CreateTicketSearchParamsKeys = {
    previousURL: {
        key: CREATE_TICKET_PREVIOUS_URL_PARAM,
        parse: parseCreateTicketPreviousURL,
    },
} as const
