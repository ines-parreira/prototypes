import type { ComponentProps, ReactNode } from 'react'
import React, { useCallback } from 'react'

import type { DateValue } from '@internationalized/date'
import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { DateAndTimeFormatting } from '@repo/utils'
import type { Options as InitialSettings } from 'daterangepicker'
import moment from 'moment-timezone'
import type { Moment } from 'moment/moment'
import { connect } from 'react-redux'

import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    FILTER_NAME_MAX_WIDTH,
    FILTER_VALUE_MAX_WIDTH,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import css from 'domains/reporting/pages/common/filters/PeriodFilter.less'
import { PeriodFilterCompact } from 'domains/reporting/pages/common/filters/PeriodFilterCompact'
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
    warningMessage?: string
    getDateTooltip?: (date: DateValue) => ReactNode
    initialV2Props?: {
        dateRanges?: { [label: string]: [Moment, Moment] }
    }
    compact?: boolean
} & RemovableFilter

export function PeriodFilter({
    initialSettings: initialSettingsProp,
    value,
    tooltipMessageForPreviousPeriod,
    warningMessage,
    getDateTooltip,
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

    if (compact) {
        return (
            <PeriodFilterCompact
                value={value}
                initialSettings={initialSettings}
                warningMessage={warningMessage}
                getDateTooltip={getDateTooltip}
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
