import moment from 'moment-timezone'
import React, {ComponentProps, useCallback} from 'react'
import {Options as InitialSettings} from 'daterangepicker'

import {connect} from 'react-redux'
import {RemovableFilter} from 'pages/stats/common/filters/types'
import {logEvent, SegmentEvent} from 'common/segment'
import {getPageStatsFilters} from 'state/stats/selectors'
import {mergeStatsFilters} from 'state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useEffectOnce from 'hooks/useEffectOnce'
import {FilterKey, StatsFilters} from 'models/stat/types'

import {getDateRangePickerLabel} from 'pages/stats/common/utils'
import PeriodPicker from 'pages/stats/common/PeriodPicker'
import {getNewSetOfRanges} from 'pages/stats/constants'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {DateAndTimeFormatting} from 'constants/datetime'
import FilterValue from 'pages/stats/common/components/Filter/components/FilterValue/FilterValue'
import FilterName from 'pages/stats/common/components/Filter/components/FilterName/FilterName'
import css from 'pages/stats/common/filters/PeriodFilter.less'
import {RootState} from 'state/types'

const MAX_SPAN = 90

type Props = {
    initialSettings?: Omit<InitialSettings, 'maxSpan'> & {maxSpan?: number}
    value: StatsFilters['period']
    tooltipMessageForPreviousPeriod?: string
} & RemovableFilter

export default function PeriodFilter({
    initialSettings: initialSettingsProp,
    value,
    tooltipMessageForPreviousPeriod,
}: Props) {
    const dispatch = useAppDispatch()
    const compactDateBasedOnUserPreferences = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate
    ) as string
    const shortDateBasedOnUserPreferences = useGetDateAndTimeFormat(
        DateAndTimeFormatting.ShortDateWithYear
    )

    const pickerV2Props = {
        dateRanges: getNewSetOfRanges(),
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

    const filterLabel = getDateRangePickerLabel(
        moment(value.start_datetime),
        moment(value.end_datetime),
        shortDateBasedOnUserPreferences
    )

    return (
        <div className={css.filterContainer}>
            <FilterName className={css.filterName} name={'Date'} />
            <PeriodPicker
                startDatetime={moment(value.start_datetime)}
                endDatetime={moment(value.end_datetime)}
                initialSettings={{...initialSettings, opens: 'right'}}
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
