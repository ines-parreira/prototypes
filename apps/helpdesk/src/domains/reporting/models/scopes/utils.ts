import { ReportingStatsOperatorsEnum } from '@gorgias/helpdesk-types'

import {
    FilterGroup,
    ScopeFilters,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import {
    Cube,
    ReportingFilter,
    ReportingQuery,
    ReportingTimeDimension,
} from 'domains/reporting/models/types'

function createStandardFilter(
    member: string,
    operator: ReportingStatsOperatorsEnum,
    values: string[],
): FilterGroup {
    return {
        member,
        operator,
        values,
    }
}

// TODO: pass member
function createTagsFilter(
    tags: Array<{
        operator: 'one-of' | 'not-one-of' | 'all-of'
        values: string[]
    }>,
): FilterGroup {
    return {
        member: 'tags',
        values: tags,
    }
}

// TODO: pass member
function createCustomFieldsFilter(
    customFields: Array<{
        custom_field_id: string
        operator: 'one-of' | 'not-one-of'
        values: string[]
    }>,
): FilterGroup {
    return {
        member: 'customFields',
        values: customFields,
    }
}

/**
 * Creates scope filters based on the scope configuration and context filters.
 * Only applies filters that are defined in the scope's filter configuration.
 */
export function createScopeFilters<TMeta extends ScopeMeta>(
    statFilters: StatsFiltersWithLogicalOperator,
    scopeConfig: TMeta,
): ScopeFilters<TMeta> {
    const filters: FilterGroup[] = [
        createStandardFilter(
            'periodStart',
            ReportingStatsOperatorsEnum.AfterDate,
            [statFilters.period.start_datetime],
        ),
        createStandardFilter(
            'periodEnd',
            ReportingStatsOperatorsEnum.BeforeDate,
            [statFilters.period.end_datetime],
        ),
    ]

    // Only process filters that are defined in the scope configuration
    const scopeFilters = scopeConfig.filters || []

    scopeFilters.forEach((filterKey) => {
        switch (filterKey) {
            case 'agents':
                if (statFilters.agents) {
                    filters.push(
                        createStandardFilter(
                            'agents',
                            statFilters.agents.operator,
                            statFilters.agents.values.map(String),
                        ),
                    )
                }
                break

            case 'channels':
                if (statFilters.channels) {
                    filters.push(
                        createStandardFilter(
                            'channels',
                            statFilters.channels.operator,
                            statFilters.channels.values,
                        ),
                    )
                }
                break

            case 'integrations':
                if (statFilters.integrations) {
                    filters.push(
                        createStandardFilter(
                            'integrations',
                            statFilters.integrations.operator,
                            statFilters.integrations.values.map(String),
                        ),
                    )
                }
                break

            case 'tags':
                if (statFilters.tags) {
                    filters.push(
                        createTagsFilter(
                            statFilters.tags.map((tag) => ({
                                operator:
                                    tag.operator ===
                                    ReportingStatsOperatorsEnum.OneOf
                                        ? 'one-of'
                                        : tag.operator ===
                                            ReportingStatsOperatorsEnum.NotOneOf
                                          ? 'not-one-of'
                                          : 'all-of',
                                values: tag.values.map(String),
                            })),
                        ),
                    )
                }
                break

            case 'customFields':
                if (statFilters.customFields) {
                    filters.push(
                        createCustomFieldsFilter(
                            statFilters.customFields.map((field) => ({
                                custom_field_id: String(field.customFieldId),
                                operator:
                                    field.operator ===
                                    ReportingStatsOperatorsEnum.OneOf
                                        ? 'one-of'
                                        : 'not-one-of',
                                values: field.values,
                            })),
                        ),
                    )
                }
                break

            case 'score':
                if (statFilters.score) {
                    filters.push(
                        createStandardFilter(
                            'score',
                            statFilters.score.operator,
                            statFilters.score.values,
                        ),
                    )
                }
                break

            case 'communicationSkills':
                if (statFilters.communicationSkills) {
                    filters.push(
                        createStandardFilter(
                            'communicationSkills',
                            statFilters.communicationSkills.operator,
                            statFilters.communicationSkills.values,
                        ),
                    )
                }
                break

            case 'languageProficiency':
                if (statFilters.languageProficiency) {
                    filters.push(
                        createStandardFilter(
                            'languageProficiency',
                            statFilters.languageProficiency.operator,
                            statFilters.languageProficiency.values,
                        ),
                    )
                }
                break

            case 'resolutionCompleteness':
                if (statFilters.resolutionCompleteness) {
                    filters.push(
                        createStandardFilter(
                            'resolutionCompleteness',
                            statFilters.resolutionCompleteness.operator,
                            statFilters.resolutionCompleteness.values,
                        ),
                    )
                }
                break

            case 'accuracy':
                if (statFilters.accuracy) {
                    filters.push(
                        createStandardFilter(
                            'accuracy',
                            statFilters.accuracy.operator,
                            statFilters.accuracy.values,
                        ),
                    )
                }
                break

            case 'efficiency':
                if (statFilters.efficiency) {
                    filters.push(
                        createStandardFilter(
                            'efficiency',
                            statFilters.efficiency.operator,
                            statFilters.efficiency.values,
                        ),
                    )
                }
                break

            case 'internalCompliance':
                if (statFilters.internalCompliance) {
                    filters.push(
                        createStandardFilter(
                            'internalCompliance',
                            statFilters.internalCompliance.operator,
                            statFilters.internalCompliance.values,
                        ),
                    )
                }
                break

            case 'brandVoice':
                if (statFilters.brandVoice) {
                    filters.push(
                        createStandardFilter(
                            'brandVoice',
                            statFilters.brandVoice.operator,
                            statFilters.brandVoice.values,
                        ),
                    )
                }
                break
        }
    })

    return filters as ScopeFilters<TMeta>
}

function compareArrays<T>(
    v1: T[],
    v2: T[],
    fieldName: string,
    differences: string[],
) {
    const sorted1 = [...v1].sort()
    const sorted2 = [...v2].sort()
    if (JSON.stringify(sorted1) !== JSON.stringify(sorted2)) {
        differences.push(
            `${fieldName}: ${JSON.stringify(v1)} !== ${JSON.stringify(v2)}`,
        )
    }
}

function compareSimpleValues<T>(
    v1: T,
    v2: T,
    fieldName: string,
    differences: string[],
) {
    if (v1 !== v2) {
        differences.push(`${fieldName}: ${v1} !== ${v2}`)
    }
}

const findMatchingFilter = (
    filter: ReportingFilter,
    filters: ReportingFilter[],
) => {
    return filters.find(
        (f) =>
            filter.member === f.member &&
            filter.operator === f.operator &&
            JSON.stringify(filter.values) === JSON.stringify(f.values),
    )
}

function compareFilters(
    v1Filters: ReportingFilter[],
    v2Filters: ReportingFilter[],
    differences: string[],
) {
    if (v1Filters.length !== v2Filters.length) {
        differences.push(
            `filters length: ${v1Filters.length} !== ${v2Filters.length}`,
        )
        return
    }

    for (const v1Filter of v1Filters) {
        if (!findMatchingFilter(v1Filter, v2Filters)) {
            differences.push(
                `filter not found in v2: ${JSON.stringify(v1Filter)}`,
            )
        }
    }

    for (const v2Filter of v2Filters) {
        if (!findMatchingFilter(v2Filter, v1Filters)) {
            differences.push(
                `filter not found in v1: ${JSON.stringify(v2Filter)}`,
            )
        }
    }
}

function compareTimeDimensions(
    v1TimeDimensions: ReportingTimeDimension<any>[],
    v2TimeDimensions: ReportingTimeDimension<any>[],
    differences: string[],
) {
    if (v1TimeDimensions.length !== v2TimeDimensions.length) {
        differences.push(
            `timeDimensions length: ${v1TimeDimensions.length} !== ${v2TimeDimensions.length}`,
        )
        return
    }

    for (let i = 0; i < v1TimeDimensions.length; i++) {
        const v1TimeDim = v1TimeDimensions[i]
        const v2TimeDim = v2TimeDimensions[i]

        if (v1TimeDim.dimension !== v2TimeDim.dimension) {
            differences.push(
                `timeDimensions[${i}].dimension: ${v1TimeDim.dimension} !== ${v2TimeDim.dimension}`,
            )
        }
        if (v1TimeDim.granularity !== v2TimeDim.granularity) {
            differences.push(
                `timeDimensions[${i}].granularity: ${v1TimeDim.granularity} !== ${v2TimeDim.granularity}`,
            )
        }
    }
}

/**
 * Compares two reporting queries.
 * Function should not compare limit, offset and metricName.
 * @param v1query - The first query to compare.
 * @param v2query - The second query to compare.
 * @returns An object containing the comparison results.
 */
export function compareReportingQueries<TCube extends Cube = Cube>(
    v1query: ReportingQuery<TCube>,
    v2query: ReportingQuery<TCube>,
) {
    try {
        const differences: string[] = []

        compareArrays(
            v1query.measures,
            [...v2query.measures],
            'measures',
            differences,
        )
        compareArrays(
            v1query.dimensions,
            [...v2query.dimensions],
            'dimensions',
            differences,
        )
        compareTimeDimensions(
            v1query.timeDimensions || [],
            [...(v2query.timeDimensions || [])],
            differences,
        )
        compareFilters(v1query.filters, v2query.filters, differences)

        if (JSON.stringify(v1query.order) !== JSON.stringify(v2query.order)) {
            differences.push(
                `order: ${JSON.stringify(v1query.order)} !== ${JSON.stringify(v2query.order)}`,
            )
        }

        compareArrays(
            v1query.segments || [],
            [...(v2query.segments || [])],
            'segments',
            differences,
        )

        compareSimpleValues(
            v1query.timezone,
            v2query.timezone,
            'timezone',
            differences,
        )

        return {
            areEqual: differences.length === 0,
            differences,
            summary:
                differences.length === 0
                    ? 'Queries are identical'
                    : `Found ${differences.length} difference(s)`,
        }
    } catch (error: Error | unknown) {
        console.error('compareReportingQueries error:', error)

        return {
            areEqual: false,
            differences: [
                error instanceof Error ? error.message : String(error),
            ],
            summary: 'Error comparing reporting queries',
        }
    }
}
