import React, {ReactNode, useEffect, useMemo} from 'react'
import moment from 'moment-timezone'
import _isEqual from 'lodash/isEqual'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {resetStatsFilters, setStatsFilters} from 'state/stats/actions'
import {getStatsFilters} from 'state/stats/selectors'
import {defaultStatsFilters} from 'state/stats/reducers'
import {StatsFilters} from 'models/stat/types'

type Props = {
    children?: ReactNode
    notReadyFallback?: ReactNode
}

export default function DefaultStatsFilters({
    children,
    notReadyFallback,
}: Props) {
    const dispatch = useAppDispatch()
    const userTimezone = useAppSelector(getTimezone)
    const statsFilters = useAppSelector(getStatsFilters)

    const isReady = useMemo(
        () => !_isEqual(statsFilters, defaultStatsFilters),
        [statsFilters]
    )

    useEffect(() => {
        const currentDay = userTimezone ? moment().tz(userTimezone) : moment()
        const defaultFilters: StatsFilters = {
            period: {
                // default period: last 7 days
                start_datetime: currentDay
                    .clone()
                    .startOf('day')
                    .subtract(6, 'days')
                    .format(),
                end_datetime: currentDay.clone().endOf('day').format(),
            },
        }
        dispatch(setStatsFilters(defaultFilters))
        return () => {
            dispatch(resetStatsFilters())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return <>{isReady ? children : notReadyFallback}</>
}
