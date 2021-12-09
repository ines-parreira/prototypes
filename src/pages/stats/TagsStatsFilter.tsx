import React, {ComponentProps, useCallback, useState} from 'react'
import {fromJS} from 'immutable'
import {useSelector} from 'react-redux'
import {useDebounce} from 'react-use'
import {CancelToken} from 'axios'

import InfiniteScroll from '../common/components/InfiniteScroll/InfiniteScroll'
import {mergeStatsFilters} from '../../state/stats/actions'
import {StatsFilterType, TagsStatsFilterValue} from '../../state/stats/types'
import useAppDispatch from '../../hooks/useAppDispatch'
import useCancellableRequest from '../../hooks/useCancellableRequest'
import {
    FetchTagsOptions,
    Tag,
    TagSortableProperties,
} from '../../models/tag/types'
import {fetchTags} from '../../models/tag/resources'
import {NotificationStatus} from '../../state/notifications/types'
import {OrderDirection} from '../../models/api/types'
import {tagsFetched} from '../../state/entities/tags/actions'
import {notify} from '../../state/notifications/actions'
import TagDropdownMenu from '../common/components/TagDropdownMenu/TagDropdownMenu'
import {RootState} from '../../state/types'

import css from './TagsStatsFilter.less'
import SelectFilter from './common/SelectFilter'

const ORDER_OPTIONS = {
    orderBy: TagSortableProperties.Name,
    orderDir: OrderDirection.Asc,
}

const TagDropdownMenuWrapper = (
    props: ComponentProps<typeof TagDropdownMenu>
) => <TagDropdownMenu {...props} />

type Props = {
    value: TagsStatsFilterValue
}

export default function TagsStatsFilter({value}: Props) {
    const dispatch = useAppDispatch()
    const tags = useSelector((state: RootState) => state.entities.tags)
    const [tagIds, setTagIds] = useState<string[]>([])
    const [tagSearch, setTagSearch] = useState('')
    const [debouncedTagSearch, setDebouncedTagSearch] = useState('')
    const [pagination, setPagination] = useState({
        page: 0,
        nbPages: 1,
    })

    const handleFilterChange: ComponentProps<typeof SelectFilter>['onChange'] =
        useCallback(
            (values) => {
                dispatch(
                    mergeStatsFilters(fromJS({[StatsFilterType.Tags]: values}))
                )
            },
            [dispatch]
        )

    const [cancellableFetchTags] = useCancellableRequest(
        (cancelToken: CancelToken) => async (options: FetchTagsOptions) =>
            await fetchTags(options, cancelToken)
    )

    const handleFetchTags = useCallback(
        async (search: string) => {
            try {
                let previousIds = tagIds
                let nextPage = pagination.page + 1
                if (search !== tagSearch) {
                    setTagSearch(search)
                    previousIds = []
                    nextPage = 1
                }
                const res = await cancellableFetchTags({
                    ...ORDER_OPTIONS,
                    page: nextPage,
                    search,
                })
                if (!res) {
                    return
                }

                dispatch(tagsFetched(res.data))
                setTagIds([
                    ...previousIds,
                    ...res.data.map((tag: Tag) => tag.id.toString()),
                ])
                setPagination({page: res.meta.page, nbPages: res.meta.nb_pages})
            } catch (error) {
                void dispatch(
                    notify({
                        message: 'Failed to fetch tags',
                        status: NotificationStatus.Error,
                    })
                )
            }
        },
        [pagination, dispatch, cancellableFetchTags, tagSearch, tagIds]
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

    return (
        <SelectFilter
            plural="tags"
            singular="tag"
            onChange={handleFilterChange}
            value={value}
            onSearch={handleTagsSearch}
            dropdownMenu={TagDropdownMenuWrapper}
        >
            <InfiniteScroll
                className={css.infiniteScroll}
                onLoad={() => handleFetchTags(tagSearch)}
                shouldLoadMore={pagination.page < pagination.nbPages}
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
