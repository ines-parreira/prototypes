import { useCallback, useState } from 'react'

import { notUndefined } from '@repo/utils'
import type { CancelToken } from 'axios'
import { filter } from 'lodash'
import { useAsyncFn, useDebouncedEffect } from '@gorgias/toolkit-react'

import { toast } from '@gorgias/axiom'
import type { ListTagsParams, Tag } from '@gorgias/helpdesk-types'
import { ListTagsOrderBy } from '@gorgias/helpdesk-types'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useCancellableRequest from 'hooks/useCancellableRequest'
import { OrderDirection } from 'models/api/types'
import { fetchTags } from 'models/tag/resources'
import type { OrderByOrderDir } from 'models/tag/types'
import { tagsFetched } from 'state/entities/tags/actions'
import { getEntitiesTags } from 'state/entities/tags/selectors'

const ORDER_OPTIONS: { order_by: OrderByOrderDir } = {
    order_by: `${ListTagsOrderBy.Name}:${OrderDirection.Asc}`,
}

export const TAGS_FETCH_ERROR_MESSAGE = 'Failed to fetch tags'

export const useTagSearch = () => {
    const dispatch = useAppDispatch()
    const tags: Record<string, Tag | undefined> =
        useAppSelector(getEntitiesTags)
    const [tagIds, setTagIds] = useState<string[]>([])
    const [tagSearch, setTagSearch] = useState('')
    const [debouncedTagSearch, setDebouncedTagSearch] = useState('')
    const [nextCursor, setNextCursor] = useState<string>()

    const [cancellableFetchTags] = useCancellableRequest(
        (cancelToken: CancelToken) =>
            async (
                options: Omit<ListTagsParams, 'order_by'> & {
                    order_by?: OrderByOrderDir
                } = {},
            ) =>
                await fetchTags(options, { cancelToken }),
    )

    const [{ loading: isFetchingTags }, handleFetchTags] = useAsyncFn(
        async (search: string, isFromScroll = false) => {
            try {
                const previousIds = isFromScroll ? tagIds : []
                const cursor = isFromScroll ? nextCursor : undefined
                if (search !== tagSearch) {
                    setTagSearch(search)
                }

                const res = await cancellableFetchTags({
                    ...ORDER_OPTIONS,
                    cursor,
                    search,
                })
                if (!res) {
                    return
                }

                dispatch(tagsFetched(res.data.data))
                setTagIds([
                    ...previousIds,
                    ...res.data.data.map((tag: Tag) => tag.id.toString()),
                ])
                setNextCursor(res.data.meta.next_cursor ?? undefined)
            } catch {
                toast.error(TAGS_FETCH_ERROR_MESSAGE)
            }
        },
        [dispatch, cancellableFetchTags, nextCursor, tagSearch, tagIds],
    )

    const handleTagsSearch = useCallback(
        (search: string) => {
            if (tagSearch !== search) {
                setDebouncedTagSearch(search)
            }
        },
        [setDebouncedTagSearch, tagSearch],
    )

    useDebouncedEffect(
        () => {
            void handleFetchTags(debouncedTagSearch)
        },
        [debouncedTagSearch],
        300,
    )

    const onLoad = useCallback(async () => {
        await handleFetchTags(tagSearch, true)
    }, [handleFetchTags, tagSearch])

    const tagsStateWithoutUndefined: Tag[] = filter(tags, notUndefined)

    return {
        handleTagsSearch,
        onLoad,
        tagIds,
        tagsState: tagsStateWithoutUndefined.reduce<Record<string, Tag>>(
            (state, tag) => {
                state[tag.id] = tag
                return state
            },
            {},
        ),
        shouldLoadMore: !!nextCursor && !isFetchingTags,
        tags: tagIds
            .map((tagId) => tags[tagId.toString()])
            .filter(notUndefined),
    }
}
