import React, {ComponentProps, useCallback} from 'react'
import {fromJS} from 'immutable'
import _upperFirst from 'lodash/upperFirst'

import {
    ChannelsStatsFilterValue,
    StatsFilterType,
} from '../../state/stats/types'
import {TicketChannel} from '../../business/types/ticket'
import {mergeStatsFilters} from '../../state/stats/actions'
import useAppDispatch from '../../hooks/useAppDispatch'

import SelectFilter from './common/SelectFilter'

type Props = {
    value: ChannelsStatsFilterValue
    channels: TicketChannel[]
}

export default function ChannelsStatsFilter({value, channels}: Props) {
    const dispatch = useAppDispatch()

    const handleFilterChange: ComponentProps<typeof SelectFilter>['onChange'] =
        useCallback(
            (values) => {
                dispatch(
                    mergeStatsFilters(
                        fromJS({[StatsFilterType.Channels]: values})
                    )
                )
            },
            [dispatch]
        )

    return (
        <SelectFilter
            plural="channels"
            singular="channel"
            onChange={handleFilterChange}
            value={value}
        >
            {channels.map((channel) => (
                <SelectFilter.Item
                    key={channel}
                    label={_upperFirst(channel.replace(/-/g, ' '))}
                    value={channel}
                />
            ))}
        </SelectFilter>
    )
}
