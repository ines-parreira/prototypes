import isArray from 'lodash/isArray'
import isFunction from 'lodash/isFunction'

import {logEvent, SegmentEvent} from 'common/segment'
import {
    CleanFilterComponentKeys,
    CustomFieldFilter,
    FilterComponentKey,
    FilterKey,
    StateOnlyFilterKeys,
} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
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
