import React, { ComponentProps, useCallback } from 'react'

import { Options as InitialSettings } from 'daterangepicker'
import moment from 'moment-timezone'
import { Moment } from 'moment/moment'
import { connect } from 'react-redux'

import { logEvent, SegmentEvent } from 'common/segment'
import { DateAndTimeFormatting } from 'constants/datetime'
import useAppDispatch from 'hooks/useAppDispatch'
import useEffectOnce from 'hooks/useEffectOnce'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { FilterKey, StatsFilters } from 'models/stat/types'
import FilterName from 'pages/stats/common/components/Filter/components/FilterName/FilterName'
import FilterValue from 'pages/stats/common/components/Filter/components/FilterValue/FilterValue'
import { FilterLabels } from 'pages/stats/common/filters/constants'
import css from 'pages/stats/common/filters/PeriodFilter.less'
import { RemovableFilter } from 'pages/stats/common/filters/types'
import PeriodPicker from 'pages/stats/common/PeriodPicker'
import { getDateRangePickerLabel } from 'pages/stats/common/utils'
import { getNewSetOfRanges } from 'pages/stats/constants'
import { getPageStatsFilters } from 'state/stats/selectors'
import { mergeStatsFilters } from 'state/stats/statsSlice'
import { RootState } from 'state/types'

const MAX_SPAN = 90

type Props = {
    initialSettings?: Omit<InitialSettings, 'maxSpan'> & { maxSpan?: number }
    value: StatsFilters[FilterKey.Period]
    tooltipMessageForPreviousPeriod?: string
    initialV2Props?: {
        dateRanges?: { [label: string]: [Moment, Moment] }
    }
} & RemovableFilter

export function PeriodFilter({
    initialSettings: initialSettingsProp,
    value,
    tooltipMessageForPreviousPeriod,
    initialV2Props,
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

    return (
        <div className={css.filterContainer}>
            <FilterName name={FilterLabels[FilterKey.Period]} />
            <PeriodPicker
                startDatetime={moment(value.start_datetime)}
                endDatetime={moment(value.end_datetime)}
                initialSettings={{ ...initialSettings, opens: 'right' }}
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
                {...pickerV2Props}
                labelDateFormat={shortDateBasedOnUserPreferences}
                isV2Filter
                tooltipMessageForPreviousPeriod={
                    tooltipMessageForPreviousPeriod
                }
            >
                <FilterValue
                    optionsLabels={[filterLabel]}
                    logicalOperator={null}
                    onChange={() => {}}
                    trailIcon={false}
                />{' '}
            </PeriodPicker>
        </div>
    )
}

export const PeriodFilterWithState = connect((state: RootState) => ({
    value: getPageStatsFilters(state)[FilterKey.Period],
}))(PeriodFilter)
