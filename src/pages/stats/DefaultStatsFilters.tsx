import React, {ReactNode, useEffect, useMemo} from 'react'
import _isEqual from 'lodash/isEqual'
import moment from 'moment-timezone'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    resetStatsFilters,
    defaultStatsFilters,
    setStatsFiltersWithLogicalOperators,
} from 'state/stats/statsSlice'
import {getStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {isCleanStatsDirty} from 'state/ui/stats/selectors'
import useCurrentFilters from 'hooks/reporting/useCurrentFilters'
import {getTimezone} from 'state/currentUser/selectors'
import {StatsFiltersWithLogicalOperator} from 'models/stat/types'

type Props = {
    children?: ReactNode
    notReadyFallback?: ReactNode
}

export default function DefaultStatsFilters({
    children,
    notReadyFallback,
}: Props) {
    const dispatch = useAppDispatch()
    const statsFilters = useAppSelector(getStatsFiltersWithLogicalOperators)
    const isFilterDirty = useAppSelector(isCleanStatsDirty)
    const userTimezone = useAppSelector(getTimezone)

    const currentDay = userTimezone ? moment().tz(userTimezone) : moment()

    const defaultFilters: StatsFiltersWithLogicalOperator = {
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

    const {filters, persistFilters} = useCurrentFilters(defaultFilters)

    const isReady = useMemo(
        () => !_isEqual(statsFilters, defaultStatsFilters),
        [statsFilters]
    )

    useEffect(() => {
        dispatch(setStatsFiltersWithLogicalOperators(filters))
        return () => {
            dispatch(resetStatsFilters())
            persistFilters(defaultStatsFilters)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (isReady && !isFilterDirty) {
            persistFilters(statsFilters)
        }
    }, [isReady, isFilterDirty, persistFilters, statsFilters])

    return <>{isReady ? children : notReadyFallback}</>
}
