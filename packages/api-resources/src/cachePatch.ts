import type { InfiniteData, QueryClient, QueryKey } from '@tanstack/react-query'

type PaginatedPage<T> = {
    data: {
        data: T[]
        meta?: { total_resources?: number | null } & Record<string, unknown>
    } & Record<string, unknown>
} & Record<string, unknown>

type PaginatedInfiniteCache<T> = InfiniteData<PaginatedPage<T>>

type PatchInfiniteListCacheOptions<T> = {
    queryClient: QueryClient
    /**
     * Query key identifying the infinite-list caches to patch. Matched as a
     * prefix so passing a domain-level key covers every list variant
     * underneath.
     */
    queryKey: QueryKey
    /** Returns true for the item(s) to patch. */
    match: (item: T) => boolean
    /**
     * Transform applied to each matching entry. Receives the existing item
     * and returns the replacement (or a merged shape like
     * `{ ...existing, ...updates }`).
     */
    patch: (existing: T) => T
    /**
     * Optional item to prepend to the first page when no entry matched.
     * Useful for realtime creation events or optimistic adds. When prepended,
     * `meta.total_resources` is bumped if present. No-op if the query has no
     * cached pages yet — the caller should let the query fetch naturally in
     * that case.
     */
    insert?: T
}

/**
 * Patch items inside every page of the selected infinite-list caches,
 * optionally inserting when nothing matched.
 *
 * Operates on the SDK-shaped cache: `InfiniteData<HttpResponse<{ data: T[],
 * meta }>>`. Walks every page across every matched query, replaces entries
 * where `match(entry)` returns true via `patch(existing)`, and leaves
 * non-matching entries untouched. When `insert` is provided and nothing
 * matched, the item is prepended to the first page's `data` and the first
 * page's `meta.total_resources` is incremented if present.
 *
 * Page and top-level references are preserved when nothing changed so React
 * Query's structural sharing stays intact.
 */
export function patchInfiniteListCache<T>({
    queryClient,
    queryKey,
    match,
    patch,
    insert,
}: PatchInfiniteListCacheOptions<T>): void {
    queryClient.setQueriesData<PaginatedInfiniteCache<T>>(
        { queryKey },
        (old) => {
            if (!old?.pages?.length) return old

            let anyPageChanged = false
            const newPages = old.pages.map((page) => {
                const inner = page.data
                if (!Array.isArray(inner?.data)) return page

                let pageChanged = false
                const newItems = inner.data.map((entry) => {
                    if (match(entry)) {
                        pageChanged = true
                        return patch(entry)
                    }
                    return entry
                })
                if (!pageChanged) return page
                anyPageChanged = true
                return { ...page, data: { ...inner, data: newItems } }
            })

            if (anyPageChanged) {
                return { ...old, pages: newPages }
            }

            if (insert) {
                const [firstPage, ...rest] = old.pages
                const inner = firstPage.data
                if (!Array.isArray(inner?.data)) return old

                const nextMeta =
                    inner.meta && typeof inner.meta.total_resources === 'number'
                        ? {
                              ...inner.meta,
                              total_resources: inner.meta.total_resources + 1,
                          }
                        : inner.meta

                return {
                    ...old,
                    pages: [
                        {
                            ...firstPage,
                            data: {
                                ...inner,
                                data: [insert, ...inner.data],
                                ...(nextMeta ? { meta: nextMeta } : {}),
                            },
                        },
                        ...rest,
                    ],
                }
            }

            return old
        },
    )
}

type RemoveFromInfiniteListCacheOptions<T> = {
    queryClient: QueryClient
    /**
     * Query key identifying the infinite-list caches to remove from. Matched
     * as a prefix so passing a domain-level key covers every list variant
     * underneath.
     */
    queryKey: QueryKey
    /** Returns true for the item(s) to drop. */
    match: (item: T) => boolean
}

/**
 * Removes items from every page of the selected infinite-list caches.
 *
 * Operates on the SDK-shaped cache. Walks every page across every matched
 * query and drops entries where `match(entry)` returns true. The first
 * page's `meta.total_resources` is decremented by the total number of
 * removals when present. Pages that had no removals are returned by
 * reference so React Query's structural sharing stays intact. The call is a
 * no-op when nothing matches.
 */
export function removeFromInfiniteListCache<T>({
    queryClient,
    queryKey,
    match,
}: RemoveFromInfiniteListCacheOptions<T>): void {
    queryClient.setQueriesData<PaginatedInfiniteCache<T>>(
        { queryKey },
        (old) => {
            if (!old?.pages?.length) return old

            let removedCount = 0
            const newPages = old.pages.map((page) => {
                const inner = page.data
                if (!Array.isArray(inner?.data)) return page

                const newItems = inner.data.filter((entry) => {
                    if (match(entry)) {
                        removedCount += 1
                        return false
                    }
                    return true
                })
                if (newItems.length === inner.data.length) return page
                return { ...page, data: { ...inner, data: newItems } }
            })

            if (removedCount === 0) return old

            const [firstPage, ...rest] = newPages
            const inner = firstPage.data
            const nextMeta =
                inner.meta && typeof inner.meta.total_resources === 'number'
                    ? {
                          ...inner.meta,
                          total_resources: Math.max(
                              0,
                              inner.meta.total_resources - removedCount,
                          ),
                      }
                    : inner.meta

            const updatedFirstPage =
                nextMeta !== inner.meta
                    ? { ...firstPage, data: { ...inner, meta: nextMeta } }
                    : firstPage

            return { ...old, pages: [updatedFirstPage, ...rest] }
        },
    )
}
