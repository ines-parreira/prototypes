import { useCallback, useEffect, useMemo, useState } from 'react'

import { debounce } from 'lodash'
import _flatten from 'lodash/flatten'

import { useInfiniteListBusinessHours } from 'hooks/businessHours/useInfiniteListBusinessHours'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const BUSINESS_HOURS_LIMIT = 20
export const BUSINESS_HOURS_SEARCH_DEBOUNCE_TIME = 300
export const BUSINESS_HOURS_FETCH_ERROR_MESSAGE =
    'Failed to fetch business hours'

export const useBusinessHoursSearch = () => {
    const dispatch = useAppDispatch()

    const [query, setQuery] = useState('')

    const queryResult = useInfiniteListBusinessHours(
        {
            name: query,
            limit: BUSINESS_HOURS_LIMIT,
        },
        {
            staleTime: 60_000,
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
            void dispatch(
                notify({
                    message: BUSINESS_HOURS_FETCH_ERROR_MESSAGE,
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [isError, dispatch])

    return {
        ...queryResult,
        handleBusinessHoursSearch,
        onLoad: fetchNextPage,
        businessHours,
        shouldLoadMore: (hasNextPage && !isFetchingNextPage) ?? false,
    }
}
