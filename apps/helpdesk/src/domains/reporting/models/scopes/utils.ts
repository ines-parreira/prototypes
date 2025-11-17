import { ReportingStatsOperatorsEnum } from '@gorgias/helpdesk-types'

import { SentryTeam } from 'common/const/sentryTeamNames'
import type { MetricName } from 'domains/reporting/hooks/metricNames'
import { hasFilter } from 'domains/reporting/models/queryFactories/utils'
import type {
    ScopeFilters,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type {
    CustomFieldsFilter,
    DateFilter,
    FilterGroup,
    FilterName,
    NumberFilterName,
    NumberStandardFilter,
    StandardFilter,
    StringFilterName,
    StringStandardFilter,
    TagsFilter,
} from 'domains/reporting/models/scopes/types'
import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import type {
    Cube,
    ReportingFilter,
    ReportingQuery,
    ReportingTimeDimension,
} from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { reportError } from 'utils/errors'

function createDateFilter(
    member: FilterName,
    operator:
        | ReportingFilterOperator.AfterDate
        | ReportingFilterOperator.BeforeDate,
    values: string[],
): DateFilter {
    return {
        member,
        operator,
        values,
    }
}

function createStandardFilter(
    member: NumberFilterName,
    operator: LogicalOperatorEnum,
    values: number[],
): NumberStandardFilter
function createStandardFilter(
    member: StringFilterName,
    operator: LogicalOperatorEnum,
    values: string[],
): StringStandardFilter
function createStandardFilter(
    member: FilterName,
    operator: LogicalOperatorEnum,
    values: string[] | number[],
): StandardFilter {
    return {
        member,
        operator,
        values,
    } as StandardFilter
}

// TODO: pass member
function createTagsFilter(
    tags: Array<{
        operator: LogicalOperatorEnum
        values: string[]
    }>,
): TagsFilter {
    return {
        member: 'tags',
        values: tags,
    }
}

// TODO: pass member
function createCustomFieldsFilter(
    customFields: Array<{
        custom_field_id: string
        operator: LogicalOperatorEnum.ONE_OF | LogicalOperatorEnum.NOT_ONE_OF
        values: string[]
    }>,
): CustomFieldsFilter {
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
        createDateFilter('periodStart', ReportingFilterOperator.AfterDate, [
            formatReportingQueryDate(statFilters.period.start_datetime),
        ]),
        createDateFilter('periodEnd', ReportingFilterOperator.BeforeDate, [
            formatReportingQueryDate(statFilters.period.end_datetime),
        ]),
    ]
    // Only process filters that are defined in the scope configuration
    const scopeFilters = scopeConfig.filters || []

    scopeFilters.forEach((filterKey) => {
        switch (filterKey) {
            case 'agents':
                if (statFilters.agents && hasFilter(statFilters.agents)) {
                    filters.push(
                        createStandardFilter(
                            'agentId',
                            statFilters.agents.operator,
                            statFilters.agents.values,
                        ),
                    )
                }
                break

            case 'channels':
                if (statFilters.channels && hasFilter(statFilters.channels)) {
                    filters.push(
                        createStandardFilter(
                            'channel',
                            statFilters.channels.operator,
                            statFilters.channels.values,
                        ),
                    )
                }
                break

            case 'integrations':
                if (
                    statFilters.integrations &&
                    hasFilter(statFilters.integrations)
                ) {
                    filters.push(
                        createStandardFilter(
                            'integrationId',
                            statFilters.integrations.operator,
                            statFilters.integrations.values,
                        ),
                    )
                }
                break

            case 'stores':
                if (statFilters.stores && hasFilter(statFilters.stores)) {
                    filters.push(
                        createStandardFilter(
                            'storeId',
                            statFilters.stores.operator,
                            statFilters.stores.values,
                        ),
                    )
                }
                break

            case 'tags':
                if (statFilters.tags && hasFilter(statFilters.tags)) {
                    filters.push(
                        createTagsFilter(
                            statFilters.tags.map((tag) => ({
                                operator:
                                    tag.operator ===
                                    ReportingStatsOperatorsEnum.OneOf
                                        ? LogicalOperatorEnum.ONE_OF
                                        : tag.operator ===
                                            ReportingStatsOperatorsEnum.NotOneOf
                                          ? LogicalOperatorEnum.NOT_ONE_OF
                                          : LogicalOperatorEnum.ALL_OF,
                                values: tag.values.map(String),
                            })),
                        ),
                    )
                }
                break

            case 'customFields':
                if (
                    statFilters.customFields &&
                    hasFilter(statFilters.customFields)
                ) {
                    filters.push(
                        createCustomFieldsFilter(
                            statFilters.customFields
                                .filter((field) => field.values.length > 0)
                                .map((field) => ({
                                    custom_field_id: String(
                                        field.customFieldId,
                                    ),
                                    operator:
                                        field.operator ===
                                        ReportingStatsOperatorsEnum.OneOf
                                            ? LogicalOperatorEnum.ONE_OF
                                            : LogicalOperatorEnum.NOT_ONE_OF,
                                    values: field.values.map((value) => {
                                        // Remove a leading numeric id followed by '::' (e.g. "1234::test::chose" -> "test::chose")
                                        return value.replace(/^\d+::/, '')
                                    }),
                                })),
                        ),
                    )
                }
                break

            case 'score':
                if (statFilters.score && hasFilter(statFilters.score)) {
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
                if (
                    statFilters.communicationSkills &&
                    hasFilter(statFilters.communicationSkills)
                ) {
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
                if (
                    statFilters.languageProficiency &&
                    hasFilter(statFilters.languageProficiency)
                ) {
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
                if (
                    statFilters.resolutionCompleteness &&
                    hasFilter(statFilters.resolutionCompleteness)
                ) {
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
                if (statFilters.accuracy && hasFilter(statFilters.accuracy)) {
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
                if (
                    statFilters.efficiency &&
                    hasFilter(statFilters.efficiency)
                ) {
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
                if (
                    statFilters.internalCompliance &&
                    hasFilter(statFilters.internalCompliance)
                ) {
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
                if (
                    statFilters.brandVoice &&
                    hasFilter(statFilters.brandVoice)
                ) {
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
            `${fieldName}: ${JSON.stringify(v1)} (V1) !== ${JSON.stringify(v2)} (V2)`,
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
            `filters length: V1 ${v1Filters.length} !== V2 ${v2Filters.length}`,
        )
    }

    for (const v1Filter of v1Filters) {
        if (!findMatchingFilter(v1Filter, v2Filters)) {
            differences.push(
                `V1 filter not found in V2: ${JSON.stringify(v1Filter)}`,
            )
        }
    }

    for (const v2Filter of v2Filters) {
        if (!findMatchingFilter(v2Filter, v1Filters)) {
            differences.push(
                `V2 filter not found in V1: ${JSON.stringify(v2Filter)}`,
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
            `timeDimensions length: ${v1TimeDimensions.length} (V1) !== ${v2TimeDimensions.length} (V2)`,
        )
        return
    }

    for (let i = 0; i < v1TimeDimensions.length; i++) {
        const v1TimeDim = v1TimeDimensions[i]
        const v2TimeDim = v2TimeDimensions[i]

        if (v1TimeDim.dimension !== v2TimeDim.dimension) {
            differences.push(
                `timeDimensions[${i}].dimension: ${v1TimeDim.dimension} (V1) !== ${v2TimeDim.dimension} (V2)`,
            )
        }
        if (v1TimeDim.granularity !== v2TimeDim.granularity) {
            differences.push(
                `timeDimensions[${i}].granularity: ${v1TimeDim.granularity} (V1) !== ${v2TimeDim.granularity} (V2)`,
            )
        }
    }
}

/**
 * Compares two reporting queries.
 * Function should not compare limit, offset and metricName.
 * @param metricName - The name of the metric being compared.
 * @param v1query - The first query to compare.
 * @param v2query - The second query to compare.
 * @returns An object containing the comparison results.
 */
export function compareAndReportQueries<TCube extends Cube = Cube>(
    metricName: MetricName,
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

        type LegacyOrder = { id: string; desc?: boolean; asc?: boolean }
        type NewOrder = [string, string]

        const v1Order: LegacyOrder[] = (v1query.order as any) || [
            { id: '', desc: false, asc: false },
        ]
        const v2Order: NewOrder[] = (v2query.order as any) || [['', '']]

        if (
            v1Order[0] &&
            v2Order[0] &&
            v1Order[0].id !== '' &&
            v2Order[0][0] !== ''
        ) {
            const isCorrectDescending =
                v1Order[0].desc === true && v2Order[0][1] === 'desc'
            const isCorrectAscending =
                v1Order[0].desc === false && v2Order[0][1] === 'asc'

            if (
                v1Order[0].id !== v2Order[0][0] ||
                (!isCorrectDescending && !isCorrectAscending)
            ) {
                differences.push(
                    `order: ${JSON.stringify(v1query.order)} (V1) !== ${JSON.stringify(v2query.order)} (V2)`,
                )
            }
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

        if (differences.length > 0) {
            console.error(
                `New Stats API and Legacy API queries are different for metric ${metricName}`,
                differences,
            )

            reportError(
                new Error(
                    `New Stats API and Legacy API queries are different for metric ${metricName}`,
                ),
                {
                    tags: { team: SentryTeam.CRM_REPORTING },
                    extra: {
                        differences,
                        summary: `Found ${differences.length} difference(s)`,
                        metricName,
                        v1query: JSON.stringify(v1query),
                        v2query: JSON.stringify(v2query),
                    },
                },
            )
            return false
        }
        return true
    } catch (error: Error | unknown) {
        reportError(error, {
            tags: { team: SentryTeam.CRM_REPORTING },
            extra: {
                message: 'Error comparing reporting queries in New Stats API',
            },
        })
        return false
    }
}
