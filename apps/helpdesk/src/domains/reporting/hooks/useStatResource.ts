import { useCallback, useEffect, useState } from 'react'

import { useDebouncedEffect } from '@repo/hooks'
import type { AxiosError, CancelToken } from 'axios'
import { isCancel } from 'axios'
import _isEqual from 'lodash/isEqual'

import { fetchStat } from 'domains/reporting/models/stat/resources'
import type {
    LegacyStatsFilters,
    Stat,
} from 'domains/reporting/models/stat/types'
import {
    fetchStatEnded,
    fetchStatStarted,
} from 'domains/reporting/state/ui/stats/fetchingMapSlice'
import type { StatsState as StatsUIState } from 'domains/reporting/state/ui/stats/reducer'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useCancellableRequest from 'hooks/useCancellableRequest'
import { statFetched } from 'state/entities/stats/actions'
import type { StatsState } from 'state/entities/stats/types'
import { notify } from 'state/notifications/actions'
import type { Notification } from 'state/notifications/types'
import { NotificationStatus } from 'state/notifications/types'
import { errorToChildren } from 'utils'

export const DEFAULT_ERROR_MESSAGE =
    'Failed to retrieve statistic. Please retry in a few seconds.'

type Params = {
    statName: string
    resourceName: string
    statsFilters: LegacyStatsFilters
    fetchDebounceDelay?: number
}

export default function useStatResource<T>({
    statName,
    resourceName,
    statsFilters,
    fetchDebounceDelay = 1000,
}: Params): [Stat<T> | null, boolean, (cursor: string) => void] {
    const dispatch = useAppDispatch()
    const statsState = useAppSelector<StatsState>(
        (state) => state.entities.stats,
    )
    const statsFetchingState = useAppSelector<StatsUIState['fetchingMap']>(
        (state) => state.ui.stats.fetchingMap,
    )
    const statKey = `${statName}/${resourceName}`
    const [cursor, setCursor] = useState<string | undefined>()
    const [filters, setFilters] = useState(statsFilters)

    const createFetchStat = useCallback(
        (cancelToken: CancelToken) => {
            return async () => {
                dispatch(fetchStatStarted({ statName, resourceName }))
                try {
                    const stat = await fetchStat(
                        resourceName,
                        {
                            filters,
                            cursor,
                        },
                        {
                            cancelToken,
                        },
                    )
                    dispatch(
                        statFetched({
                            resourceName,
                            statName,
                            value: stat,
                        }),
                    )
                    dispatch(fetchStatEnded({ statName, resourceName }))
                } catch (error) {
                    if (isCancel(error)) {
                        return
                    }
                    const notification: Notification = {
                        status: NotificationStatus.Error,
                        title:
                            (
                                error as AxiosError<{
                                    error?: { msg: string }
                                }>
                            ).response?.data?.error?.msg ||
                            DEFAULT_ERROR_MESSAGE,
                    }
                    const errorDetails = errorToChildren(error)
                    if (errorDetails) {
                        notification.allowHTML = true
                        notification.message = errorDetails
                    }

                    void dispatch(notify(notification))
                    dispatch(fetchStatEnded({ statName, resourceName }))
                }
            }
        },
        [dispatch, resourceName, statName, cursor, filters],
    )

    const [handleFetchStat] = useCancellableRequest(createFetchStat)

    useEffect(() => {
        void handleFetchStat()
    }, [handleFetchStat])

    useDebouncedEffect(
        () => {
            if (statsFilters && !_isEqual(statsFilters, filters)) {
                setFilters(statsFilters)
                setCursor(undefined)
            }
        },
        [statsFilters, filters],
        fetchDebounceDelay,
    )

    const fetchPage = useCallback((cursor: string) => {
        setCursor(cursor)
    }, [])

    return [
        (statsState[statKey] as Stat<T> | undefined) || null,
        statsFetchingState[statKey] ?? true,
        fetchPage,
    ]
}
