import React, {ComponentProps, useCallback, useState} from 'react'
import {useAsyncFn, useDebounce} from 'react-use'
import {CancelToken} from 'axios'

import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import {mergeStatsFilters} from 'state/stats/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useCancellableRequest from 'hooks/useCancellableRequest'
import {FetchTagsOptions, Tag, TagSortableProperties} from 'models/tag/types'
import {fetchTags} from 'models/tag/resources'
import {NotificationStatus} from 'state/notifications/types'
import {OrderDirection, OrderParams} from 'models/api/types'
import {tagsFetched} from 'state/entities/tags/actions'
import {notify} from 'state/notifications/actions'
import TagDropdownMenu from 'pages/common/components/TagDropdownMenu/TagDropdownMenu'
import {RootState} from 'state/types'
import {StatsFilters} from 'models/stat/types'

import css from './TagsStatsFilter.less'
import SelectFilter from './common/SelectFilter'

const ORDER_OPTIONS: OrderParams<TagSortableProperties> = {
    orderBy: `${TagSortableProperties.Name}:${OrderDirection.Asc}`,
}

const TagDropdownMenuWrapper = (
    props: ComponentProps<typeof TagDropdownMenu>
) => <TagDropdownMenu {...props} />

type Props = {
    value: StatsFilters['tags']
}

export default function TagsStatsFilter({value = []}: Props) {
    const dispatch = useAppDispatch()
    const tags = useAppSelector((state: RootState) => state.entities.tags)
    const [tagIds, setTagIds] = useState<string[]>([])
    const [tagSearch, setTagSearch] = useState('')
    const [debouncedTagSearch, setDebouncedTagSearch] = useState('')
    const [nextCursor, setNextCursor] = useState<string | null>(null)

    const handleFilterChange: ComponentProps<typeof SelectFilter>['onChange'] =
        useCallback(
            (values) => {
                dispatch(mergeStatsFilters({tags: values as number[]}))
            },
            [dispatch]
        )

    const [cancellableFetchTags] = useCancellableRequest(
        (cancelToken: CancelToken) => async (options: FetchTagsOptions) =>
            await fetchTags(options, {cancelToken})
    )

    const [{loading: isFetchingTags}, handleFetchTags] = useAsyncFn(
        async (search: string, isFromScroll = false) => {
            try {
                const previousIds = isFromScroll ? tagIds : []
                const cursor = isFromScroll ? nextCursor : null
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
                setNextCursor(res.data.meta.next_cursor)
            } catch (error) {
                void dispatch(
                    notify({
                        message: 'Failed to fetch tags',
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

    useDebounce(
        () => {
            void handleFetchTags(debouncedTagSearch)
        },
        300,
        [debouncedTagSearch]
    )

    const onLoad = useCallback(async () => {
        await handleFetchTags(tagSearch, true)
    }, [handleFetchTags, tagSearch])

    return (
        <SelectFilter
            plural="tags"
            singular="tag"
            onChange={handleFilterChange}
            value={value}
            onSearch={handleTagsSearch}
            dropdownMenu={TagDropdownMenuWrapper}
            isPartial
        >
            <InfiniteScroll
                className={css.infiniteScroll}
                onLoad={onLoad}
                shouldLoadMore={!!nextCursor && !isFetchingTags}
            >
                {tagIds.map((tagId) => {
                    const tag = tags[tagId.toString()]

                    return (
                        tag && (
                            <SelectFilter.Item
                                key={tag.id}
                                label={tag.name}
                                value={tag.id}
                            />
                        )
                    )
                })}
            </InfiniteScroll>
        </SelectFilter>
    )
}
