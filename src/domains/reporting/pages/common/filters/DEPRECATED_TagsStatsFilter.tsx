import React, { ComponentProps, useCallback } from 'react'

import { useTagSearch } from 'domains/reporting/hooks/common/useTagSearch'
import { LegacyStatsFilters } from 'domains/reporting/models/stat/types'
import css from 'domains/reporting/pages/common/filters/DEPRECATED_TagsStatsFilter.less'
import SelectFilter from 'domains/reporting/pages/common/SelectFilter'
import SelectStatsFilter from 'domains/reporting/pages/common/SelectStatsFilter'
import { mergeStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import TagDropdownMenu from 'pages/common/components/TagDropdownMenu/TagDropdownMenu'

const TagDropdownMenuWrapper = (
    props: ComponentProps<typeof TagDropdownMenu>,
) => <TagDropdownMenu {...props} />

type Props = {
    value: LegacyStatsFilters['tags']
    variant?: 'fill' | 'ghost'
}

export const tagsStatsFilterLabels = {
    plural: 'tags',
    singular: 'tag',
    dropdownMenuProps: {
        style: {
            maxHeight: 'unset',
        },
    },
}
/**
 * @deprecated
 * @date 2024-07-29
 * @type feature-component
 */
export default function DEPRECATED_TagsStatsFilter({
    value = [],
    variant = 'fill',
}: Props) {
    const dispatch = useAppDispatch()
    const Component = variant === 'fill' ? SelectFilter : SelectStatsFilter

    const handleFilterChange: ComponentProps<typeof Component>['onChange'] =
        useCallback(
            (values) => {
                dispatch(mergeStatsFilters({ tags: values as number[] }))
            },
            [dispatch],
        )

    const { handleTagsSearch, onLoad, tags, shouldLoadMore } = useTagSearch()

    return (
        <Component
            {...tagsStatsFilterLabels}
            onChange={handleFilterChange}
            value={value}
            onSearch={handleTagsSearch}
            dropdownMenu={TagDropdownMenuWrapper}
            isPartial
        >
            <InfiniteScroll
                className={css.infiniteScroll}
                onLoad={onLoad}
                shouldLoadMore={shouldLoadMore}
            >
                {tags.map((tag) => {
                    return (
                        <Component.Item
                            key={tag.id}
                            label={tag.name}
                            value={tag.id}
                        />
                    )
                })}
            </InfiniteScroll>
        </Component>
    )
}
