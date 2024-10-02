import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {
    CustomFieldFilter,
    FilterKey,
    LegacyStatsFilters,
    StatsFiltersWithLogicalOperator,
    TagFilterInstanceId,
} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

const getCustomFields = (statsFilters: Partial<LegacyStatsFilters>) => {
    const customFieldFilters: Record<string, CustomFieldFilter> = {}
    const filterValues = statsFilters[FilterKey.CustomFields]

    if (filterValues !== undefined) {
        filterValues.forEach((filter) => {
            const customFieldId = filter.slice(0, filter.indexOf(':'))
            const value = filter.slice(filter.indexOf(':') + 2)
            if (customFieldFilters[customFieldId]) {
                customFieldFilters[customFieldId].values.push(value)
            }
            customFieldFilters[customFieldId] = {
                customFieldId: Number(customFieldId),
                values: customFieldFilters[customFieldId]?.values || [value],
                operator: LogicalOperatorEnum.ONE_OF,
            }
        })
    }
    return Object.values(customFieldFilters) // TODO: change the Filters type to map
}

export const fromPartialLegacyStatsFilters = (
    statsFilters: Partial<LegacyStatsFilters>
): Partial<StatsFiltersWithLogicalOperator> => {
    const filterKeys = Object.values(FilterKey)
    return filterKeys.reduce<Partial<StatsFiltersWithLogicalOperator>>(
        (acc, key) => {
            switch (key) {
                case FilterKey.Period:
                    acc[key] = statsFilters[key]
                    break
                case FilterKey.Tags:
                    if (
                        statsFilters[key] !== undefined &&
                        statsFilters[key]?.values !== undefined
                    ) {
                        acc[key] = [
                            {
                                ...withDefaultLogicalOperator(
                                    statsFilters[key]
                                ),
                                filterInstanceId: TagFilterInstanceId.First,
                            },
                        ]
                    }
                    break
                case FilterKey.Integrations:
                case FilterKey.Agents:
                case FilterKey.HelpCenters:
                    if (statsFilters[key] !== undefined) {
                        acc[key] = withDefaultLogicalOperator(statsFilters[key])
                    }
                    break
                case FilterKey.CustomFields:
                    if (statsFilters[key] !== undefined) {
                        acc[key] = getCustomFields(statsFilters)
                    }
                    break
                default:
                    if (statsFilters[key] !== undefined) {
                        acc[key] = withDefaultLogicalOperator(statsFilters[key])
                    }
            }
            return acc
        },
        {}
    )
}

export const fromLegacyStatsFilters = (
    statsFilters: LegacyStatsFilters
): StatsFiltersWithLogicalOperator => {
    const filterKeys = Object.values(FilterKey)
    return filterKeys.reduce<StatsFiltersWithLogicalOperator>(
        (acc, key) => {
            switch (key) {
                case FilterKey.Period:
                    acc[key] = statsFilters[key]
                    break
                case FilterKey.Tags:
                    if (
                        statsFilters[key] !== undefined &&
                        statsFilters[key]?.values !== undefined
                    ) {
                        acc[key] = [
                            {
                                ...withDefaultLogicalOperator(
                                    statsFilters[key]
                                ),
                                filterInstanceId: TagFilterInstanceId.First,
                            },
                        ]
                    }
                    break
                case FilterKey.Integrations:
                case FilterKey.Agents:
                case FilterKey.HelpCenters:
                    if (
                        statsFilters[key] !== undefined &&
                        statsFilters[key]?.values !== undefined
                    ) {
                        acc[key] = withDefaultLogicalOperator(statsFilters[key])
                    }
                    break
                case FilterKey.CustomFields:
                    if (
                        statsFilters[key] !== undefined &&
                        statsFilters[key]?.values !== undefined
                    ) {
                        acc[key] = getCustomFields(statsFilters)
                    }
                    break
                default:
                    if (
                        statsFilters[key] !== undefined &&
                        statsFilters[key]?.values !== undefined
                    ) {
                        acc[key] = withDefaultLogicalOperator(statsFilters[key])
                    }
            }
            return acc
        },
        {
            period: statsFilters.period,
        }
    )
}

export const fromFiltersWithLogicalOperators = (
    statsFilters: StatsFiltersWithLogicalOperator
): LegacyStatsFilters => {
    return {
        period: statsFilters[FilterKey.Period],
        ...Object.values(FilterKey).reduce<Partial<LegacyStatsFilters>>(
            (acc, filter) => {
                switch (filter) {
                    case FilterKey.Period:
                        acc[filter] = statsFilters[filter]
                        break
                    case FilterKey.Tags:
                        if (statsFilters[filter] !== undefined) {
                            acc[filter] = (statsFilters[filter] ?? []).find(
                                (tagFilter) =>
                                    tagFilter.operator ===
                                    LogicalOperatorEnum.ONE_OF
                            )?.values
                        }
                        break
                    case FilterKey.Integrations:
                    case FilterKey.Agents:
                    case FilterKey.HelpCenters:
                        if (statsFilters[filter]?.values !== undefined) {
                            acc[filter] = statsFilters[filter]?.values
                        }
                        break
                    case FilterKey.CustomFields:
                        if (
                            statsFilters[filter] !== undefined &&
                            (statsFilters[filter]?.length ?? 0) > 0
                        ) {
                            acc[filter] = statsFilters[filter]?.reduce<
                                string[]
                            >((accumulator, value) => {
                                if (value.values) {
                                    accumulator.push(...value.values)
                                }
                                return accumulator
                            }, [])
                        }
                        break
                    default:
                        if (statsFilters[filter]?.values !== undefined) {
                            acc[filter] = statsFilters[filter]?.values
                        }
                }
                return acc
            },
            {}
        ),
    }
}
