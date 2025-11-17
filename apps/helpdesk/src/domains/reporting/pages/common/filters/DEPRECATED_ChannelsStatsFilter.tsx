import React, { useCallback } from 'react'

import isString from 'lodash/isString'

import { TicketChannel } from 'business/types/ticket'
import type { LegacyStatsFilters } from 'domains/reporting/models/stat/types'
import { filterChannels } from 'domains/reporting/pages/common/filters/helpers'
import SelectFilter from 'domains/reporting/pages/common/SelectFilter'
import SelectStatsFilter from 'domains/reporting/pages/common/SelectStatsFilter'
import { mergeStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import type { Channel, ChannelIdentifier } from 'services/channels'
import { getChannels, toChannel } from 'services/channels'

type Props = {
    value: LegacyStatsFilters['channels']
    channelsFilter?: ChannelIdentifier[] | ((channel: Channel) => boolean)
    variant?: 'fill' | 'ghost'
}

export const channelsStatsFilterLabels = {
    plural: 'channels',
    singular: 'channel',
}
/**
 * @deprecated
 * @date 2024-06-27
 * @type feature-component
 */
export default function DEPRECATED_ChannelsStatsFilter({
    value = [],
    channelsFilter,
    variant = 'fill',
}: Props) {
    const dispatch = useAppDispatch()
    const Component = variant === 'fill' ? SelectFilter : SelectStatsFilter
    const channels = filterChannels(getChannels(), channelsFilter).filter(
        (channel) => channel?.slug !== TicketChannel.InternalNote,
    )

    const handleFilterChange = useCallback(
        (values: (string | number)[]) => {
            const channels = values
                .map((value) => {
                    const channelLabel = value.toString()
                    return toChannel(channelLabel)?.slug
                })
                .filter(isString)
            dispatch(mergeStatsFilters({ channels }))
        },
        [dispatch],
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
