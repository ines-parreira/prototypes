import React, {ComponentProps, useCallback} from 'react'
import _upperFirst from 'lodash/upperFirst'

import {TicketChannel} from 'business/types/ticket'
import {mergeStatsFilters} from 'state/stats/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {StatsFilters} from 'models/stat/types'

import {TICKET_CHANNEL_NAMES} from 'state/ticket/constants'
import SelectFilter from './common/SelectFilter'
import SelectStatsFilter from './common/SelectStatsFilter'

type Props = {
    value: StatsFilters['channels']
    channels: TicketChannel[]
    variant?: 'fill' | 'ghost'
}

export default function ChannelsStatsFilter({
    value = [],
    channels,
    variant = 'fill',
}: Props) {
    const dispatch = useAppDispatch()
    const Component = variant === 'fill' ? SelectFilter : SelectStatsFilter

    const handleFilterChange: ComponentProps<typeof Component>['onChange'] =
        useCallback(
            (values) => {
                dispatch(
                    mergeStatsFilters({channels: values as TicketChannel[]})
                )
            },
            [dispatch]
        )

    return (
        <Component
            plural="channels"
            singular="channel"
            onChange={handleFilterChange}
            value={value}
        >
            {channels.map((channel) => (
                <Component.Item
                    key={channel}
                    label={
                        TICKET_CHANNEL_NAMES[channel] ??
                        _upperFirst(channel.replace(/-/g, ' '))
                    }
                    value={channel}
                />
            ))}
        </Component>
    )
}
