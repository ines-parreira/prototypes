import { useEffect, useMemo, useState } from 'react'

import type { Moment } from 'moment/moment'
import moment from 'moment/moment'
import { useParams } from 'react-router-dom'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import { TicketMeasure } from 'domains/reporting/models/cubes/TicketCube'
import { aiAgentTouchedTicketTotalCountQueryFactory } from 'domains/reporting/models/queryFactories/ai-agent-insights/metrics'
import { PeriodFilter } from 'domains/reporting/pages/common/filters/PeriodFilter'
import {
    dateInPastFromStartOfToday,
    endOfToday,
} from 'domains/reporting/pages/common/utils'
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
} from 'domains/reporting/pages/constants'
import { getPageStatsFilters } from 'domains/reporting/state/stats/selectors'
import {
    defaultStatsFilters,
    setStatsFilters,
} from 'domains/reporting/state/stats/statsSlice'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

const HOURS_TO_REMOVE = 72
const L3_INTENTS_START_DATE = '2025-04-02'
const MAX_TICKETS = 10000
const MIN_DAYS = 1
const DEFAULT_SPAN = 14
const DEFAULT_DAYS_TO_SHOW = 7
const ANALYSIS_PERIOD_DAYS = 180

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

const getCalendarRangeFilters = (
    maxSpan: number,
): {
    [p: string]: [moment.Moment, moment.Moment]
} => {
    const standardPattern = {
        start: [
            adjustPeriodToStartOfL3IntentsGeneration,
            subtractsPeriodWithoutData,
        ],
        end: [subtractsPeriodWithoutData],
    }

    const weeklyPattern = {
        start: [],
        end: [subtractsPeriodWithoutDataIfNeeded],
    }

    const lastMonthPattern = {
        start: standardPattern.start,
        end: [subtractsPeriodWithoutDataIfNeeded],
    }

    const adjustments = {
        [LAST_WEEK_SUN]: weeklyPattern,
        [LAST_WEEK_MON]: weeklyPattern,
        [PAST_7_DAYS]: standardPattern,
        [MONTH_TO_DATE]: standardPattern,
        [LAST_MONTH]: lastMonthPattern,
        [PAST_30_DAYS]: standardPattern,
        [PAST_60_DAYS]: standardPattern,
        [PAST_90_DAYS]: standardPattern,
    }
    const excludeOptions: string[] = []

    const rangeThresholds = [
        { threshold: 90, options: [PAST_90_DAYS] },
        { threshold: 60, options: [PAST_60_DAYS, LAST_MONTH] },
        { threshold: 30, options: [PAST_30_DAYS, MONTH_TO_DATE] },
        { threshold: 14, options: [LAST_WEEK_SUN, LAST_WEEK_MON] },
        { threshold: 7, options: [PAST_7_DAYS] },
        { threshold: -1, options: [TODAY, YESTERDAY, PAST_YEAR] },
    ]

    rangeThresholds.forEach(({ threshold, options }) => {
        if (maxSpan < threshold || threshold === -1) {
            excludeOptions.push(...options)
        }
    })

    const ranges = getNewSetOfRanges({
        adjustments,
        excludeOptions,
    })

    return ranges
}

/**
 * Calculates the maximum allowable date range span based on historical ticket volume
 * This prevents merchants from selecting date ranges that would exceed the 10,000 ticket limit
 */
const useMaxSpanCalculation = () => {
    const [calculatedMaxSpan, setCalculatedMaxSpan] = useState(DEFAULT_SPAN)
    const [isLoading, setIsLoading] = useState(true)
    const { userTimezone } = useAutomateFilters()
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()
    const { shopName } = useParams<{ shopName: string }>()
    const integrationIds = useGetTicketChannelsStoreIntegrations(shopName)

    // Get the current time minus 72 hours as the end of our analysis period
    const analysisEndTime = useMemo(
        () => subtractsPeriodWithoutData(moment()).format(),
        [],
    )

    // Get the start time for our analysis (historical look back period)
    const analysisStartTime = useMemo(
        () =>
            moment(analysisEndTime)
                .subtract(ANALYSIS_PERIOD_DAYS, 'days')
                .format(),
        [analysisEndTime],
    )

    const { data } = useMetricPerDimension(
        aiAgentTouchedTicketTotalCountQueryFactory({
            filters: {
                period: {
                    end_datetime: analysisEndTime,
                    start_datetime: analysisStartTime,
                },
            },
            timezone: userTimezone,
            outcomeFieldId: outcomeCustomFieldId,
            intentFieldId: intentCustomFieldId,
            integrationIds,
        }),
    )

    // trying to get the max span for the period filter

    useEffect(() => {
        if (data) {
            setIsLoading(false)
            if (!data.allData) {
                setCalculatedMaxSpan(DEFAULT_SPAN)
                return
            }

            const totalTickets = data.allData.reduce(
                (sum: number, item: any) =>
                    sum + Number(item[TicketMeasure.TicketCount] || 0),
                0,
            )

            if (totalTickets === 0) {
                setCalculatedMaxSpan(DEFAULT_SPAN)
                return
            }

            const ticketsPerDay = totalTickets / ANALYSIS_PERIOD_DAYS

            // Basically a calculation to see how many days we can include without exceeding ticket limit
            const safeMaxDays = Math.floor((MAX_TICKETS * 0.85) / ticketsPerDay)

            const maxSpan = Math.min(
                Math.max(safeMaxDays, MIN_DAYS),
                ANALYSIS_PERIOD_DAYS,
            )
            setCalculatedMaxSpan(maxSpan)
        }
    }, [data])

    return { maxSpan: calculatedMaxSpan, isLoading }
}

export const AdjustedPeriodFilter = () => {
    const dispatch = useAppDispatch()
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    const [isPeriodFilterSet, setIsPeriodFilterSet] = useState(false)

    // Get the maximum span calculated from historical data
    const { maxSpan, isLoading } = useMaxSpanCalculation()

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

    // Memoize the date ranges based on the calculated max span
    const dateRanges = useMemo(
        () => getCalendarRangeFilters(maxSpan),
        [maxSpan],
    )

    // Show loading state or the period filter
    if (isLoading) {
        return <div>Loading calendar options...</div>
    }

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
                        maxSpan,
                    }}
                    tooltipMessageForPreviousPeriod="There is no data available on this date yet."
                    initialV2Props={{
                        dateRanges,
                    }}
                />
            )}
        </>
    )
}
