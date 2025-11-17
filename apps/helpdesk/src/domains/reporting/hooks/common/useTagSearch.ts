import { useCallback, useState } from 'react'

import { useAsyncFn, useDebouncedEffect } from '@repo/hooks'
import type { CancelToken } from 'axios'
import { filter } from 'lodash'

import type { ListTagsParams, Tag } from '@gorgias/helpdesk-queries'
import { ListTagsOrderBy } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useCancellableRequest from 'hooks/useCancellableRequest'
import { OrderDirection } from 'models/api/types'
import { fetchTags } from 'models/tag/resources'
import type { OrderByOrderDir } from 'models/tag/types'
import { tagsFetched } from 'state/entities/tags/actions'
import { getEntitiesTags } from 'state/entities/tags/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { notUndefined } from 'utils/types'

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
                void dispatch(
                    notify({
                        message: TAGS_FETCH_ERROR_MESSAGE,
                        status: NotificationStatus.Error,
                    }),
                )
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
