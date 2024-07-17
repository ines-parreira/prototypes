import React, {useCallback, useState} from 'react'

import isString from 'lodash/isString'
import {connect} from 'react-redux'
import {RemovableFilter} from 'pages/stats/common/filters/types'
import {
    ChannelIdentifier,
    Channel,
    getChannels,
    toChannel,
} from 'services/channels'
import {getPageStatsFilters} from 'state/stats/selectors'
import {mergeStatsFilters} from 'state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import {FilterKey, StatsFilters} from 'models/stat/types'

import Filter from 'pages/stats/common/components/Filter'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {RootState} from 'state/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {filterChannels} from 'pages/stats/common/filters/helpers'
import {DropdownOption} from 'pages/stats/types'
import {channelsFilterLogicalOperators} from 'pages/stats/common/filters/constants'

export const CHANNELS_FILTER_NAME = 'Channels'

type Props = {
    value: StatsFilters['channels']
    channelsFilter?: ChannelIdentifier[] | ((channel: Channel) => boolean)
} & RemovableFilter

export default function ChannelsFilter({
    value = [],
    channelsFilter,
    onRemove,
}: Props) {
    const dispatch = useAppDispatch()
    const [selectedLogicalOperator, setSelectedLogicalOperator] =
        useState<LogicalOperatorEnum>(LogicalOperatorEnum['ONE_OF'])
    const channels = filterChannels(getChannels(), channelsFilter)
    const allChannelsSlugs = channels.map((channel) => channel.slug)

    const getSelectedChannels = () => {
        return channels
            .filter((channel: Channel) => value.includes(channel.slug))
            .map((channel) => ({label: channel.name, value: channel.id}))
    }

    const channelOptionGroups = () => {
        return [
            {
                options: channels.map((channel) => ({
                    label: channel.name,
                    value: channel.id,
                })),
            },
        ]
    }

    const onOptionChange = (opt: DropdownOption) => {
        const channel = channels.find((channel) => channel.id === opt.value)

        if (channel) {
            if (value.includes(channel.slug)) {
                handleFilterChange(
                    value.filter((slug) => slug !== channel.slug)
                )
            } else {
                handleFilterChange([...value, channel.slug])
            }
        }
    }

    const handleFilterChange = useCallback(
        (values: string[]) => {
            dispatch(statFiltersDirty())
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

    const handleDropdownClosed = () => {
        dispatch(statFiltersClean())
    }

    return (
        <Filter
            filterName={CHANNELS_FILTER_NAME}
            selectedOptions={getSelectedChannels()}
            selectedLogicalOperator={selectedLogicalOperator}
            logicalOperators={channelsFilterLogicalOperators}
            filterOptionGroups={channelOptionGroups()}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterChange(allChannelsSlugs)
            }}
            onRemoveAll={() => {
                handleFilterChange([])
            }}
            onRemove={() => {
                dispatch(mergeStatsFilters({channels: []}))
                onRemove?.()
            }}
            onChangeLogicalOperator={(operator) =>
                setSelectedLogicalOperator(operator)
            }
            onDropdownClosed={handleDropdownClosed}
        />
    )
}

export const ChannelsFilterWithState = connect((state: RootState) => ({
    value: getPageStatsFilters(state)[FilterKey.Channels],
}))(ChannelsFilter)
