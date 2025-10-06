import { ReportingStatsOperatorsEnum } from '@gorgias/helpdesk-types'

import {
    FilterGroup,
    ScopeFilters,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'

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
