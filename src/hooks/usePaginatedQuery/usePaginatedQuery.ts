import {UseQueryOptions, UseQueryResult} from '@tanstack/react-query'
import {AxiosResponse} from 'axios'
import {useCallback, useEffect, useState} from 'react'

import {useSearchParam} from 'hooks/useSearchParam'
import {
    ApiListResponseCursorPagination,
    ApiPaginationParams,
} from 'models/api/types'

import {useResponseCursor} from './useResponseCursor'

type PaginatedQuery<T> = (
    params: {cursor: ApiPaginationParams['cursor']; [key: string]: unknown},
    overrides: UseQueryOptions<any>,
    ...args: any
) => UseQueryResult<AxiosResponse<ApiListResponseCursorPagination<T>>, unknown>

/**
 * Enriches query result with pagination utils for cursor paginated endpoints.
 * It also persists current cursor in url search params.
 */
export const usePaginatedQuery = <T>(
    query: PaginatedQuery<T>,
    params?: Omit<Parameters<PaginatedQuery<T>>[0], 'cursor'>,
    overrides?: Parameters<PaginatedQuery<T>>[1],
    searchParamLabel = 'cursor'
) => {
    const [cursor, setCursor] = useSearchParam(searchParamLabel)

    const [previousCursor, setPreviousCursor] = useState<string | null>(null)
    if (cursor && previousCursor !== cursor) {
        setPreviousCursor(cursor)
    }

    const queryResults = query(
        {...params, cursor},
        // We don’t want to re-fetch when we are back on first page
        // and cursor has just been cleared.
        {enabled: !(previousCursor && !cursor), ...overrides}
    )

    const {
        previousCursor: goToPreviousCursor,
        nextCursor: goToNextCursor,
        isCursorInvalid,
    } = useResponseCursor({
        data: queryResults.data,
        error: queryResults.error,
    })

    const fetchPreviousPage = useCallback(() => {
        setCursor(goToPreviousCursor)
    }, [goToPreviousCursor, setCursor])

    const fetchNextPage = useCallback(() => {
        setCursor(goToNextCursor)
    }, [goToNextCursor, setCursor])

    // reset cursor if it is invalid or if we are back on first page
    useEffect(() => {
        if (
            isCursorInvalid ||
            (!queryResults.isFetching && !goToPreviousCursor && cursor)
        ) {
            setCursor(null)
        }
        if (isCursorInvalid) {
            // Also clear previous cursor to avoid
            // having query disabled
            setPreviousCursor(null)
        }
    }, [
        isCursorInvalid,
        goToPreviousCursor,
        cursor,
        setCursor,
        queryResults.isFetching,
    ])

    return {
        hasPreviousPage: Boolean(goToPreviousCursor),
        fetchPreviousPage,
        hasNextPage: Boolean(goToNextCursor),
        fetchNextPage,
        ...queryResults,
    }
}
