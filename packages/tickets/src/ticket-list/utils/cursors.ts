// The actual response includes next_items but the SDK type doesn't include it
// This can be deleted when SDK updates
export type ListViewMetaWithCursors = {
    next_items?: string | null
    prev_items?: string | null
}

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
    meta?: ListViewMetaWithCursors | null,
): string | undefined {
    return getCursorFromItemsUrl(meta?.next_items)
}
