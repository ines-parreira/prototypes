import React, { useCallback } from 'react'

import isString from 'lodash/isString'
import noop from 'lodash/noop'
import { connect } from 'react-redux'

import { TicketChannel } from 'business/types/ticket'
import { FilterKey, StatsFiltersWithLogicalOperator } from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import {
    channelsFilterLogicalOperators,
    FilterLabels,
} from 'pages/stats/common/filters/constants'
import {
    emptyFilter,
    filterChannels,
    logSegmentEvent,
} from 'pages/stats/common/filters/helpers'
import {
    OptionalFilterProps,
    RemovableFilter,
} from 'pages/stats/common/filters/types'
import { DropdownOption } from 'pages/stats/types'
import {
    Channel,
    ChannelIdentifier,
    getChannels,
    toChannel,
} from 'services/channels'
import {
    getPageStatsFiltersWithLogicalOperators,
    getSavedFiltersWithLogicalOperators,
} from 'state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import { statFiltersClean, statFiltersDirty } from 'state/ui/stats/actions'
import {
    removeFilterFromSavedFilterDraft,
    upsertSavedFilterFilter,
} from 'state/ui/stats/filtersSlice'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.Channels]
    channelsFilter?: ChannelIdentifier[] | ((channel: Channel) => boolean)
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.Channels],
            undefined
        >,
    ) => void
    dispatchRemove: () => void
    dispatchStatFiltersDirty?: () => void
    dispatchStatFiltersClean?: () => void
} & RemovableFilter &
    OptionalFilterProps

export function ChannelsFilter({
    value = emptyFilter,
    dispatchUpdate,
    dispatchRemove,
    channelsFilter,
    initializeAsOpen = false,
    onRemove,
    dispatchStatFiltersDirty = noop,
    dispatchStatFiltersClean = noop,
    warningType,
    isDisabled,
}: Props) {
    const channels = filterChannels(getChannels(), channelsFilter).filter(
        (channel) => channel?.slug !== TicketChannel.InternalNote,
    )
    const allChannelsSlugs = channels.map((channel) => channel.slug)

    const getSelectedChannels = () => {
        return channels
            .filter((channel: Channel) => value.values.includes(channel.slug))
            .map((channel) => ({ label: channel.name, value: channel.id }))
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
                    value.values.filter((slug) => slug !== channel.slug),
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
            dispatchUpdate({
                values: channels,
                operator: value.operator,
            })
        },
        [dispatchUpdate, value.operator],
    )

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            dispatchUpdate({
                values: value.values,
                operator: operator,
            })
        },
        [dispatchUpdate, value.values],
    )

    const handleDropdownOpen = () => {
        dispatchStatFiltersDirty()
    }
    const handleDropdownClosed = () => {
        logSegmentEvent(
            FilterKey.Channels,
            LogicalOperatorLabel[value.operator],
        )
        dispatchStatFiltersClean()
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.Channels]}
            filterErrors={{ warningType }}
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
                dispatchRemove()
                onRemove?.()
            }}
            onChangeLogicalOperator={handleFilterOperatorChange}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClosed={handleDropdownClosed}
            initializeAsOpen={initializeAsOpen}
            isDisabled={isDisabled}
        />
    )
}

export const ChannelsFilterWithState = connect(
    (state: RootState) => ({
        value: getPageStatsFiltersWithLogicalOperators(state)[
            FilterKey.Channels
        ],
    }),
    {
        dispatchUpdate: (filter: Props['value']) =>
            mergeStatsFiltersWithLogicalOperator({
                channels: filter,
            }),
        dispatchRemove: () =>
            mergeStatsFiltersWithLogicalOperator({
                channels: emptyFilter,
            }),
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    },
)(ChannelsFilter)

export const ChannelsFilterWithSavedState = connect(
    (state: RootState) => ({
        value: getSavedFiltersWithLogicalOperators(state)[FilterKey.Channels],
    }),
    {
        dispatchUpdate: (filter: Exclude<Props['value'], undefined>) =>
            upsertSavedFilterFilter({
                member: FilterKey.Channels,
                operator: filter.operator,
                values: filter.values,
            }),
        dispatchRemove: () =>
            removeFilterFromSavedFilterDraft({
                filterKey: FilterKey.Channels,
            }),
    },
)(ChannelsFilter)
