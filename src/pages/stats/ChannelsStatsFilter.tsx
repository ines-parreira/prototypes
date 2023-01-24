import React, {ComponentProps, useCallback} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import _upperFirst from 'lodash/upperFirst'
import _without from 'lodash/without'

import {FeatureFlagKey} from 'config/featureFlags'
import {TicketChannel} from 'business/types/ticket'
import {mergeStatsFilters} from 'state/stats/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {StatsFilters} from 'models/stat/types'

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
    const isWhatsAppEnabled = useFlags()[FeatureFlagKey.EnableWhatsApp]
    const channelsToDisplay = isWhatsAppEnabled
        ? channels
        : _without(channels, TicketChannel.WhatsApp)
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
            {channelsToDisplay.map((channel) => (
                <Component.Item
                    key={channel}
                    label={_upperFirst(channel.replace(/-/g, ' '))}
                    value={channel}
                />
            ))}
        </Component>
    )
}
