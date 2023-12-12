import {useCallback, useEffect, useState} from 'react'
import axios, {AxiosError, CancelToken} from 'axios'
import _isEqual from 'lodash/isEqual'

import {Stat, StatsFilters} from 'models/stat/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {fetchStat} from 'models/stat/resources'
import {notify} from 'state/notifications/actions'
import {Notification, NotificationStatus} from 'state/notifications/types'
import {fetchStatEnded, fetchStatStarted} from 'state/ui/stats/actions'
import {statFetched} from 'state/entities/stats/actions'
import {errorToChildren} from 'utils'
import {StatsState} from 'state/entities/stats/types'
import {StatsState as StatsUIState} from 'state/ui/stats/types'
import useCancellableRequest from 'hooks/useCancellableRequest'
import useAppSelector from 'hooks/useAppSelector'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import useDebounce from 'hooks/useDebounce'

export const DEFAULT_ERROR_MESSAGE =
    'Failed to retrieve statistic. Please retry in a few seconds.'

type Params = {
    statName: string
    resourceName: string
    statsFilters: StatsFilters
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
        (state) => state.entities.stats
    )
    const statsFetchingState = useAppSelector<StatsUIState['fetchingMap']>(
        (state) => state.ui.stats.fetchingMap
    )
    const statKey = `${statName}/${resourceName}`
    const cleanStatsFilters = useCleanStatsFilters(statsFilters)
    const [cursor, setCursor] = useState<string | undefined>()
    const [filters, setFilters] = useState(cleanStatsFilters)

    const createFetchStat = useCallback(
        (cancelToken: CancelToken) => {
            return async () => {
                dispatch(fetchStatStarted({statName, resourceName}))
                try {
                    const stat = await fetchStat(
                        resourceName,
                        {
                            filters,
                            cursor,
                        },
                        {
                            cancelToken,
                        }
                    )
                    dispatch(
                        statFetched({
                            resourceName,
                            statName,
                            value: stat,
                        })
                    )
                    dispatch(fetchStatEnded({statName, resourceName}))
                } catch (error) {
                    if (axios.isCancel(error)) {
                        return
                    }
                    const notification: Notification = {
                        status: NotificationStatus.Error,
                        title:
                            (
                                error as AxiosError<{
                                    error?: {msg: string}
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
                    dispatch(fetchStatEnded({statName, resourceName}))
                }
            }
        },
        [dispatch, resourceName, statName, cursor, filters]
    )

    const [handleFetchStat] = useCancellableRequest(createFetchStat)

    useEffect(() => {
        void handleFetchStat()
    }, [handleFetchStat])

    useDebounce(
        () => {
            if (cleanStatsFilters && !_isEqual(cleanStatsFilters, filters)) {
                setFilters(cleanStatsFilters)
                setCursor(undefined)
            }
        },
        fetchDebounceDelay,
        [cleanStatsFilters, filters]
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
