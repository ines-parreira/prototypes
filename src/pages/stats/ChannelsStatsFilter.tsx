import React, {ComponentProps, useCallback} from 'react'
import _upperFirst from 'lodash/upperFirst'

import {TicketChannel} from 'business/types/ticket'
import {mergeStatsFilters} from 'state/stats/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {StatsFilters} from 'models/stat/types'

import SelectFilter from './common/SelectFilter'

type Props = {
    value: StatsFilters['channels']
    channels: TicketChannel[]
}

export default function ChannelsStatsFilter({value = [], channels}: Props) {
    const dispatch = useAppDispatch()

    const handleFilterChange: ComponentProps<typeof SelectFilter>['onChange'] =
        useCallback(
            (values) => {
                dispatch(
                    mergeStatsFilters({channels: values as TicketChannel[]})
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
