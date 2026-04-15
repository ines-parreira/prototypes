import { isRecord } from '@repo/utils'

import { compare } from 'utils'

export type OrderBy = {
    key: string
    direction: 'ASC' | 'DESC'
}

export function sortListItems<T>(items: T[], orderBy?: OrderBy): T[] {
    if (!orderBy) return [...items]

    return [...items].sort((a, b) => {
        if (!isRecord(a) || !isRecord(b)) return 0

        const aValue = a[orderBy.key]
        const bValue = b[orderBy.key]

        const aIsNullish = aValue === null || aValue === undefined
        const bIsNullish = bValue === null || bValue === undefined

        if (aIsNullish && bIsNullish) return 0
        if (aIsNullish) return 1
        if (bIsNullish) return -1

        return orderBy.direction === 'ASC'
            ? compare(aValue, bValue)
            : compare(bValue, aValue)
    })
}
