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

function toCalendarDate(value: DateOrString | undefined): CalendarDate | null {
    if (!value) return null
    const m = moment(value)
    if (!m.isValid()) return null
    return new CalendarDate(m.year(), m.month() + 1, m.date())
}

export function PeriodFilterCompact({
    value,
    initialSettings: initialSettingsProp,
}: CompactPeriodFilterProps) {
    const dispatch = useAppDispatch()
    const effectiveMaxSpan = initialSettingsProp?.maxSpan ?? MAX_SPAN

    useEffectOnce(() => {
        if (
            moment(value.end_datetime).diff(
                moment(value.start_datetime),
                'days',
            ) > effectiveMaxSpan
        ) {
            dispatch(
                mergeStatsFilters({
                    period: {
                        start_datetime: moment(value.start_datetime)
                            .startOf('day')
                            .format(),
                        end_datetime: moment(value.start_datetime)
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
            if (newValue) {
                const startMoment = moment(newValue.start.toDate()).startOf(
                    'day',
                )
                const endMoment = moment(newValue.end.toDate()).endOf('day')
                const clampedEnd =
                    endMoment.diff(startMoment, 'days') > effectiveMaxSpan
                        ? startMoment
                              .clone()
                              .add(effectiveMaxSpan, 'days')
                              .subtract(1, 'seconds')
                        : endMoment
                dispatch(
                    mergeStatsFilters({
                        period: {
                            start_datetime: startMoment.format(),
                            end_datetime: clampedEnd.format(),
                        },
                    }),
                )
            }
        },
        [dispatch, effectiveMaxSpan],
    )

    const pickerValue = useMemo(() => {
        const timeZone = moment.tz.guess()
        const startMoment = moment(value.start_datetime)
        const endMoment = moment(value.end_datetime)

        return {
            start: now(timeZone).set({
                year: startMoment.year(),
                month: startMoment.month() + 1,
                day: startMoment.date(),
            }),
            end: now(timeZone).set({
                year: endMoment.year(),
                month: endMoment.month() + 1,
                day: endMoment.date(),
            }),
        }
    }, [value.start_datetime, value.end_datetime])

    const minDate = useMemo(
        () => toCalendarDate(initialSettingsProp?.minDate),
        [initialSettingsProp?.minDate],
    )

    const maxDate = useMemo(
        () => toCalendarDate(initialSettingsProp?.maxDate),
        [initialSettingsProp?.maxDate],
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

        return allPresets.filter((preset) => {
            const presetStart = moment().add(preset.duration)
            if (moment().diff(presetStart, 'days') > effectiveMaxSpan)
                return false
            if (!initialSettingsProp?.minDate) return true
            return !presetStart.isBefore(
                moment(initialSettingsProp.minDate),
                'day',
            )
        })
    }, [effectiveMaxSpan, initialSettingsProp?.minDate])

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
        return `${formatDatetime(value.start_datetime, format)} – ${formatDatetime(value.end_datetime, format)}`
    }, [value.start_datetime, value.end_datetime])

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
