import React, {useCallback} from 'react'

import {isArray, isFunction, isString} from 'lodash'
import {
    ChannelIdentifier,
    Channel,
    getChannels,
    toChannel,
    toChannels,
} from 'services/channels'
import {mergeStatsFilters} from 'state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import {StatsFilters} from 'models/stat/types'

import SelectFilter from './common/SelectFilter'
import SelectStatsFilter from './common/SelectStatsFilter'

type Props = {
    value: StatsFilters['channels']
    channelsFilter?: ChannelIdentifier[] | ((channel: Channel) => boolean)
    variant?: 'fill' | 'ghost'
}

export const channelsStatsFilterLabels = {
    plural: 'channels',
    singular: 'channel',
}

export default function ChannelsStatsFilter({
    value = [],
    channelsFilter,
    variant = 'fill',
}: Props) {
    const dispatch = useAppDispatch()
    const Component = variant === 'fill' ? SelectFilter : SelectStatsFilter
    const channels = filterChannels(getChannels(), channelsFilter)

    const handleFilterChange = useCallback(
        (values: (string | number)[]) => {
            const channels = values
                .map((value) => {
                    const channelLabel = value.toString()
                    return toChannel(channelLabel)?.slug
                })
                .filter(isString)
            dispatch(mergeStatsFilters({channels}))
        },
        [dispatch]
    )

    return (
        <Component
            {...channelsStatsFilterLabels}
            onChange={handleFilterChange}
            value={value}
        >
            {channels.map((channel) => {
                if (channel) {
                    return (
                        <Component.Item
                            key={channel.slug}
                            label={channel.name}
                            value={channel.slug}
                        />
                    )
                }
            })}
        </Component>
    )
}

function filterChannels(
    channels: Channel[],
    filter?: ChannelIdentifier[] | ((channel: Channel) => boolean)
): Channel[] {
    if (isArray(filter)) {
        return toChannels(filter)
    }

    if (isFunction(filter)) {
        return channels.filter(filter)
    }

    return channels
}
