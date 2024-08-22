import {CancelToken} from 'axios'
import {useCallback, useState} from 'react'
import {ListTagsOrderBy, ListTagsParams, Tag} from '@gorgias/api-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'
import useCancellableRequest from 'hooks/useCancellableRequest'
import useDebouncedEffect from 'hooks/useDebouncedEffect'
import {OrderDirection} from 'models/api/types'
import {fetchTags} from 'models/tag/resources'
import {OrderByOrderDir} from 'models/tag/types'
import {tagsFetched} from 'state/entities/tags/actions'
import {getEntitiesTags} from 'state/entities/tags/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

const ORDER_OPTIONS: {order_by: OrderByOrderDir} = {
    order_by: `${ListTagsOrderBy.Name}:${OrderDirection.Asc}`,
}

export const TAGS_FETCH_ERROR_MESSAGE = 'Failed to fetch tags'

export const useTagSearch = () => {
    const dispatch = useAppDispatch()
    const tags = useAppSelector(getEntitiesTags)
    const [tagIds, setTagIds] = useState<string[]>([])
    const [tagSearch, setTagSearch] = useState('')
    const [debouncedTagSearch, setDebouncedTagSearch] = useState('')
    const [nextCursor, setNextCursor] = useState<string>()

    const [cancellableFetchTags] = useCancellableRequest(
        (cancelToken: CancelToken) =>
            async (
                options: Omit<ListTagsParams, 'order_by'> & {
                    order_by?: OrderByOrderDir
                } = {}
            ) =>
                await fetchTags(options, {cancelToken})
    )

    const [{loading: isFetchingTags}, handleFetchTags] = useAsyncFn(
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
            } catch (error) {
                void dispatch(
                    notify({
                        message: TAGS_FETCH_ERROR_MESSAGE,
                        status: NotificationStatus.Error,
                    })
                )
            }
        },
        [dispatch, cancellableFetchTags, nextCursor, tagSearch, tagIds]
    )

    const handleTagsSearch = useCallback(
        (search) => {
            if (tagSearch !== search) {
                setDebouncedTagSearch(search)
            }
        },
        [setDebouncedTagSearch, tagSearch]
    )

    useDebouncedEffect(
        () => {
            void handleFetchTags(debouncedTagSearch)
        },
        [debouncedTagSearch],
        300
    )

    const onLoad = useCallback(async () => {
        await handleFetchTags(tagSearch, true)
    }, [handleFetchTags, tagSearch])

    return {
        handleTagsSearch,
        onLoad,
        tagIds,
        tagsState: tags,
        shouldLoadMore: !!nextCursor && !isFetchingTags,
        tags: tagIds.map((tagId) => tags[tagId.toString()]),
    }
}
