import React, { useCallback, useMemo } from 'react'

import type { DateValue, ZonedDateTime } from '@internationalized/date'
import { CalendarDate, now } from '@internationalized/date'
import { useEffectOnce } from '@repo/hooks'
import {
    DateTimeFormatMapper,
    DateTimeFormatType,
    formatDatetime,
} from '@repo/utils'
import type { DateOrString, Options as InitialSettings } from 'daterangepicker'
import moment from 'moment-timezone'

import { Button, DateRangePicker } from '@gorgias/axiom'

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
}: CompactPeriodFilterProps) {
    const dispatch = useAppDispatch()
    const effectiveMaxSpan = initialSettingsProp?.maxSpan ?? MAX_SPAN
    const timeZone = moment.tz.guess()

    useEffectOnce(() => {
        const start = moment.tz(value.start_datetime, timeZone)
        const end = moment.tz(value.end_datetime, timeZone)
        if (end.diff(start, 'days') > effectiveMaxSpan) {
            dispatch(
                mergeStatsFilters({
                    period: {
                        start_datetime: start.clone().startOf('day').format(),
                        end_datetime: start
                            .clone()
                            .add(effectiveMaxSpan, 'days')
                            .subtract(1, 'seconds')
                            .format(),
                    },
                }),
            )
        }
    })

    const handleChange = useCallback(
        (newValue: { start: ZonedDateTime; end: ZonedDateTime } | null) => {
            if (!newValue) return
            const start = moment
                .tz(newValue.start.toDate(), timeZone)
                .startOf('day')
            const end = moment.tz(newValue.end.toDate(), timeZone).endOf('day')
            const clampedEnd =
                end.diff(start, 'days') > effectiveMaxSpan
                    ? start
                          .clone()
                          .add(effectiveMaxSpan, 'days')
                          .subtract(1, 'seconds')
                    : end
            dispatch(
                mergeStatsFilters({
                    period: {
                        start_datetime: start.format(),
                        end_datetime: clampedEnd.format(),
                    },
                }),
            )
        },
        [dispatch, effectiveMaxSpan, timeZone],
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
            { id: 'last-7-days', label: 'Last 7 days', duration: { days: -7 } },
            {
                id: 'last-30-days',
                label: 'Last 30 days',
                duration: { days: -30 },
            },
            {
                id: 'last-60-days',
                label: 'Last 60 days',
                duration: { days: -60 },
            },
            {
                id: 'last-3-months',
                label: 'Last 3 months',
                duration: { months: -3 },
            },
            {
                id: 'last-6-months',
                label: 'Last 6 months',
                duration: { months: -6 },
            },
            { id: 'last-year', label: 'Last year', duration: { years: -1 } },
        ]

        const nowTz = moment.tz(timeZone)
        const minDateMoment = initialSettingsProp?.minDate
            ? moment.tz(initialSettingsProp.minDate, timeZone)
            : null

        return allPresets.filter((preset) => {
            const presetStart = nowTz.clone().add(preset.duration)
            if (nowTz.diff(presetStart, 'days') > effectiveMaxSpan) return false
            return !minDateMoment || !presetStart.isBefore(minDateMoment, 'day')
        })
    }, [effectiveMaxSpan, initialSettingsProp?.minDate, timeZone])

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
        <DateRangePicker
            value={pickerValue}
            onChange={handleChange}
            presets={presets}
            aria-label="Date range picker"
            placement="bottom left"
            isDateUnavailable={isDateUnavailable}
            trigger={(renderProps) => (
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
            )}
        />
    )
}
