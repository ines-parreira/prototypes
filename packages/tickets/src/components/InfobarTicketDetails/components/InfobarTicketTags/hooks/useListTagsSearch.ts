import { useState } from 'react'

import { useInfiniteListTags } from './useInfiniteListTags'

export const useListTagsSearch = () => {
    const [search, setSearch] = useState('')
    const queryResult = useInfiniteListTags(
        {
            search,
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
