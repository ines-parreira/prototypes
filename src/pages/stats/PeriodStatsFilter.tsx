import moment, {Moment} from 'moment-timezone'
import React, {ComponentProps, useCallback} from 'react'
import {Options as InitialSettings} from 'daterangepicker'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {logEvent, SegmentEvent} from 'common/segment'
import {mergeStatsFilters} from 'state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useEffectOnce from 'hooks/useEffectOnce'
import {StatsFilters} from 'models/stat/types'
import {FeatureFlagKey} from 'config/featureFlags'

import {
    endOfLastMonth,
    endOfToday,
    lastWeekDateRange,
    lastYearEnd,
    lastYearStart,
    StartDayOfWeek,
    startOfLastMonth,
    startOfMonth,
    dateInPastFromStartOfToday,
    startOfToday,
} from 'pages/stats/common/utils'
import PeriodPicker, {
    getDefaultSetOfRanges,
} from 'pages/stats/common/PeriodPicker'
import {
    PAST_7_DAYS,
    PAST_30_DAYS,
    PAST_60_DAYS,
    PAST_90_DAYS,
    TODAY,
} from 'pages/stats/constants'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {DateAndTimeFormatting} from 'constants/datetime'

const MAX_SPAN = 90

type Props = {
    initialSettings?: Omit<InitialSettings, 'maxSpan'> & {maxSpan?: number}
    value: StatsFilters['period']
    variant?: 'fill' | 'ghost'
}

export const getNewSetOfRanges = (): {[key: string]: [Moment, Moment]} => {
    const defaultSetOfRanges = getDefaultSetOfRanges()
    return {
        [TODAY]: defaultSetOfRanges[TODAY],
        Yesterday: [
            dateInPastFromStartOfToday(2),
            startOfToday().subtract(1, 'seconds'),
        ],
        'Month to date': [startOfMonth(), endOfToday()],
        'Last week (start on Sun)': [
            lastWeekDateRange(StartDayOfWeek.Sunday).start,
            lastWeekDateRange(StartDayOfWeek.Sunday).end,
        ],
        'Last week (start on Mon)': [
            lastWeekDateRange(StartDayOfWeek.Monday).start,
            lastWeekDateRange(StartDayOfWeek.Monday).end,
        ],
        'Last month': [startOfLastMonth(), endOfLastMonth()],
        [PAST_7_DAYS]: defaultSetOfRanges[PAST_7_DAYS],
        [PAST_30_DAYS]: defaultSetOfRanges[PAST_30_DAYS],
        [PAST_60_DAYS]: defaultSetOfRanges[PAST_60_DAYS],
        [PAST_90_DAYS]: defaultSetOfRanges[PAST_90_DAYS],
        'Past year': [lastYearStart(), lastYearEnd()],
    }
}

export default function PeriodStatsFilter({
    initialSettings: initialSettingsProp,
    value,
    variant = 'fill',
}: Props) {
    const dispatch = useAppDispatch()
    const compactDateBasedOnUserPreferences = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate
    ) as string
    const shortDateBasedOnUserPreferences = useGetDateAndTimeFormat(
        DateAndTimeFormatting.ShortDateWithYear
    )

    const isNewDatePickerVariant =
        useFlags()[FeatureFlagKey.NewDatePickerVariant]

    const pickerV2Props = {
        dateRanges: !!isNewDatePickerVariant ? getNewSetOfRanges() : undefined,
        pickerV2Styles: !!isNewDatePickerVariant,
        rangesOnLeft: !!isNewDatePickerVariant,
        showRangesLabel: !isNewDatePickerVariant,
        actionButtonsOnTheBottom: !!isNewDatePickerVariant,
        changeButtonColorsToV2: !!isNewDatePickerVariant,
        rangeDatesInFooter: !!isNewDatePickerVariant,
        shouldShowMonthAndYearDropdowns: !!isNewDatePickerVariant,
    }

    const initialSettings = {
        maxDate: moment(),
        maxSpan: MAX_SPAN,
        locale: {format: compactDateBasedOnUserPreferences},
        showDropdowns: !!isNewDatePickerVariant,
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
                    })
                )
            },
            [dispatch]
        )

    useEffectOnce(() => {
        if (
            moment(value.end_datetime).diff(
                moment(value.start_datetime),
                'days'
            ) > (initialSettings.maxSpan || MAX_SPAN)
        ) {
            handleFilterChange({
                startDatetime: value.start_datetime,
                endDatetime: moment(value.start_datetime)
                    .add(
                        initialSettings.maxSpan
                            ? initialSettings.maxSpan
                            : MAX_SPAN,
                        'days'
                    )
                    .subtract(1, 'seconds')
                    .format(),
            })
        }
    })

    return (
        <PeriodPicker
            toggleProps={
                variant === 'ghost'
                    ? {
                          fillStyle: 'ghost',
                      }
                    : undefined
            }
            startDatetime={moment(value.start_datetime)}
            endDatetime={moment(value.end_datetime)}
            initialSettings={initialSettings}
            onChange={handleFilterChange}
            formatMaxSpan={(maxSpan) =>
                moment.duration({
                    days: maxSpan as number,
                    seconds: -1, // counting days start at 0 because for our needs 1 day selected is 23H59m59s
                })
            }
            onOpen={() => {
                logEvent(SegmentEvent.AnalyticsStatsDatepickerOpen, {
                    eventDate: moment().format(),
                    startDate: value.start_datetime,
                    endDate: value.end_datetime,
                })
            }}
            isDisabled={isNewDatePickerVariant === undefined}
            {...pickerV2Props}
            labelDateFormat={shortDateBasedOnUserPreferences}
        />
    )
}
