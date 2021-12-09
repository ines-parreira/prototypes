import moment from 'moment-timezone'
import React, {ComponentProps, useCallback} from 'react'
import {fromJS} from 'immutable'

import {PeriodStatsFilterValue, StatsFilterType} from '../../state/stats/types'
import {mergeStatsFilters} from '../../state/stats/actions'
import useAppDispatch from '../../hooks/useAppDispatch'

import PeriodPicker from './common/PeriodPicker'

type Props = {
    value: PeriodStatsFilterValue
}

export default function PeriodStatsFilter({value}: Props) {
    const dispatch = useAppDispatch()

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
                    mergeStatsFilters(
                        fromJS({
                            [StatsFilterType.Period]: {
                                start_datetime: startDatetime,
                                end_datetime: endDatetime,
                            },
                        })
                    )
                )
            },
            [dispatch]
        )

    return (
        <PeriodPicker
            startDatetime={moment(value.start_datetime)}
            endDatetime={moment(value.end_datetime)}
            initialSettings={{
                maxDate: moment(),
                maxSpan: 90,
            }}
            onChange={handleFilterChange}
            formatMaxSpan={(maxSpan) =>
                moment.duration({
                    days: maxSpan as number,
                    seconds: -1, // counting days start at 0 because for our needs 1 day selected is 23H59m59s
                })
            }
        />
    )
}
