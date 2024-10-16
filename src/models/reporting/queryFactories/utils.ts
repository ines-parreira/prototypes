import _flatMap from 'lodash/flatMap'
import {CustomFieldValue} from 'custom-fields/types'
import {HelpdeskMessageMember} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {
    ReportingFilter,
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import {
    CustomFieldFilter,
    FilterKey,
    StatsFilters,
    TagFilter,
    WithLogicalOperator,
} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

export type OptionalFilter =
    | string[]
    | number[]
    | CustomFieldFilter[]
    | TagFilter[]
    | WithLogicalOperator<string>
    | WithLogicalOperator<number>
    | undefined

export const isAggregationWindowFilter = (filter: any) =>
    [
        ReportingGranularity.Hour,
        ReportingGranularity.Day,
        ReportingGranularity.Week,
        ReportingGranularity.Month,
    ].includes(filter)

export const isFilterWithLogicalOperator = (
    filter: OptionalFilter
): filter is WithLogicalOperator<string> | WithLogicalOperator<number> =>
    !Array.isArray(filter) &&
    filter !== undefined &&
    'operator' in filter &&
    'values' in filter

export const isPeriodFilter = (filter: OptionalFilter): boolean =>
    filter !== undefined &&
    'start_datetime' in filter &&
    'end_datetime' in filter

export const isCustomFieldFilter = (
    filter: OptionalFilter
): filter is CustomFieldFilter[] =>
    Array.isArray(filter) &&
    filter.some(
        (subFilter) =>
            typeof subFilter === 'object' &&
            'operator' in subFilter &&
            'customFieldId' in subFilter &&
            'values' in subFilter
    )

export const isTagFilter = (filter: OptionalFilter): filter is TagFilter[] =>
    filter !== undefined &&
    Array.isArray(filter) &&
    filter.every(
        (subFilter) =>
            typeof subFilter === 'object' &&
            'operator' in subFilter &&
            'filterInstanceId' in subFilter
    )

export const hasFilter = (filter: OptionalFilter) => {
    if (filter === undefined) {
        return false
    }
    if (isCustomFieldFilter(filter) || isTagFilter(filter)) {
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
    let reportingFilters: ReportingFilter[] = []
    if (isCustomFieldFilter(filter)) {
        const values = filter
            .filter((f) => f.values.length > 0)
            .map((customFieldFilter) => {
                if (
                    customFieldFilter.operator ===
                        LogicalOperatorEnum.NOT_ONE_OF &&
                    filterDefaults.member === TicketMember.CustomField
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
        const uniqueCustomFieldIds = Array.from(
            new Set(
                filter
                    .filter(
                        (filter) =>
                            filter.operator === LogicalOperatorEnum.ONE_OF &&
                            filter.values.length > 0
                    )
                    .map((filter) => filter.customFieldId)
            )
        )
        if (uniqueCustomFieldIds.length > 1) {
            reportingFilters.push({
                member: TicketMember.TotalCustomFieldIdsToMatch,
                values: [String(uniqueCustomFieldIds.length)],
                operator: ReportingFilterOperator.Equals,
            })
        }
    } else if (isTagFilter(filter)) {
        filter.forEach((tagFilter) => {
            if (
                tagFilter.operator === LogicalOperatorEnum.ALL_OF &&
                filterDefaults.member === TicketMember.Tags &&
                tagFilter.values.length > 0
            ) {
                reportingFilters.push({
                    member: TicketMember.AllTags,
                    values: tagFilter.values.map(toLowerCaseString),
                    operator: ReportingFilterOperator.Equals,
                })
            } else if (
                tagFilter.operator === LogicalOperatorEnum.NOT_ONE_OF &&
                filterDefaults.member === TicketMember.Tags &&
                tagFilter.values.length > 0
            ) {
                reportingFilters.push({
                    member: NotEqualsMap[filterDefaults.member],
                    values: tagFilter.values.map(toLowerCaseString),
                    operator: FilterOperatorMap[tagFilter.operator],
                })
            } else if (tagFilter.values.length > 0) {
                reportingFilters.push({
                    member: filterDefaults.member,
                    values: tagFilter.values.map(toLowerCaseString),
                    operator: FilterOperatorMap[tagFilter.operator],
                })
            }
        })
    } else if (isFilterWithLogicalOperator(filter)) {
        if (filter.values.length === 0) {
            return commonFilters
        }
        if (
            filter.operator === LogicalOperatorEnum.NOT_ONE_OF &&
            filterDefaults.member === TicketMember.MessageSenderId
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
                    values: filter.values.map(toLowerCaseString),
                    operator: FilterOperatorMap[filter.operator],
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
        operator: operator ?? LogicalOperatorEnum.ONE_OF,
        values: values ?? [],
    }
}

export function withLogicalOperator<T extends number | string>(
    values: T[],
    operator = LogicalOperatorEnum.ONE_OF
): WithLogicalOperator<T> {
    return {
        operator,
        values: values,
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

const isStringArray = (
    customFieldsArray: string[] | CustomFieldFilter[] | undefined
): customFieldsArray is string[] =>
    Array.isArray(customFieldsArray) &&
    customFieldsArray.length > 0 &&
    typeof customFieldsArray[0] === 'string'

export const getCustomFieldValueSerializer =
    (customFieldId: number) => (field: CustomFieldValue) =>
        `${customFieldId}${TICKET_CUSTOM_FIELDS_API_SEPARATOR}${field}`

const removeDuplicateInstances = (customFieldId: number) => (value: string) =>
    !value.startsWith(`${customFieldId}${TICKET_CUSTOM_FIELDS_API_SEPARATOR}`)

const removeDuplicateFilterInstances =
    (customFieldId: number) => (filter: CustomFieldFilter) => {
        if (filter.operator === LogicalOperatorEnum.ONE_OF) {
            return {
                ...filter,
                values: filter.values.filter(
                    removeDuplicateInstances(customFieldId)
                ),
            }
        }
        return filter
    }

export const injectDrillDownCustomFieldId = (
    statsFilters: StatsFilters,
    customFieldId: number,
    customFieldsValueStrings: string[] | null
): StatsFilters => {
    if (customFieldsValueStrings === null) {
        return statsFilters
    }
    const {customFields} = statsFilters
    const filters: StatsFilters = {
        ...statsFilters,
    }

    const customFieldFilterWithPrefixedId = {
        customFieldId,
        operator: LogicalOperatorEnum.ONE_OF,
        values: customFieldsValueStrings.map(
            getCustomFieldValueSerializer(Number(customFieldId))
        ),
    }

    if (hasFilter(customFields)) {
        const currentValue = statsFilters[FilterKey.CustomFields]
        if (isStringArray(currentValue)) {
            filters[FilterKey.CustomFields] = [
                ...currentValue.filter(removeDuplicateInstances(customFieldId)),
                ...customFieldFilterWithPrefixedId.values,
            ]
        } else if (currentValue !== undefined) {
            filters[FilterKey.CustomFields] = [
                ...currentValue.map(
                    removeDuplicateFilterInstances(customFieldId)
                ),
                customFieldFilterWithPrefixedId,
            ]
        }
    } else {
        filters[FilterKey.CustomFields] = [customFieldFilterWithPrefixedId]
    }

    return filters
}
