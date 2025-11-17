import type { KeyboardEvent } from 'react'
import React, { useCallback, useMemo, useRef, useState } from 'react'

import { useDebouncedEffect } from '@repo/hooks'
import type { QueryKey } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import cn from 'classnames'

import type { ListTagsParams, Tag } from '@gorgias/helpdesk-queries'
import { ListTagsOrderBy, queryKeys } from '@gorgias/helpdesk-queries'

import type { Item } from 'components/Dropdown'
import { Body, Context, focusOnNextItem } from 'components/Dropdown'
import { UserRole } from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import dropdownItemCss from 'pages/common/components/dropdown/DropdownItem.less'
import { getCurrentUserState } from 'state/currentUser/selectors'
import useListTags from 'tags/useListTags'
import { hasRole } from 'utils'

import TagDropdownItem from './TagDropdownItem'

import css from './TagDropdownMenu.less'

type Props = {
    className?: string
    disableTagCreation?: boolean
    filterBy?: (s: Tag) => boolean
    onClick: (item: Item) => void
}

const LIMIT_ITEMS_SEARCH = 30
const STALE_TIME = 5 * 60 * 1000 // 5 minutes
const queryKeysTags = queryKeys.tags.listTags()

const removeMatchingQueries = (newTag: string, queryKey: QueryKey) => {
    const searchQueryParam = (
        queryKey[2] as {
            queryParams: ListTagsParams
        }
    )?.queryParams?.search
    return (
        queryKeysTags[0] === queryKey[0] &&
        queryKeysTags[1] === queryKey[1] &&
        !!searchQueryParam &&
        newTag.startsWith(searchQueryParam)
    )
}

const TagDropdownMenu = ({
    className,
    disableTagCreation = false,
    filterBy,
    onClick,
}: Props) => {
    const currentUser = useAppSelector(getCurrentUserState)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const hasUserRole = useMemo(
        () => hasRole(currentUser, UserRole.Agent),
        [currentUser],
    )
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    useDebouncedEffect(
        () => {
            setDebouncedSearch(search)
        },
        [search],
        300,
    )

    const queryClient = useQueryClient()

    const tagsResponse = useListTags(
        {
            limit: LIMIT_ITEMS_SEARCH,
            search: debouncedSearch,
            order_by: ListTagsOrderBy.UsageDescNameDesc,
        },
        {
            refetchOnWindowFocus: false,
            staleTime: STALE_TIME,
        },
    )

    const loadMore = useCallback(() => {
        if (tagsResponse.hasNextPage) {
            void tagsResponse.fetchNextPage()
        }
    }, [tagsResponse])

    const aggregatedTagsData = useMemo(
        () =>
            tagsResponse.data?.pages?.reduce((acc, page) => {
                return [...acc, ...page.data.data]
            }, [] as Tag[]) ?? [],
        [tagsResponse.data?.pages],
    )

    const data = useMemo(
        () =>
            filterBy ? aggregatedTagsData.filter(filterBy) : aggregatedTagsData,
        [filterBy, aggregatedTagsData],
    )

    const handleOnClick = useCallback(
        (item: Item | null, isNew?: boolean) => {
            onClick(item!)

            if (isNew) {
                void queryClient.removeQueries({
                    predicate: ({ queryKey }) =>
                        removeMatchingQueries(search, queryKey),
                })
            }
            setSearch('')
            setDebouncedSearch('')
        },
        [onClick, queryClient, search],
    )

    const isLoading = useMemo(
        () => tagsResponse.isFetching || search !== debouncedSearch,
        [tagsResponse, search, debouncedSearch],
    )

    const canCreateTag = useMemo(
        () =>
            !disableTagCreation &&
            hasUserRole &&
            search !== '' &&
            !aggregatedTagsData.find((tag) => tag.name === search),
        [disableTagCreation, hasUserRole, search, aggregatedTagsData],
    )

    const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            handleOnClick({ name: search }, true)
        } else {
            focusOnNextItem(e, wrapperRef)
        }
    }

    const contextValue = useMemo(
        () => ({
            data,
            debouncedSearch,
            shouldRender:
                !tagsResponse.isInitialLoading && search === debouncedSearch,
            isLoading,
            loadMore,
            onClick: handleOnClick,
            search,
            setSearch,
            wrapperRef,
        }),
        [
            data,
            debouncedSearch,
            handleOnClick,
            isLoading,
            loadMore,
            search,
            setSearch,
            tagsResponse.isInitialLoading,
            wrapperRef,
        ],
    )

    return (
        <Context.Provider value={contextValue}>
            <div className={className} ref={wrapperRef}>
                <Body
                    onRenderItem={(item) => (
                        <TagDropdownItem item={item as Tag} />
                    )}
                />
                {isLoading || !canCreateTag ? null : (
                    <div
                        className={cn(dropdownItemCss.item, css.createTag)}
                        onClick={() => handleOnClick({ name: search }, true)}
                        role="listitem"
                        onKeyDown={onKeyDown}
                        tabIndex={0}
                    >
                        <b>Create</b>&nbsp;{search}
                    </div>
                )}
            </div>
        </Context.Provider>
    )
}

export default TagDropdownMenu
