import { useState } from 'react'

import { useDebouncedValue } from '@repo/hooks'
import { DurationInMs } from '@repo/utils'

import { ListTagsOrderBy } from '@gorgias/helpdesk-types'

import { useInfiniteListTags } from './useInfiniteListTags'

type Params = {
    enabled?: boolean
}

export const useListTagsSearch = ({ enabled = true }: Params = {}) => {
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebouncedValue(search, 250)
    const queryResult = useInfiniteListTags(
        {
            search: debouncedSearch,
            order_by: ListTagsOrderBy.UsageDescNameDesc,
        },
        {
            enabled,
            staleTime: DurationInMs.FiveMinutes,
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
