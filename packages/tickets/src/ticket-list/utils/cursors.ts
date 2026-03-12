export function getCursorFromItemsUrl(
    itemsUrl?: string | null,
): string | undefined {
    if (!itemsUrl) return undefined
    const queryStart = itemsUrl.indexOf('?')
    if (queryStart === -1) return undefined

    const hashStart = itemsUrl.indexOf('#', queryStart)
    const queryString =
        hashStart === -1
            ? itemsUrl.slice(queryStart + 1)
            : itemsUrl.slice(queryStart + 1, hashStart)

    const params = new URLSearchParams(queryString)
    return params.get('cursor') ?? undefined
}

export function getNextCursorFromMeta(
    meta?: { next_items?: string | null } | null,
): string | undefined {
    return getCursorFromItemsUrl(meta?.next_items)
}
