import {
    useInfiniteQuery,
    UseInfiniteQueryOptions,
} from '@tanstack/react-query'

import {
    HttpError,
    HttpResponse,
    listTags,
    ListTags200,
    ListTagsParams,
} from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

export function useInfiniteListTags<
    TData = HttpResponse<ListTags200>,
    TError = HttpError<unknown>,
>(
    params?: Omit<ListTagsParams, 'cursor'>,
    options?: UseInfiniteQueryOptions<HttpResponse<ListTags200>, TError, TData>,
) {
    return useInfiniteQuery({
        queryKey: [...queryKeys.tags.listTags(params), 'paginated'],
        queryFn: async ({ pageParam, signal }) =>
            listTags({ ...params, cursor: pageParam }, { signal }),
        getNextPageParam: (lastPage) => lastPage.data.meta.next_cursor,
        ...options,
    })
}
