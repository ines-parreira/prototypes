import {Options as InitialSettings} from 'daterangepicker'
import moment from 'moment-timezone'
import React, {ComponentProps, useCallback} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {DateAndTimeFormatting} from 'constants/datetime'
import useAppDispatch from 'hooks/useAppDispatch'
import useEffectOnce from 'hooks/useEffectOnce'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {LegacyStatsFilters} from 'models/stat/types'

import PeriodPicker from 'pages/stats/common/PeriodPicker'
import {getNewSetOfRanges} from 'pages/stats/constants'
import {mergeStatsFilters} from 'state/stats/statsSlice'

const MAX_SPAN = 90

type Props = {
    initialSettings?: Omit<InitialSettings, 'maxSpan'> & {maxSpan?: number}
    value: LegacyStatsFilters['period']
    variant?: 'fill' | 'ghost'
    tooltipMessageForPreviousPeriod?: string
}

export default function DEPRECATED_PeriodStatsFilter({
    initialSettings: initialSettingsProp,
    value,
    variant = 'fill',
    tooltipMessageForPreviousPeriod,
}: Props) {
    const dispatch = useAppDispatch()
    const compactDateBasedOnUserPreferences = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate
    ) as string
    const shortDateBasedOnUserPreferences = useGetDateAndTimeFormat(
        DateAndTimeFormatting.ShortDateWithYear
    )

    const initialSettings = {
        maxDate: moment(),
        maxSpan: MAX_SPAN,
        locale: {format: compactDateBasedOnUserPreferences},
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
            dateRanges={getNewSetOfRanges()}
            labelDateFormat={shortDateBasedOnUserPreferences}
            tooltipMessageForPreviousPeriod={tooltipMessageForPreviousPeriod}
        />
    )
}
