import type { ComponentProps } from 'react'
import React, { useCallback, useMemo } from 'react'

import type { ZonedDateTime } from '@internationalized/date'
import { now } from '@internationalized/date'
import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { DateAndTimeFormatting } from '@repo/utils'
import type { Options as InitialSettings } from 'daterangepicker'
import moment from 'moment-timezone'
import type { Moment } from 'moment/moment'
import { connect } from 'react-redux'

import { Button, DateRangePicker } from '@gorgias/axiom'

import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    FILTER_NAME_MAX_WIDTH,
    FILTER_VALUE_MAX_WIDTH,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import css from 'domains/reporting/pages/common/filters/PeriodFilter.less'
import type { RemovableFilter } from 'domains/reporting/pages/common/filters/types'
import PeriodPicker from 'domains/reporting/pages/common/PeriodPicker'
import { getDateRangePickerLabel } from 'domains/reporting/pages/common/utils'
import { getNewSetOfRanges } from 'domains/reporting/pages/constants'
import { getPageStatsFilters } from 'domains/reporting/state/stats/selectors'
import { mergeStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import FilterName from 'pages/common/forms/FilterInput/FilterName'
import FilterValue from 'pages/common/forms/FilterInput/FilterValue'
import type { RootState } from 'state/types'

const MAX_SPAN = 90

type Props = {
    initialSettings?: Omit<InitialSettings, 'maxSpan'> & { maxSpan?: number }
    value: StatsFilters[FilterKey.Period]
    tooltipMessageForPreviousPeriod?: string
    initialV2Props?: {
        dateRanges?: { [label: string]: [Moment, Moment] }
    }
    compact?: boolean
} & RemovableFilter

export function PeriodFilter({
    initialSettings: initialSettingsProp,
    value,
    tooltipMessageForPreviousPeriod,
    initialV2Props,
    compact = false,
}: Props) {
    const dispatch = useAppDispatch()
    const compactDateBasedOnUserPreferences = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate,
    ) as string
    const shortDateBasedOnUserPreferences = useGetDateAndTimeFormat(
        DateAndTimeFormatting.ShortDateWithYear,
    )

    const pickerV2Props = {
        dateRanges: initialV2Props?.dateRanges || getNewSetOfRanges(),
        pickerV2Styles: true,
        rangesOnLeft: true,
        showRangesLabel: false,
        actionButtonsOnTheBottom: true,
        changeButtonColorsToV2: true,
        rangeDatesInFooter: true,
        shouldShowMonthAndYearDropdowns: true,
    }

    const initialSettings = {
        maxDate: moment(),
        maxSpan: MAX_SPAN,
        locale: { format: compactDateBasedOnUserPreferences },
        showDropdowns: true,
        ...initialSettingsProp,
    }

    const handleFilterChange: ComponentProps<typeof PeriodPicker>['onChange'] =
        useCallback(
            (newValue) => {
                const startDatetime = moment(newValue.startDatetime)
                    .startOf('day')
                    .format()
                const endDatetime = moment(newValue.endDatetime)
                    .endOf('day')
                    .format()
                dispatch(
                    mergeStatsFilters({
                        period: {
                            start_datetime: startDatetime,
                            end_datetime: endDatetime,
                        },
                    }),
                )
            },
            [dispatch],
        )

    const handleCompactDateChange = useCallback(
        (newValue: { start: ZonedDateTime; end: ZonedDateTime } | null) => {
            if (newValue) {
                const startDatetime = moment(newValue.start.toDate())
                    .startOf('day')
                    .format()
                const endDatetime = moment(newValue.end.toDate())
                    .endOf('day')
                    .format()
                dispatch(
                    mergeStatsFilters({
                        period: {
                            start_datetime: startDatetime,
                            end_datetime: endDatetime,
                        },
                    }),
                )
            }
        },
        [dispatch],
    )

    useEffectOnce(() => {
        if (
            moment(value.end_datetime).diff(
                moment(value.start_datetime),
                'days',
            ) > (initialSettings.maxSpan || MAX_SPAN)
        ) {
            handleFilterChange({
                startDatetime: value.start_datetime,
                endDatetime: moment(value.start_datetime)
                    .add(
                        initialSettings.maxSpan
                            ? initialSettings.maxSpan
                            : MAX_SPAN,
                        'days',
                    )
                    .subtract(1, 'seconds')
                    .format(),
            })
        }
    })

    const filterLabel = getDateRangePickerLabel(
        moment(value.start_datetime),
        moment(value.end_datetime),
        shortDateBasedOnUserPreferences,
    )

    const compactDatePickerValue = useMemo(() => {
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

    const compactPresets = useMemo(
        () => [
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
        ],
        [],
    )

    const formatCompactDateRange = useCallback(() => {
        const startMoment = moment(value.start_datetime)
        const endMoment = moment(value.end_datetime)
        const formatDate = (date: Moment) => date.format('MMM D, YYYY')

        return `${formatDate(startMoment)} – ${formatDate(endMoment)}`
    }, [value.start_datetime, value.end_datetime])

    if (compact) {
        return (
            <DateRangePicker
                value={compactDatePickerValue}
                onChange={handleCompactDateChange}
                presets={compactPresets}
                aria-label="Date range picker"
                placement="bottom left"
                trigger={(renderProps) => (
                    <Button
                        {...renderProps}
                        variant="tertiary"
                        id="period-filter-compact-trigger"
                    >
                        <span className={css.compactLabel}>Date</span>
                        <span className={css.compactValue}>
                            {formatCompactDateRange()}
                        </span>
                    </Button>
                )}
            />
        )
    }

    return (
        <div className={css.filterContainer}>
            <FilterName
                name={FilterLabels[FilterKey.Period]}
                maxWidth={FILTER_NAME_MAX_WIDTH}
            />
            <PeriodPicker
                startDatetime={moment(value.start_datetime)}
                endDatetime={moment(value.end_datetime)}
                initialSettings={{ ...initialSettings, opens: 'right' }}
                onChange={handleFilterChange}
                formatMaxSpan={(maxSpan) =>
                    moment.duration({
                        days: maxSpan as number,
                        seconds: -1,
                    })
                }
                onOpen={() => {
                    logEvent(SegmentEvent.AnalyticsStatsDatepickerOpen, {
                        eventDate: moment().format(),
                        startDate: value.start_datetime,
                        endDate: value.end_datetime,
                    })
                }}
                {...pickerV2Props}
                labelDateFormat={shortDateBasedOnUserPreferences}
                tooltipMessageForPreviousPeriod={
                    tooltipMessageForPreviousPeriod
                }
            >
                <FilterValue
                    optionsLabels={[filterLabel]}
                    onClick={() => {}}
                    maxWidth={FILTER_VALUE_MAX_WIDTH}
                />{' '}
            </PeriodPicker>
        </div>
    )
}

export const PeriodFilterWithState = connect((state: RootState) => ({
    value: getPageStatsFilters(state)[FilterKey.Period],
}))(PeriodFilter)
