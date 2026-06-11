import { useEffect } from 'react'

import client from '@repo/api-resources'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import type { SearchBody } from '@gorgias/helpdesk-queries'

import { handleError } from 'hooks/agents/errorHandler'
import { useAppDispatch } from 'hooks/useAppDispatch'
import type { ApiListResponseCursorPagination } from 'models/api/types'

async function postSearch<T>(params: SearchBody) {
    return await client.post<ApiListResponseCursorPagination<T>>(
        '/api/search/',
        params,
    )
}

export function useSearch<T>(
    body: SearchBody,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof postSearch>>>,
) {
    const dispatch = useAppDispatch()

    const response = useQuery({
        queryKey: ['search', body.type, body.query],
        queryFn: () => postSearch<T>(body),
        ...overrides,
    })

    useEffect(() => {
        if (response.error) {
            handleError(
                response.error,
                `Failed to fetch ${body.type || 'item'}s`,
                dispatch,
            )
        }
    }, [body, dispatch, response])

    return response
}
