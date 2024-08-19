import {useEffect} from 'react'
import {
    HttpError,
    HttpResponse,
    ListTags200,
    useListTags as useListTagsQuery,
} from '@gorgias/api-queries'
import {QueryKey, UseQueryOptions} from '@tanstack/react-query'

import {handleError} from 'hooks/agents/errorHandler'
import useAppDispatch from 'hooks/useAppDispatch'

export default function useListTags(
    params?: Parameters<typeof useListTagsQuery>[0],
    query?: UseQueryOptions<
        HttpResponse<ListTags200, unknown>,
        HttpError<unknown, unknown>,
        HttpResponse<ListTags200, unknown>,
        QueryKey
    >
) {
    const dispatch = useAppDispatch()
    const response = useListTagsQuery<
        HttpResponse<ListTags200, unknown>,
        HttpError<unknown, unknown>
    >(params, {
        query,
    })

    useEffect(() => {
        if (response.error) {
            handleError(response.error, 'Failed to fetch tags', dispatch)
        }
    }, [dispatch, response])

    return response
}
