import moment, {Moment} from 'moment/moment'
import React, {useState} from 'react'
import {useDispatch} from 'react-redux'

import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import {PeriodFilter} from 'pages/stats/common/filters/PeriodFilter'

import {dateInPastFromStartOfToday, endOfToday} from 'pages/stats/common/utils'

import {
    PAST_30_DAYS,
    PAST_60_DAYS,
    PAST_7_DAYS,
    PAST_90_DAYS,
    MONTH_TO_DATE,
    LAST_WEEK_SUN,
    LAST_WEEK_MON,
    LAST_MONTH,
    PAST_YEAR,
    TODAY,
    YESTERDAY,
    getNewSetOfRanges,
} from 'pages/stats/constants'
import {getPageStatsFilters} from 'state/stats/selectors'
import {setStatsFilters} from 'state/stats/statsSlice'

const HOURS_TO_REMOVE = 72

export const subtractsPeriodWithoutData = (momentDate: Moment) => {
    return momentDate.subtract(HOURS_TO_REMOVE, 'hours')
}

export const subtractsPeriodWithoutDataIfNeeded = (momentDate: Moment) => {
    if (momentDate.isAfter(moment().subtract(HOURS_TO_REMOVE, 'hours'))) {
        return momentDate.subtract(
            HOURS_TO_REMOVE - moment().diff(momentDate, 'hours'),
            'hours'
        )
    }
    return momentDate
}

const getCalendarRangeFilters = (): {
    [p: string]: [moment.Moment, moment.Moment]
} => {
    const adjustments = {
        [MONTH_TO_DATE]: {
            start: [],
            end: [subtractsPeriodWithoutData],
        },
        [LAST_WEEK_SUN]: {
            start: [],
            end: [subtractsPeriodWithoutDataIfNeeded],
        },
        [LAST_WEEK_MON]: {
            start: [],
            end: [subtractsPeriodWithoutDataIfNeeded],
        },
        [LAST_MONTH]: {
            start: [],
            end: [subtractsPeriodWithoutDataIfNeeded],
        },
        [PAST_7_DAYS]: {
            start: [subtractsPeriodWithoutData],
            end: [subtractsPeriodWithoutData],
        },
        [PAST_30_DAYS]: {
            start: [subtractsPeriodWithoutData],
            end: [subtractsPeriodWithoutData],
        },
        [PAST_60_DAYS]: {
            start: [subtractsPeriodWithoutData],
            end: [subtractsPeriodWithoutData],
        },
        [PAST_90_DAYS]: {
            start: [subtractsPeriodWithoutData],
            end: [subtractsPeriodWithoutData],
        },
        [PAST_YEAR]: {
            start: [subtractsPeriodWithoutData],
            end: [subtractsPeriodWithoutData],
        },
    }

    return getNewSetOfRanges({
        adjustments,
        excludeOptions: [TODAY, YESTERDAY],
    })
}

const DEFAULT_DAYS_TO_SHOW = 28

export const AdjustedPeriodFilter = () => {
    const dispatch = useDispatch()

    const pageStatsFilters = useAppSelector(getPageStatsFilters)

    const [isPeriodFilterSet, setIsPeriodFilterSet] = useState(false)

    useEffectOnce(() => {
        dispatch(
            setStatsFilters({
                period: {
                    start_datetime: moment(
                        subtractsPeriodWithoutData(
                            dateInPastFromStartOfToday(DEFAULT_DAYS_TO_SHOW)
                        )
                    ).format(),
                    end_datetime: moment(
                        subtractsPeriodWithoutData(endOfToday())
                    ).format(),
                },
            })
        )

        setIsPeriodFilterSet(true)
    })

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
