import isArray from 'lodash/isArray'

import isFunction from 'lodash/isFunction'

import {ComponentProps} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'

import {
    CleanFilterComponentKeys,
    CustomFieldFilter,
    FilterComponentKey,
    FilterKey,
    SavedFilterSupportedFilters,
    StateOnlyFilterKeys,
} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {ChannelsFilterWithState} from 'pages/stats/common/filters/ChannelsFilter'
import {PeriodFilterWithState} from 'pages/stats/common/filters/PeriodFilter'

import {Channel, ChannelIdentifier, toChannels} from 'services/channels'

export function filterChannels(
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

export const emptyFilter = {
    operator: LogicalOperatorEnum.ONE_OF,
    values: [],
}

export const emptyCustomFieldFilter = (
    customFieldId: number
): CustomFieldFilter => ({
    customFieldId,
    operator: LogicalOperatorEnum.ONE_OF,
    values: [],
})

export const filterKeyToStateKeyMapper = (
    key: StateOnlyFilterKeys | CleanFilterComponentKeys
) => {
    switch (key) {
        case FilterComponentKey.Store:
        case FilterComponentKey.PhoneIntegrations:
            return FilterKey.Integrations
        case FilterComponentKey.CustomField:
            return FilterKey.CustomFields
        default:
            return key
    }
}

export const getFilteredFilterComponentKeys = (
    keys: (FilterKey | FilterComponentKey)[]
) =>
    keys.reduce<(FilterKey | CleanFilterComponentKeys)[]>((acc, key) => {
        if (key === FilterComponentKey.BusiestTimesMetricSelectFilter) {
            return acc
        }
        return [...acc, key]
    }, [])

export const logSegmentEvent = (
    filterName: string,
    logicalOperator: string | null
) => {
    logEvent(SegmentEvent.StatFilterSelected, {
        name: filterName,
        logical_operator: logicalOperator
            ? logicalOperator.toLocaleLowerCase()
            : null,
    })
}

export const getFilterSettings = (
    filterKey: string,
    settings?: {
        [FilterKey.Period]?: ComponentProps<typeof PeriodFilterWithState>
        [FilterKey.Channels]?: ComponentProps<typeof ChannelsFilterWithState>
    }
) => {
    switch (filterKey) {
        case FilterKey.Period:
            return settings?.[FilterKey.Period]
        case FilterKey.Channels:
            return settings?.[FilterKey.Channels]
        default:
            return undefined
    }
}

export const withoutEmptyFilters = (
    savedFilters: SavedFilterSupportedFilters[]
): SavedFilterSupportedFilters[] => {
    return savedFilters
        .map((filter) => {
            if (filter.member === FilterKey.CustomFields) {
                return {
                    ...filter,
                    values: filter.values.filter((f) => f.values.length > 0),
                }
            } else if (filter.member === FilterKey.Tags) {
                return {
                    ...filter,
                    values: filter.values.filter((f) => f.values.length > 0),
                }
            }
            return filter
        })
        .filter((filter) => {
            if (
                filter.member === FilterKey.CustomFields ||
                filter.member === FilterKey.Tags
            ) {
                return filter.values.some((f) => f.values.length > 0)
            }
            return filter.values.length > 0
        })
}
