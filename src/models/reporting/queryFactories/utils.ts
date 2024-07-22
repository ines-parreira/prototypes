import {ReportingFilter, ReportingFilterOperator} from 'models/reporting/types'
import {WithLogicalOperator} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

type OptionalFilter =
    | string[]
    | number[]
    | WithLogicalOperator<string>
    | WithLogicalOperator<number>
    | undefined

export const isFilterWithLogicalOperator = (
    filter:
        | string[]
        | number[]
        | WithLogicalOperator<string>
        | WithLogicalOperator<number>
): filter is WithLogicalOperator<string> | WithLogicalOperator<number> =>
    !Array.isArray(filter) && 'operator' in filter

export const hasFilter = (filter: OptionalFilter) => {
    if (filter === undefined) {
        return false
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
    if (isFilterWithLogicalOperator(filter)) {
        if (filter.values.length === 0) {
            return commonFilters
        }
        if (filter.operator === LogicalOperatorEnum.ALL_OF) {
            reportingFilters = filter.values.map((value) => ({
                values: [toLowerCaseString(value)],
                member: filterDefaults.member,
                operator: FilterOperatorMap[filter.operator],
            }))
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
    values?: T[]
): WithLogicalOperator<T> {
    return {
        values: values ?? [],
        operator: LogicalOperatorEnum.ONE_OF,
    }
}
