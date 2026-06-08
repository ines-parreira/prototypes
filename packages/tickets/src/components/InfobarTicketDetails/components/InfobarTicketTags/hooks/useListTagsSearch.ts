import { useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useDebouncedValue } from '@repo/hooks'

import { ListTagsOrderBy } from '@gorgias/helpdesk-types'

import { useInfiniteListTags } from './useInfiniteListTags'

type Params = {
    enabled?: boolean
}

export const useListTagsSearch = ({ enabled = true }: Params = {}) => {
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebouncedValue(search, Duration.millis(250))
    const queryResult = useInfiniteListTags(
        {
            search: debouncedSearch,
            order_by: ListTagsOrderBy.UsageDescNameDesc,
        },
        {
            enabled,
            staleTime: Duration.minutes(5),
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
