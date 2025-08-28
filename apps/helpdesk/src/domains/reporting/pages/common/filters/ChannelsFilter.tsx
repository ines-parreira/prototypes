import { useCallback, useMemo } from 'react'

import isString from 'lodash/isString'
import noop from 'lodash/noop'
import { connect } from 'react-redux'

import { TicketChannel } from 'business/types/ticket'
import { useClientSideFilterSearch } from 'domains/reporting/hooks/filters/useClientSideFilterSearch'
import {
    FilterKey,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'domains/reporting/pages/common/components/Filter/constants'
import {
    channelsFilterLogicalOperators,
    FilterLabels,
} from 'domains/reporting/pages/common/filters/constants'
import {
    emptyFilter,
    filterChannels,
    logSegmentEvent,
} from 'domains/reporting/pages/common/filters/helpers'
import {
    OptionalFilterProps,
    RemovableFilter,
} from 'domains/reporting/pages/common/filters/types'
import { DropdownOption } from 'domains/reporting/pages/types'
import {
    getPageStatsFiltersWithLogicalOperators,
    getSavedFiltersWithLogicalOperators,
} from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import {
    statFiltersClean,
    statFiltersDirty,
} from 'domains/reporting/state/ui/stats/actions'
import {
    removeFilterFromSavedFilterDraft,
    upsertSavedFilterFilter,
} from 'domains/reporting/state/ui/stats/filtersSlice'
import {
    Channel,
    ChannelIdentifier,
    getChannels,
    toChannel,
} from 'services/channels'
import { RootState } from 'state/types'

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

function normalizeChannelsById(channels: Channel[]) {
    return channels.reduce<Record<Channel['id'], Channel>>(
        (result, channel) => {
            result[channel.id] = channel
            return result
        },
        {},
    )
}

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
    const normalizedChannels = normalizeChannelsById(channels)

    const getSelectedChannels = () => {
        return channels
            .filter((channel: Channel) => value.values.includes(channel.slug))
            .map((channel) => ({ label: channel.name, value: channel.id }))
    }

    const channelOptionGroups = useMemo(() => {
        return [
            {
                options: channels.map((channel) => ({
                    label: channel.name,
                    value: channel.id,
                })),
            },
        ]
    }, [channels])

    const onOptionChange = (opt: DropdownOption) => {
        const channel = normalizedChannels[opt.value]

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

    const clientSideFilter = useClientSideFilterSearch(channelOptionGroups)

    const handleDropdownOpen = () => {
        dispatchStatFiltersDirty()
    }
    const handleDropdownClosed = () => {
        logSegmentEvent(
            FilterKey.Channels,
            LogicalOperatorLabel[value.operator],
        )
        dispatchStatFiltersClean()
        clientSideFilter.onClear()
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.Channels]}
            filterErrors={{ warningType }}
            selectedOptions={getSelectedChannels()}
            selectedLogicalOperator={value.operator}
            logicalOperators={channelsFilterLogicalOperators}
            search={clientSideFilter.value}
            filterOptionGroups={clientSideFilter.result}
            onSearch={clientSideFilter.onSearch}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                const allChannelsSlugs =
                    clientSideFilter.result[0].options.reduce<string[]>(
                        (result, option) => {
                            const channel = normalizedChannels[option.value]
                            if (channel) result.push(channel.slug)
                            return result
                        },
                        [],
                    )

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
