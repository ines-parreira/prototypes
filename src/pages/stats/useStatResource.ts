import {useCallback, useEffect, useState} from 'react'
import {useDebounce} from 'react-use'
import axios, {AxiosError, CancelToken} from 'axios'
import {useSelector} from 'react-redux'
import _isEqual from 'lodash/isEqual'

import {Stat} from '../../models/stat/types'
import useAppDispatch from '../../hooks/useAppDispatch'
import {fetchStat} from '../../models/stat/resources'
import {notify} from '../../state/notifications/actions'
import {Notification, NotificationStatus} from '../../state/notifications/types'
import {fetchStatEnded, fetchStatStarted} from '../../state/ui/stats/actions'
import {statFetched} from '../../state/entities/stats/actions'
import {errorToChildren} from '../../utils'
import {RootState} from '../../state/types'
import {StatsState} from '../../state/entities/stats/types'
import {StatsState as StatsUIState} from '../../state/ui/stats/types'
import {StatsFilters} from '../../state/stats/types'
import useCancellableRequest from '../../hooks/useCancellableRequest'

type Params = {
    statName: string
    resourceName: string
    statsFilters: StatsFilters | null
    fetchDebounceDelay?: number
}

export default function useStatResource<T>({
    statName,
    resourceName,
    statsFilters,
    fetchDebounceDelay = 1000,
}: Params): [Stat<T> | null, boolean] {
    const dispatch = useAppDispatch()
    const statsState = useSelector<RootState, StatsState>(
        (state) => state.entities.stats
    )
    const statsFetchingState = useSelector<
        RootState,
        StatsUIState['fetchingMap']
    >((state) => state.ui.stats.fetchingMap)
    const statKey = `${statName}/${resourceName}`
    const [debouncedStatsFilters, setDebouncedStatsFilters] =
        useState(statsFilters)

    const createFetchStat = useCallback(
        (cancelToken: CancelToken) => {
            return async () => {
                if (!debouncedStatsFilters) {
                    return
                }

                dispatch(fetchStatStarted({statName, resourceName}))

                try {
                    const stat = await fetchStat(
                        resourceName,
                        {
                            filters: debouncedStatsFilters,
                        },
                        {cancelToken}
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
                            'Failed to retrieve statistic. Please retry in a few seconds.',
                    }
                    const errorDetails = errorToChildren(error as AxiosError)
                    if (errorDetails) {
                        notification.allowHTML = true
                        notification.message = errorDetails
                    }

                    void dispatch(notify(notification))
                    dispatch(fetchStatEnded({statName, resourceName}))
                }
            }
        },
        [dispatch, resourceName, debouncedStatsFilters, statName]
    )

    const [handleFetchStat] = useCancellableRequest(createFetchStat)

    useEffect(() => {
        void handleFetchStat()
    }, [handleFetchStat])

    useDebounce(
        () => {
            if (!_isEqual(statsFilters, debouncedStatsFilters)) {
                setDebouncedStatsFilters(statsFilters)
            }
        },
        fetchDebounceDelay,
        [statsFilters]
    )

    useEffect(() => {
        if (statsFilters && !debouncedStatsFilters) {
            setDebouncedStatsFilters(statsFilters)
        }
    }, [statsFilters, debouncedStatsFilters])

    return [
        (statsState[statKey] as Stat<T> | undefined) || null,
        statsFetchingState[statKey] ?? true,
    ]
}
