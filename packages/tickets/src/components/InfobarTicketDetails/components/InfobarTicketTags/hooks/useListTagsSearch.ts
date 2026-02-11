import { useState } from 'react'

import { useDebouncedValue } from '@repo/hooks'

import { ListTagsOrderBy } from '@gorgias/helpdesk-types'

import { useInfiniteListTags } from './useInfiniteListTags'

export const useListTagsSearch = () => {
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebouncedValue(search, 250)
    const queryResult = useInfiniteListTags(
        {
            search: debouncedSearch,
            order_by: ListTagsOrderBy.UsageDescNameDesc,
        },
        {
            staleTime: 60000 * 5,
            keepPreviousData: true,
        },
    )

    const { data, isFetchingNextPage, hasNextPage, fetchNextPage, isFetching } =
        queryResult

    return {
        ...queryResult,
        search,
        setSearch,
        onLoad: fetchNextPage,
        tags: data?.pages.flatMap((page) => page.data.data),
        isLoading: isFetchingNextPage || isFetching,
        shouldLoadMore: (hasNextPage && !isFetchingNextPage) ?? false,
    }
}
