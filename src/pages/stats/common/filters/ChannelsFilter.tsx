import isString from 'lodash/isString'
import {connect} from 'react-redux'
import React, {useCallback} from 'react'
import {RemovableFilter} from 'pages/stats/common/filters/types'
import useAppDispatch from 'hooks/useAppDispatch'

import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'

import Filter from 'pages/stats/common/components/Filter'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {channelsFilterLogicalOperators} from 'pages/stats/common/filters/constants'
import {emptyFilter, filterChannels} from 'pages/stats/common/filters/helpers'
import {DropdownOption} from 'pages/stats/types'
import {
    Channel,
    ChannelIdentifier,
    getChannels,
    toChannel,
} from 'services/channels'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'

import {RootState} from 'state/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'

export const CHANNELS_FILTER_NAME = 'Channels'

type Props = {
    value: StatsFiltersWithLogicalOperator['channels']
    channelsFilter?: ChannelIdentifier[] | ((channel: Channel) => boolean)
} & RemovableFilter

export function ChannelsFilter({
    value = emptyFilter,
    channelsFilter,
    onRemove,
}: Props) {
    const dispatch = useAppDispatch()
    const channels = filterChannels(getChannels(), channelsFilter)
    const allChannelsSlugs = channels.map((channel) => channel.slug)

    const getSelectedChannels = () => {
        return channels
            .filter((channel: Channel) => value.values.includes(channel.slug))
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
            if (value.values.includes(channel.slug)) {
                handleFilterValuesChange(
                    value.values.filter((slug) => slug !== channel.slug)
                )
            } else {
                handleFilterValuesChange([...value.values, channel.slug])
            }
        }
    }

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            const channels = values
                .map((value) => {
                    const channelLabel = value.toString()
                    return toChannel(channelLabel)?.slug
                })
                .filter(isString)
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    channels: {
                        values: channels,
                        operator: value.operator,
                    },
                })
            )
        },
        [dispatch, value.operator]
    )

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    channels: {
                        values: value.values,
                        operator: operator,
                    },
                })
            )
        },
        [dispatch, value.values]
    )

    const handleDropdownOpen = () => {
        dispatch(statFiltersDirty())
    }
    const handleDropdownClosed = () => {
        dispatch(statFiltersClean())
    }

    return (
        <Filter
            filterName={CHANNELS_FILTER_NAME}
            selectedOptions={getSelectedChannels()}
            selectedLogicalOperator={value.operator}
            logicalOperators={channelsFilterLogicalOperators}
            filterOptionGroups={channelOptionGroups()}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterValuesChange(allChannelsSlugs)
            }}
            onRemoveAll={() => {
                handleFilterValuesChange([])
            }}
            onRemove={() => {
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({
                        channels: emptyFilter,
                    })
                )
                onRemove?.()
            }}
            onChangeLogicalOperator={handleFilterOperatorChange}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClosed={handleDropdownClosed}
        />
    )
}

export const ChannelsFilterWithState = connect((state: RootState) => ({
    value: getPageStatsFiltersWithLogicalOperators(state)[FilterKey.Channels],
}))(ChannelsFilter)
