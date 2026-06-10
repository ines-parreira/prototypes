import type { ReactNode } from 'react'
import React, { useCallback, useMemo } from 'react'

import type { DateValue, ZonedDateTime } from '@internationalized/date'
import { CalendarDate, now } from '@internationalized/date'
import {
    DateTimeFormatMapper,
    DateTimeFormatType,
    formatDatetime,
} from '@repo/utils'
import type { DateOrString, Options as InitialSettings } from 'daterangepicker'
import moment from 'moment-timezone'
import { useEffectOnce } from '@gorgias/toolkit-react'

import {
    Button,
    DateRangePicker,
    DateRangePickerChangeEventSource,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import type {
    FilterKey,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import css from 'domains/reporting/pages/common/filters/PeriodFilter.less'
import { mergeStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'

const MAX_SPAN = 90

type CompactPeriodFilterProps = {
    value: StatsFilters[FilterKey.Period]
    initialSettings?: Omit<InitialSettings, 'maxSpan'> & { maxSpan?: number }
    warningMessage?: string
    getDateTooltip?: (date: DateValue) => ReactNode
}

function toCalendarDate(
    value: DateOrString | undefined,
    timeZone: string,
): CalendarDate | null {
    if (!value) return null
    const m = moment.tz(value, timeZone)
    if (!m.isValid()) return null
    return new CalendarDate(m.year(), m.month() + 1, m.date())
}

export function PeriodFilterCompact({
    value,
    initialSettings: initialSettingsProp,
    warningMessage,
    getDateTooltip,
}: CompactPeriodFilterProps) {
    const dispatch = useAppDispatch()
    const effectiveMaxSpan = initialSettingsProp?.maxSpan ?? MAX_SPAN
    const timeZone = moment.tz.guess()
    const maxDateMoment = useMemo(
        () =>
            initialSettingsProp?.maxDate
                ? moment.tz(initialSettingsProp.maxDate, timeZone)
                : null,
        [initialSettingsProp?.maxDate, timeZone],
    )

    useEffectOnce(() => {
        let start = moment.tz(value.start_datetime, timeZone)
        const end = moment.tz(value.end_datetime, timeZone)
        const exceedsMaxSpan = end.diff(start, 'days') > effectiveMaxSpan
        const exceedsMaxDate = !!maxDateMoment && end.isAfter(maxDateMoment)
        if (exceedsMaxSpan || exceedsMaxDate) {
            const spanClampedEnd = exceedsMaxSpan
                ? start
                      .clone()
                      .add(effectiveMaxSpan, 'days')
                      .subtract(1, 'seconds')
                : end
            const clampedEnd =
                maxDateMoment && spanClampedEnd.isAfter(maxDateMoment)
                    ? maxDateMoment.clone().endOf('day')
                    : spanClampedEnd
            if (maxDateMoment && start.isAfter(maxDateMoment)) {
                start = maxDateMoment.clone().startOf('day')
            }
            dispatch(
                mergeStatsFilters({
                    period: {
                        start_datetime: start.startOf('day').format(),
                        end_datetime: clampedEnd.format(),
                    },
                }),
            )
        }
    })

    const minDateMoment = useMemo(
        () =>
            initialSettingsProp?.minDate
                ? moment.tz(initialSettingsProp.minDate, timeZone)
                : null,
        [initialSettingsProp?.minDate, timeZone],
    )

    const handleChange = useCallback(
        (
            newValue: { start: ZonedDateTime; end: ZonedDateTime } | null,
            source?: DateRangePickerChangeEventSource,
        ) => {
            if (!newValue) return
            let start = moment
                .tz(newValue.start.toDate(), timeZone)
                .startOf('day')
            let end = moment.tz(newValue.end.toDate(), timeZone).endOf('day')

            if (end.diff(start, 'days') > effectiveMaxSpan) {
                end = start
                    .clone()
                    .add(effectiveMaxSpan, 'days')
                    .subtract(1, 'seconds')
            }

            if (maxDateMoment && end.isAfter(maxDateMoment)) {
                if (source === DateRangePickerChangeEventSource.Preset) {
                    const span = end.diff(start, 'days')
                    end = maxDateMoment.clone().endOf('day')
                    start = maxDateMoment
                        .clone()
                        .subtract(span, 'days')
                        .startOf('day')
                } else {
                    end = maxDateMoment.clone().endOf('day')
                    /* istanbul ignore next */
                    if (start.isAfter(maxDateMoment)) {
                        start = maxDateMoment.clone().startOf('day')
                    }
                }
            }

            if (minDateMoment && start.isBefore(minDateMoment, 'day')) {
                start = minDateMoment.clone().startOf('day')
            }

            dispatch(
                mergeStatsFilters({
                    period: {
                        start_datetime: start.format(),
                        end_datetime: end.format(),
                    },
                }),
            )
        },
        [dispatch, effectiveMaxSpan, maxDateMoment, minDateMoment, timeZone],
    )

    const pickerValue = useMemo(() => {
        const toZoned = (iso: string) => {
            const m = moment.tz(iso, timeZone)
            return now(timeZone).set({
                year: m.year(),
                month: m.month() + 1,
                day: m.date(),
            })
        }

        return {
            start: toZoned(value.start_datetime),
            end: toZoned(value.end_datetime),
        }
    }, [value.start_datetime, value.end_datetime, timeZone])

    const minDate = useMemo(
        () => toCalendarDate(initialSettingsProp?.minDate, timeZone),
        [initialSettingsProp?.minDate, timeZone],
    )

    const maxDate = useMemo(
        () => toCalendarDate(initialSettingsProp?.maxDate, timeZone),
        [initialSettingsProp?.maxDate, timeZone],
    )

    const presets = useMemo(() => {
        const allPresets = [
            { id: 'all-time', label: 'All time', duration: { years: -10 } },
            { id: 'today', label: 'Today', duration: { days: 0 } },
            { id: 'last-7-days', label: 'Last 7 days', duration: { days: -6 } },
            {
                id: 'last-30-days',
                label: 'Last 30 days',
                duration: { days: -29 },
            },
            {
                id: 'last-60-days',
                label: 'Last 60 days',
                duration: { days: -59 },
            },
            {
                id: 'last-3-months',
                label: 'Last 3 months',
                duration: { months: -3, days: 1 },
            },
            {
                id: 'last-6-months',
                label: 'Last 6 months',
                duration: { months: -6, days: 1 },
            },
            {
                id: 'last-year',
                label: 'Last year',
                duration: { years: -1, days: 1 },
            },
        ]

        const nowTz = moment.tz(timeZone)
        const isMaxDateInPast =
            !!maxDateMoment && maxDateMoment.isBefore(nowTz, 'day')
        const anchorMoment = isMaxDateInPast ? maxDateMoment : nowTz

        return allPresets.filter((preset) => {
            if (preset.id === 'today' && isMaxDateInPast) return false

            const shiftedStart = anchorMoment.clone().add(preset.duration)
            if (anchorMoment.diff(shiftedStart, 'days') > effectiveMaxSpan)
                return false
            if (minDateMoment && shiftedStart.isBefore(minDateMoment, 'day'))
                return false

            return true
        })
    }, [effectiveMaxSpan, maxDateMoment, minDateMoment, timeZone])

    const isDateUnavailable = useCallback(
        (date: DateValue) => {
            if (minDate && date.compare(minDate) < 0) return true
            return !!(maxDate && date.compare(maxDate) > 0)
        },
        [minDate, maxDate],
    )

    const formatDateRange = useCallback(() => {
        const format =
            DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_US]
        return `${formatDatetime(value.start_datetime, format, timeZone)} – ${formatDatetime(value.end_datetime, format, timeZone)}`
    }, [value.start_datetime, value.end_datetime, timeZone])

    return (
        <div className={css.compactWrapper}>
            <DateRangePicker
                value={pickerValue}
                onChange={handleChange}
                presets={presets}
                aria-label="Date range picker"
                placement="bottom left"
                isDateUnavailable={isDateUnavailable}
                getDateTooltip={getDateTooltip}
                trigger={(renderProps) => {
                    const button = (
                        <Button
                            {...renderProps}
                            variant="tertiary"
                            id="period-filter-compact-trigger"
                        >
                            <span className={css.compactLabel}>Date</span>
                            <span className={css.compactValue}>
                                {formatDateRange()}
                            </span>
                        </Button>
                    )
                    return warningMessage ? (
                        <Tooltip trigger={button}>
                            <TooltipContent title={warningMessage} />
                        </Tooltip>
                    ) : (
                        button
                    )
                }}
            />
        </div>
    )
}
