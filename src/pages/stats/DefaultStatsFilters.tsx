import React, { ReactNode, useEffect, useMemo } from 'react'

import _isEqual from 'lodash/isEqual'
import moment from 'moment-timezone'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import useCurrentFilters from 'hooks/reporting/useCurrentFilters'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { StatsFiltersWithLogicalOperator } from 'models/stat/types'
import { activeParams } from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import { getTimezone } from 'state/currentUser/selectors'
import { getStatsFiltersWithLogicalOperators } from 'state/stats/selectors'
import {
    defaultStatsFilters,
    resetStatsFilters,
    setStatsFiltersWithLogicalOperators,
} from 'state/stats/statsSlice'
import { isCleanStatsDirty } from 'state/ui/stats/selectors'

type Props = {
    children?: ReactNode
    notReadyFallback?: ReactNode
}

export default function DefaultStatsFilters({
    children,
    notReadyFallback,
}: Props) {
    useCustomFieldDefinitions(activeParams)
    const dispatch = useAppDispatch()
    const reduxFilters = useAppSelector(getStatsFiltersWithLogicalOperators)
    const isFilterDirty = useAppSelector(isCleanStatsDirty)

    const userTimezone = useAppSelector(getTimezone)

    const currentDay = userTimezone ? moment().tz(userTimezone) : moment()

    const defaultFilters: StatsFiltersWithLogicalOperator = useMemo(() => {
        return {
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
    }, [currentDay])

    const { filters: sessionFilters, persistFilters } =
        useCurrentFilters(defaultFilters)

    const isReady = useMemo(
        () => !_isEqual(reduxFilters, defaultStatsFilters),
        [reduxFilters],
    )

    useEffect(() => {
        dispatch(setStatsFiltersWithLogicalOperators(sessionFilters))

        return () => {
            dispatch(resetStatsFilters())
            persistFilters(defaultStatsFilters)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (
            isReady &&
            !isFilterDirty &&
            !_isEqual(sessionFilters, reduxFilters)
        ) {
            persistFilters(reduxFilters)
        }
    }, [isReady, isFilterDirty, persistFilters, sessionFilters, reduxFilters])

    return <>{isReady ? children : notReadyFallback}</>
}
