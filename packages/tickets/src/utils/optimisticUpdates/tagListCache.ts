import type { InfiniteData, QueryClient, QueryKey } from '@tanstack/react-query'

import type { HttpResponse, ListTags200 } from '@gorgias/helpdesk-client'
import type { Tag, TicketTag } from '@gorgias/helpdesk-queries'
import { queryKeys } from '@gorgias/helpdesk-queries'

type TagsQueryKeyParams = {
    queryParams?: {
        search?: string
    }
}

type ListTagsInfiniteData = InfiniteData<HttpResponse<ListTags200>>

const tagsQueryKeyBase = queryKeys.tags.listTags()

function isTagsQueryKey(queryKey: QueryKey) {
    return (
        queryKey[0] === tagsQueryKeyBase[0] &&
        queryKey[1] === tagsQueryKeyBase[1]
    )
}

function doesTagMatchSearch(tagName: string, queryKey: QueryKey) {
    const params = queryKey[2] as TagsQueryKeyParams | undefined
    const search = params?.queryParams?.search?.trim().toLowerCase() ?? ''

    if (search === '') {
        return true
    }

    return tagName.toLowerCase().includes(search)
}

function upsertTagInPages(old: ListTagsInfiniteData, tag: Tag | TicketTag) {
    if (!old.pages.length) {
        return old
    }

    const firstPage = old.pages[0]
    const existingTag = old.pages
        .flatMap((page) => page.data.data)
        .find((existingItem) => existingItem.id === tag.id)

    if (existingTag) {
        return old
    }

    return {
        ...old,
        pages: [
            {
                ...firstPage,
                data: {
                    ...firstPage.data,
                    data: [tag as Tag, ...firstPage.data.data],
                    meta: {
                        ...firstPage.data.meta,
                        total_resources:
                            (firstPage.data.meta.total_resources ?? 0) + 1,
                    },
                },
            },
            ...old.pages.slice(1),
        ],
    }
}

export function upsertTagIntoListTagsCache(
    queryClient: QueryClient,
    tag: Tag | TicketTag,
) {
    for (const [
        queryKey,
        data,
    ] of queryClient.getQueriesData<ListTagsInfiniteData>({
        queryKey: tagsQueryKeyBase,
    })) {
        if (
            !data ||
            !isTagsQueryKey(queryKey) ||
            !doesTagMatchSearch(tag.name, queryKey)
        ) {
            continue
        }

        queryClient.setQueryData<ListTagsInfiniteData>(queryKey, (old) => {
            if (!old) {
                return old
            }

            return upsertTagInPages(old, tag)
        })
    }
}
