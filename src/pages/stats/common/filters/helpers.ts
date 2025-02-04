import isArray from 'lodash/isArray'

import isFunction from 'lodash/isFunction'

import {ComponentProps} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'

import {
    CleanFilterComponentKeys,
    CustomFieldFilter,
    FilterComponentKey,
    FilterKey,
    SavedFilter,
    SavedFilterAPI,
    SavedFilterAPISupportedFilters,
    SavedFilterSupportedFilters,
    StateOnlyFilterKeys,
    StaticFilter,
    TagFilterInstanceId,
} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {OptionGroup} from 'pages/stats/common/filters/AddFilterButton'
import {ChannelsFilterWithState} from 'pages/stats/common/filters/ChannelsFilter'
import {
    AUTO_QA_FILTER_KEYS,
    FilterLabels,
} from 'pages/stats/common/filters/constants'
import {ActiveFilter} from 'pages/stats/common/filters/FiltersPanel'
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

export const toApiFormatted = (
    savedFilters: SavedFilterSupportedFilters[]
): SavedFilterAPISupportedFilters[] => {
    return savedFilters
        .map((filter) => {
            if (filter.member === FilterKey.CustomFields) {
                return {
                    ...filter,
                    values: filter.values
                        .filter((f) => f.values.length > 0)
                        .map((f) => ({
                            values: f.values,
                            operator: f.operator,
                            custom_field_id: f.custom_field_id,
                        })),
                }
            } else if (filter.member === FilterKey.Tags) {
                return {
                    ...filter,
                    values: filter.values
                        .filter((f) => f.values.length > 0)
                        .map(({values, operator}) => ({values, operator})),
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

const ticketFieldsTypes = [FilterKey.CustomFields]

const qaFilterTypes = [FilterKey.Score, ...AUTO_QA_FILTER_KEYS]

type FilterOption = {
    value: string
    label: string
    type: FilterKey.Tags | FilterKey.CustomFields | StaticFilter
}

const getIfTicketFieldsFilters = (
    filter: FilterOption
): FilterOption | undefined =>
    'type' in filter &&
    filter.type !== undefined &&
    ticketFieldsTypes.map(String).includes(filter.type)
        ? filter
        : undefined

const getIfQaFilters = (filter: FilterOption): FilterOption | undefined =>
    'type' in filter &&
    filter.type !== undefined &&
    qaFilterTypes.map(String).includes(filter.type)
        ? filter
        : undefined

const getIfStandardFilter = (filter: FilterOption): FilterOption | undefined =>
    getIfTicketFieldsFilters(filter) || getIfQaFilters(filter)
        ? undefined
        : filter

export const STANDARD_FILTERS_LABEL = 'Standard filters'
export const TICKET_FIELDS_FILTERS_LABEL = 'Ticket Fields filters'
export const QUALITY_MANAGEMENT_FILTERS_LABEL = 'Quality Management filters'

export const activeFiltersToOptions = (
    activeFilters: ActiveFilter[]
): OptionGroup[] =>
    activeFilters
        .filter((filter) => !filter.active)
        .reduce<ActiveFilter[]>((filters, filter) => {
            if (filter.type === FilterKey.Tags) {
                if (
                    filters.find(
                        (addedFilter) => addedFilter.type === FilterKey.Tags
                    )
                ) {
                    return filters
                }
            }
            filters.push(filter)
            return filters
        }, [])
        .map((filter) => {
            if (filter.type === FilterKey.CustomFields) {
                return {
                    value: filter.key,
                    label: filter.filterName,
                    type: FilterKey.CustomFields,
                }
            }
            return {
                value: filter.key,
                label: FilterLabels[filter.type],
                type: filter.type,
            }
        })
        .reduce<OptionGroup[]>((optionGroups, filter) => {
            const updatedOptionGroups = []
            const standardFilters = optionGroups.find(
                (group) => group.title === STANDARD_FILTERS_LABEL
            )
            const ticketFieldsFilters = optionGroups.find(
                (group) => group.title === TICKET_FIELDS_FILTERS_LABEL
            )
            const qaFilters = optionGroups.find(
                (group) => group.title === QUALITY_MANAGEMENT_FILTERS_LABEL
            )

            const newStandardFilter = getIfStandardFilter(filter)
            const newTicketFieldsFilters = getIfTicketFieldsFilters(filter)
            const newQaFilters = getIfQaFilters(filter)

            if (standardFilters || newStandardFilter) {
                updatedOptionGroups.push({
                    title: STANDARD_FILTERS_LABEL,
                    options: [
                        ...(standardFilters?.options ?? []),
                        ...(newStandardFilter ? [newStandardFilter] : []),
                    ],
                })
            }
            if (ticketFieldsFilters || newTicketFieldsFilters) {
                updatedOptionGroups.push({
                    title: TICKET_FIELDS_FILTERS_LABEL,
                    options: [
                        ...(ticketFieldsFilters?.options ?? []),
                        ...(newTicketFieldsFilters
                            ? [newTicketFieldsFilters]
                            : []),
                    ],
                })
            }
            if (qaFilters || newQaFilters) {
                updatedOptionGroups.push({
                    title: QUALITY_MANAGEMENT_FILTERS_LABEL,
                    options: [
                        ...(qaFilters?.options ?? []),
                        ...(newQaFilters ? [newQaFilters] : []),
                    ],
                })
            }

            return updatedOptionGroups
        }, [])
        .map((group) => {
            group.options.sort((a, b) => (a.label < b.label ? -1 : 1))
            return group
        })

export const fromApiFormatted = (
    savedFilterFromAPI: SavedFilterAPI
): SavedFilter => {
    return {
        id: savedFilterFromAPI.id,
        name: savedFilterFromAPI.name,
        filter_group: savedFilterFromAPI.filter_group.map((filter) => {
            if (filter.member === FilterKey.Tags) {
                return {
                    ...filter,
                    values: filter.values.map((f, index) => ({
                        ...f,
                        filterInstanceId:
                            index % 2 === 0
                                ? TagFilterInstanceId.First
                                : TagFilterInstanceId.Second,
                    })),
                }
            }
            return filter
        }),
    }
}
