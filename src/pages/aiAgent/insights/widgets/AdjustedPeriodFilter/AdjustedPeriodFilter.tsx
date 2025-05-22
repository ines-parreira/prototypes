import React, { useEffect, useState } from 'react'

import moment, { Moment } from 'moment/moment'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { PeriodFilter } from 'pages/stats/common/filters/PeriodFilter'
import {
    dateInPastFromStartOfToday,
    endOfToday,
} from 'pages/stats/common/utils'
import {
    getNewSetOfRanges,
    LAST_MONTH,
    LAST_WEEK_MON,
    LAST_WEEK_SUN,
    MONTH_TO_DATE,
    PAST_7_DAYS,
    PAST_30_DAYS,
    PAST_60_DAYS,
    PAST_90_DAYS,
    PAST_YEAR,
    TODAY,
    YESTERDAY,
} from 'pages/stats/constants'
import { getPageStatsFilters } from 'state/stats/selectors'
import { defaultStatsFilters, setStatsFilters } from 'state/stats/statsSlice'

const HOURS_TO_REMOVE = 72
const L3_INTENTS_START_DATE = '2025-04-02'
export const adjustPeriodToStartOfL3IntentsGeneration = (
    momentDate: Moment,
) => {
    return momentDate.isBefore(L3_INTENTS_START_DATE)
        ? moment(L3_INTENTS_START_DATE)
        : momentDate
}
export const subtractsPeriodWithoutData = (momentDate: Moment) => {
    return momentDate.subtract(HOURS_TO_REMOVE, 'hours')
}

export const subtractsPeriodWithoutDataIfNeeded = (momentDate: Moment) => {
    const adjustedDate = moment().subtract(HOURS_TO_REMOVE, 'hours')
    if (momentDate.isAfter(adjustedDate)) {
        return momentDate.subtract(
            momentDate.diff(adjustedDate, 'hours'),
            'hours',
        )
    }

    return momentDate
}

const getCalendarRangeFilters = (): {
    [p: string]: [moment.Moment, moment.Moment]
} => {
    const adjustments = {
        [LAST_WEEK_SUN]: {
            start: [],
            end: [subtractsPeriodWithoutDataIfNeeded],
        },
        [LAST_WEEK_MON]: {
            start: [],
            end: [subtractsPeriodWithoutDataIfNeeded],
        },
        [PAST_7_DAYS]: {
            start: [
                adjustPeriodToStartOfL3IntentsGeneration,
                subtractsPeriodWithoutData,
            ],
            end: [subtractsPeriodWithoutData],
        },
    }

    return getNewSetOfRanges({
        adjustments,
        excludeOptions: [
            TODAY,
            YESTERDAY,
            MONTH_TO_DATE,
            LAST_MONTH,
            PAST_30_DAYS,
            PAST_60_DAYS,
            PAST_90_DAYS,
            PAST_90_DAYS,
            PAST_YEAR,
        ],
    })
}

const DEFAULT_DAYS_TO_SHOW = 7

export const AdjustedPeriodFilter = () => {
    const dispatch = useAppDispatch()

    const pageStatsFilters = useAppSelector(getPageStatsFilters)

    const [isPeriodFilterSet, setIsPeriodFilterSet] = useState(false)

    useEffect(() => {
        if (
            pageStatsFilters.period.start_datetime ===
                defaultStatsFilters.period.start_datetime ||
            pageStatsFilters.period.end_datetime ===
                defaultStatsFilters.period.end_datetime
        ) {
            dispatch(
                setStatsFilters({
                    period: {
                        start_datetime: moment(
                            adjustPeriodToStartOfL3IntentsGeneration(
                                subtractsPeriodWithoutData(
                                    dateInPastFromStartOfToday(
                                        DEFAULT_DAYS_TO_SHOW,
                                    ),
                                ),
                            ),
                        ).format(),
                        end_datetime: moment(
                            subtractsPeriodWithoutData(endOfToday()),
                        ).format(),
                    },
                }),
            )
        }

        setIsPeriodFilterSet(true)
    }, [pageStatsFilters, dispatch])

    return (
        <>
            {isPeriodFilterSet && (
                <PeriodFilter
                    value={{
                        start_datetime: pageStatsFilters.period.start_datetime,
                        end_datetime: pageStatsFilters.period.end_datetime,
                    }}
                    initialSettings={{
                        maxDate: moment().subtract(HOURS_TO_REMOVE, 'hours'),
                        minDate: moment(L3_INTENTS_START_DATE),
                    }}
                    tooltipMessageForPreviousPeriod="There is no data available on this date yet."
                    initialV2Props={{
                        dateRanges: getCalendarRangeFilters(),
                    }}
                />
            )}
        </>
    )
}
