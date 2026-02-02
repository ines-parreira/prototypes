import { z } from 'zod'

const parseString = (value: string | null): string | undefined => {
    const result = z.string().min(1).safeParse(value)
    if (!result.success) {
        return undefined
    }
    return result.data
}

const parseArray = (value: string | null): string[] | undefined => {
    const result = z.string().min(1).safeParse(value)
    if (!result.success) {
        return undefined
    }
    return result.data.split(',').filter(Boolean)
}

const parseArrayWithNull = (
    value: string | null,
): (string | null)[] | undefined => {
    const result = z.string().min(1).safeParse(value)
    if (!result.success) {
        return undefined
    }
    const values = result.data.split(',').filter(Boolean)
    return values.length > 0 ? [...values, null] : undefined
}

export const MacroSearchParamsKeys = {
    search: {
        key: 'search',
        parse: parseString,
        serialize: (value: string | undefined | null): string | undefined =>
            value || undefined,
    },
    tags: {
        key: 'tags',
        parse: parseArray,
        serialize: (value: (string | null)[] | undefined): string | undefined =>
            value?.filter(Boolean).join(',') || undefined,
    },
    languages: {
        key: 'languages',
        parse: parseArrayWithNull,
        serialize: (value: (string | null)[] | undefined): string | undefined =>
            value?.filter(Boolean).join(',') || undefined,
    },
    orderBy: {
        key: 'order_by',
        parse: parseString,
        serialize: (value: string | undefined): string | undefined =>
            value || undefined,
    },
    cursor: {
        key: 'cursor',
        parse: parseString,
        serialize: (value: string | undefined): string | undefined =>
            value || undefined,
    },
} as const
