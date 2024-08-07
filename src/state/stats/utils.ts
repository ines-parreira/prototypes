import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {
    FilterKey,
    LegacyStatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'models/stat/types'

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
                case FilterKey.Integrations:
                case FilterKey.Tags:
                case FilterKey.Agents:
                case FilterKey.HelpCenters:
                    if (statsFilters[key] !== undefined) {
                        acc[key] = withDefaultLogicalOperator(statsFilters[key])
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
                case FilterKey.Integrations:
                case FilterKey.Tags:
                case FilterKey.Agents:
                case FilterKey.HelpCenters:
                    if (
                        statsFilters[key] !== undefined &&
                        statsFilters[key]?.values !== undefined
                    ) {
                        acc[key] = withDefaultLogicalOperator(statsFilters[key])
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

export const fromLegacyAndLogicalOperatorStatsFilters = (
    legacyStatsFilters: LegacyStatsFilters,
    statsFilters: StatsFiltersWithLogicalOperator
): StatsFiltersWithLogicalOperator => {
    const filterKeys = Object.values(FilterKey)
    return filterKeys.reduce<StatsFiltersWithLogicalOperator>(
        (acc, key) => {
            switch (key) {
                case FilterKey.Period:
                    acc[key] = legacyStatsFilters[key]
                    break
                case FilterKey.Integrations:
                case FilterKey.Tags:
                case FilterKey.Agents:
                case FilterKey.HelpCenters:
                    if (
                        legacyStatsFilters[key] !== undefined &&
                        legacyStatsFilters[key]?.values !== undefined
                    ) {
                        acc[key] = withDefaultLogicalOperator(
                            legacyStatsFilters[key],
                            statsFilters[key]?.operator
                        )
                    }
                    break
                default:
                    if (
                        legacyStatsFilters[key] !== undefined &&
                        legacyStatsFilters[key]?.values !== undefined
                    ) {
                        acc[key] = withDefaultLogicalOperator(
                            legacyStatsFilters[key],
                            statsFilters[key]?.operator
                        )
                    }
            }
            return acc
        },
        {
            period: legacyStatsFilters.period,
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
                    case FilterKey.Integrations:
                    case FilterKey.Tags:
                    case FilterKey.Agents:
                    case FilterKey.HelpCenters:
                        if (
                            statsFilters[filter]?.values !== undefined &&
                            statsFilters[filter]?.values !== undefined
                        ) {
                            acc[filter] = statsFilters[filter]?.values
                        }
                        break
                    default:
                        if (
                            statsFilters[filter]?.values !== undefined &&
                            statsFilters[filter]?.values !== undefined
                        ) {
                            acc[filter] = statsFilters[filter]?.values
                        }
                }
                return acc
            },
            {}
        ),
    }
}
