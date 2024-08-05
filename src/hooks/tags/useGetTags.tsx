import {useEffect} from 'react'
import {
    HttpError,
    HttpResponse,
    ListTags200,
    useListTags,
} from '@gorgias/api-queries'
import {QueryKey, UseQueryOptions} from '@tanstack/react-query'

import {handleError} from 'hooks/agents/errorHandler'
import {StoreDispatch} from 'state/types'

export default function useGetTags(
    dispatch: StoreDispatch,
    params: Parameters<typeof useListTags>[0],
    query?: UseQueryOptions<
        HttpResponse<ListTags200, unknown>,
        HttpError<unknown, unknown>,
        HttpResponse<ListTags200, unknown>,
        QueryKey
    >
) {
    const response = useListTags<
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
