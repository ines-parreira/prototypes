import _flatMap from 'lodash/flatMap'
import {CustomFieldValue} from 'models/customField/types'
import {HelpdeskMessageMember} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {ReportingFilter, ReportingFilterOperator} from 'models/reporting/types'
import {CustomFieldFilter, WithLogicalOperator} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

type OptionalFilter =
    | string[]
    | number[]
    | CustomFieldFilter[]
    | WithLogicalOperator<string>
    | WithLogicalOperator<number>
    | undefined

export const isFilterWithLogicalOperator = (
    filter:
        | string[]
        | number[]
        | WithLogicalOperator<string>
        | WithLogicalOperator<number>
        | CustomFieldFilter[]
): filter is WithLogicalOperator<string> | WithLogicalOperator<number> =>
    !Array.isArray(filter) && 'operator' in filter

export const isCustomFieldFilter = (
    filter:
        | string[]
        | number[]
        | CustomFieldFilter[]
        | WithLogicalOperator<string>
        | WithLogicalOperator<number>
): filter is CustomFieldFilter[] =>
    Array.isArray(filter) &&
    filter.every(
        (subFilter) =>
            typeof subFilter === 'object' &&
            'operator' in subFilter &&
            'customFieldId' in subFilter
    )

export const hasFilter = (filter: OptionalFilter) => {
    if (filter === undefined) {
        return false
    }
    if (isCustomFieldFilter(filter)) {
        return filter.some((subFilter) => subFilter.values.length > 0)
    }
    if (isFilterWithLogicalOperator(filter)) {
        return filter.values.length > 0
    }
    return filter.length > 0
}

export const FilterOperatorMap = {
    [LogicalOperatorEnum.ONE_OF]: ReportingFilterOperator.Equals,
    [LogicalOperatorEnum.NOT_ONE_OF]: ReportingFilterOperator.NotEquals,
    [LogicalOperatorEnum.ALL_OF]: ReportingFilterOperator.Equals,
}

export const toLowerCaseString = (value: string | number) =>
    String(value).toLowerCase()

const NotEqualsMap = {
    [TicketMember.CustomField]: TicketMember.CustomFieldToExclude,
    [TicketMember.Tags]: TicketMember.TagsToExclude,
    [TicketMember.MessageSenderId]: TicketMember.MessageSenderIdToExclude,
}

export const deduplicateCustomFields = (
    acc: ReportingFilter[],
    filter: ReportingFilter
): ReportingFilter[] => {
    if (
        filter.member === TicketMember.CustomField ||
        filter.member === TicketMember.CustomFieldToExclude
    ) {
        const existingFilter = acc.find((f) => f.member === filter.member)
        let filterToAddOrReplace: ReportingFilter
        if (existingFilter) {
            filterToAddOrReplace = {
                ...existingFilter,
                values: [...existingFilter.values, ...filter.values],
            }
        } else {
            filterToAddOrReplace = filter
        }
        return [
            ...acc.filter((f) => f.member !== filter.member),
            filterToAddOrReplace,
        ]
    }
    return [...acc, filter]
}

export const addOptionalFilter = (
    commonFilters: ReportingFilter[],
    filter: OptionalFilter,
    filterDefaults: {
        member: ReportingFilter['member']
        operator: ReportingFilterOperator
    }
) => {
    if (filter === undefined) {
        return commonFilters
    }
    let reportingFilters
    if (isCustomFieldFilter(filter)) {
        const values = filter
            .filter((f) => f.values.length > 0)
            .map((customFieldFilter) => {
                if (
                    customFieldFilter.operator ===
                        LogicalOperatorEnum.NOT_ONE_OF &&
                    (filterDefaults.member === TicketMember.CustomField ||
                        filterDefaults.member === TicketMember.Tags ||
                        filterDefaults.member === TicketMember.MessageSenderId)
                ) {
                    return {
                        member: NotEqualsMap[filterDefaults.member],
                        values: customFieldFilter.values.map(String),
                        operator: FilterOperatorMap[customFieldFilter.operator],
                    }
                } else if (
                    customFieldFilter.operator === LogicalOperatorEnum.ALL_OF
                ) {
                    return [
                        {
                            member: filterDefaults.member,
                            values: customFieldFilter.values.map(String),
                            operator:
                                FilterOperatorMap[customFieldFilter.operator],
                        },
                        {
                            member: TicketMember.TotalCustomFieldIdsToMatch,
                            values: [String(customFieldFilter.values.length)],
                            operator: ReportingFilterOperator.Equals,
                        },
                    ]
                }
                return {
                    member: filterDefaults.member,
                    values: customFieldFilter.values.map(String),
                    operator: FilterOperatorMap[customFieldFilter.operator],
                }
            })

        reportingFilters = _flatMap(values).reduce(deduplicateCustomFields, [])
    } else if (isFilterWithLogicalOperator(filter)) {
        if (filter.values.length === 0) {
            return commonFilters
        }
        if (
            filter.operator === LogicalOperatorEnum.ALL_OF &&
            filterDefaults.member === TicketMember.Tags
        ) {
            reportingFilters = [
                {
                    member: TicketMember.AllTags,
                    operator: ReportingFilterOperator.Equals,
                    values: filter.values.map(toLowerCaseString),
                },
            ]
        } else if (
            filter.operator === LogicalOperatorEnum.NOT_ONE_OF &&
            (filterDefaults.member === TicketMember.Tags ||
                filterDefaults.member === TicketMember.MessageSenderId)
        ) {
            reportingFilters = [
                {
                    member: NotEqualsMap[filterDefaults.member],
                    values: filter.values.map(toLowerCaseString),
                    operator: FilterOperatorMap[filter.operator],
                },
            ]
        } else if (
            filter.operator === LogicalOperatorEnum.NOT_ONE_OF &&
            filterDefaults.member === HelpdeskMessageMember.SenderId
        ) {
            reportingFilters = [
                {
                    member: filterDefaults.member,
                    values: [...filter.values.map(toLowerCaseString), null],
                    operator: FilterOperatorMap[filter.operator],
                },
            ]
        } else {
            reportingFilters = [
                {
                    member: filterDefaults.member,
                    operator: FilterOperatorMap[filter.operator],
                    values: filter.values.map(toLowerCaseString),
                },
            ]
        }
    } else {
        if (filter.length === 0) {
            return commonFilters
        }
        reportingFilters = [
            {
                ...filterDefaults,
                values: filter.map(toLowerCaseString),
            },
        ]
    }

    return [...commonFilters, ...reportingFilters]
}

export function withDefaultLogicalOperator<T extends number | string>(
    values?: T[],
    operator?: LogicalOperatorEnum
): WithLogicalOperator<T> {
    return {
        values: values ?? [],
        operator: operator ?? LogicalOperatorEnum.ONE_OF,
    }
}

export function withLogicalOperator<T extends number | string>(
    values?: T[],
    operator = LogicalOperatorEnum.ONE_OF
): WithLogicalOperator<T> {
    return {
        values: values ?? [],
        operator,
    }
}

export function withDefaultCustomFieldAndLogicalOperator({
    values = [],
    operator = LogicalOperatorEnum.ONE_OF,
    customFieldId,
}: {
    values?: string[]
    operator?: LogicalOperatorEnum
    customFieldId: number
}): CustomFieldFilter {
    return {
        customFieldId,
        values,
        operator,
    }
}

export const TICKET_CUSTOM_FIELDS_API_SEPARATOR = '::'

export const getCustomFieldValueSerializer =
    (customFieldId: number) => (field: CustomFieldValue) =>
        `${customFieldId}${TICKET_CUSTOM_FIELDS_API_SEPARATOR}${field}`
