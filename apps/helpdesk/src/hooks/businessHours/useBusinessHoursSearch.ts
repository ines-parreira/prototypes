import { useCallback, useEffect, useMemo, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { debounce } from 'lodash'
import _flatten from 'lodash/flatten'

import { toast } from '@gorgias/axiom'

import { useInfiniteListBusinessHours } from 'hooks/businessHours/useInfiniteListBusinessHours'

export const BUSINESS_HOURS_LIMIT = 20
export const BUSINESS_HOURS_SEARCH_DEBOUNCE_TIME = Duration.millis(300)
export const BUSINESS_HOURS_FETCH_ERROR_MESSAGE =
    'Failed to fetch business hours'

export const useBusinessHoursSearch = () => {
    const [query, setQuery] = useState('')

    const queryResult = useInfiniteListBusinessHours(
        {
            name: query,
            limit: BUSINESS_HOURS_LIMIT,
        },
        {
            staleTime: Duration.minutes(1),
            refetchOnWindowFocus: false,
        },
    )

    const { data, isFetchingNextPage, hasNextPage, fetchNextPage, isError } =
        queryResult

    // eslint-disable-next-line exhaustive-deps
    const handleBusinessHoursSearch = useCallback(
        debounce(setQuery, BUSINESS_HOURS_SEARCH_DEBOUNCE_TIME),
        [setQuery],
    )

    const businessHours = useMemo(
        () => _flatten(data?.pages.map((page) => page.data.data)),
        [data],
    )

    useEffect(() => {
        if (isError) {
            toast.error(BUSINESS_HOURS_FETCH_ERROR_MESSAGE)
        }
    }, [isError])

    return {
        ...queryResult,
        handleBusinessHoursSearch,
        onLoad: fetchNextPage,
        businessHours,
        shouldLoadMore: (hasNextPage && !isFetchingNextPage) ?? false,
    }
}
