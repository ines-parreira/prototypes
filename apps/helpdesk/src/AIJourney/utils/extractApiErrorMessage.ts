type FieldError = {
    field?: string
    message?: string
    msg?: string
    code?: string
    type?: string
}

type DetailEntry = string | FieldError | Record<string, string>

type ApiErrorDetail =
    | string
    | (FieldError & { errors?: FieldError[] })
    | DetailEntry[]
    | null
    | undefined

const FRIENDLY_MESSAGES: Array<{ pattern: RegExp; replacement: string }> = [
    {
        pattern: /scheduled[_ ]datetime\s+must\s+be\s+in\s+the\s+future/i,
        replacement: 'Please pick a date and time in the future.',
    },
]

const prettifyIdentifiers = (message: string): string =>
    message.replace(/\b[a-z]+(?:_[a-z]+)+\b/g, (match) =>
        match.replace(/_/g, ' '),
    )

const humanize = (message: string): string => {
    for (const { pattern, replacement } of FRIENDLY_MESSAGES) {
        if (pattern.test(message)) return replacement
    }
    return prettifyIdentifiers(message)
}

const stripPydanticPrefix = (message: string): string =>
    humanize(message.replace(/^Value error,\s*/i, ''))

const getEntryMessage = (entry: DetailEntry): string | undefined => {
    if (typeof entry === 'string') return entry
    if (!entry || typeof entry !== 'object') return undefined

    const direct =
        ('message' in entry && entry.message) || ('msg' in entry && entry.msg)
    if (typeof direct === 'string') return stripPydanticPrefix(direct)

    const stringValues = Object.values(entry).filter(
        (v): v is string => typeof v === 'string',
    )
    if (stringValues.length > 0) return stringValues.join(', ')

    return undefined
}

const getDetailMessage = (detail: ApiErrorDetail): string | undefined => {
    if (!detail) return undefined

    if (typeof detail === 'string') return detail

    if (Array.isArray(detail)) {
        const messages = detail
            .map(getEntryMessage)
            .filter((m): m is string => Boolean(m))
        return messages.length > 0 ? messages.join(', ') : undefined
    }

    if (typeof detail === 'object') {
        if (Array.isArray(detail.errors) && detail.errors.length > 0) {
            const messages = detail.errors
                .map(getEntryMessage)
                .filter((m): m is string => Boolean(m))
            if (messages.length > 0) return messages.join(', ')
        }

        const direct = detail.message ?? detail.msg
        if (typeof direct === 'string') return stripPydanticPrefix(direct)
    }

    return undefined
}

export const extractApiErrorMessage = (error: unknown): string | undefined => {
    if (!error || typeof error !== 'object') return undefined

    const data = (
        error as {
            response?: {
                data?: {
                    detail?: ApiErrorDetail
                    message?: string
                }
            }
        }
    ).response?.data
    if (!data) return undefined

    return getDetailMessage(data.detail) ?? data.message
}
