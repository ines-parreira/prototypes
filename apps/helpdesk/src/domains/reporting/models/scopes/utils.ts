import { reportError } from '@repo/logging'

import { ReportingStatsOperatorsEnum } from '@gorgias/helpdesk-types'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { skipMetricComparison } from 'core/flags/utils/newApiMetricFlags'
import type { MetricName } from 'domains/reporting/hooks/metricNames'
import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import {
    hasFilter,
    toLowerCaseString,
} from 'domains/reporting/models/queryFactories/utils'
import type {
    ScopeFilters,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type {
    BooleanFilterName,
    BooleanStandardFilter,
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
import type { ApiStatsFilters } from 'domains/reporting/models/stat/types'
import type {
    Cube,
    ReportingFilter,
    ReportingQuery,
    ReportingTimeDimension,
} from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import type { ExtendedLogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    ApiOnlyOperatorEnum,
    LogicalOperatorEnum,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { CAMPAIGN_EVENTS } from 'domains/reporting/pages/convert/clients/constants'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

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
    member: BooleanFilterName,
    operator: ExtendedLogicalOperatorEnum,
    values: boolean[],
): BooleanStandardFilter
function createStandardFilter(
    member: NumberFilterName,
    operator: ExtendedLogicalOperatorEnum,
    values: number[],
): NumberStandardFilter
function createStandardFilter(
    member: StringFilterName,
    operator: ExtendedLogicalOperatorEnum,
    values: string[],
): StringStandardFilter
function createStandardFilter(
    member: FilterName,
    operator: ExtendedLogicalOperatorEnum,
    values: string[] | number[] | boolean[],
): StandardFilter
function createStandardFilter<T>(
    member: FilterName,
    operator: ExtendedLogicalOperatorEnum,
    values: T[],
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
    statFilters: ApiStatsFilters,
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
            case 'agentId':
                if (statFilters.agents && hasFilter(statFilters.agents)) {
                    filters.push(
                        createStandardFilter(
                            'agentId',
                            statFilters.agents.operator,
                            statFilters.agents.values,
                        ),
                    )
                } else if (
                    statFilters.agentId &&
                    hasFilter(statFilters.agentId)
                ) {
                    filters.push(
                        createStandardFilter(
                            filterKey,
                            statFilters.agentId.operator,
                            statFilters.agentId.values,
                        ),
                    )
                }
                break

            case 'channel':
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

            case 'integrationId':
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

            case 'storeIntegrationId':
                if (
                    statFilters.storeIntegrations &&
                    hasFilter(statFilters.storeIntegrations)
                ) {
                    filters.push(
                        createStandardFilter(
                            'integrationId',
                            statFilters.storeIntegrations.operator,
                            statFilters.storeIntegrations.values,
                        ),
                    )
                }
                break

            case 'storeId':
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
                            statFilters.tags
                                .filter((tag) => tag.values.length > 0)
                                .map((tag) => ({
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

            case 'aiAgentRole':
                if (
                    statFilters.aiAgentSkill &&
                    hasFilter(statFilters.aiAgentSkill)
                ) {
                    filters.push(
                        createStandardFilter(
                            'aiAgentRole',
                            statFilters.aiAgentSkill.operator,
                            statFilters.aiAgentSkill.values,
                        ),
                    )
                }
                break

            case 'score':
            case 'communicationSkills':
            case 'languageProficiency':
            case 'resolutionCompleteness':
            case 'accuracy':
            case 'efficiency':
            case 'internalCompliance':
            case 'customFieldValue':
            case 'brandVoice':
            case 'customFieldId':
            case 'productId':
            case 'resourceSourceId':
            case 'resourceSourceSetId':
            case 'callDirection':
            case 'callTerminationStatus':
            case 'callSlaStatus':
            case 'isAnsweredByAgent':
            case 'isDuringBusinessHours':
            case 'displayStatus':
            case 'talkTime':
            case 'waitTime':
            case 'helpCenterEventType':
            case 'isSearchRequestWithClick':
            case 'searchResultCount':
            case 'isInfluenced':
            case 'articleId':
            case 'abVariant':
            case 'shopName':
            case 'source':
            case 'eventType':
            case 'automationFeatureType':
            case 'engagementType':
            case 'aiAgentSkill':
            case 'currency':
            case 'orderId':
                {
                    const filter = statFilters[filterKey]
                    if (filter && hasFilter(filter)) {
                        filters.push(
                            createStandardFilter(
                                filterKey,
                                filter.operator,
                                filter.values,
                            ),
                        )
                    }
                }
                break
            case 'slaPolicyUuid':
                if (
                    statFilters.slaPolicies &&
                    hasFilter(statFilters.slaPolicies)
                ) {
                    filters.push(
                        createStandardFilter(
                            'slaPolicyUuid',
                            statFilters.slaPolicies.operator,
                            statFilters.slaPolicies.values,
                        ),
                    )
                }
                break
            case 'teamId':
                if (statFilters.teams && hasFilter(statFilters.teams)) {
                    filters.push(
                        createStandardFilter(
                            'teamId',
                            statFilters.teams.operator,
                            statFilters.teams.values,
                        ),
                    )
                }
                break
            case 'createdDatetime':
                if (statFilters.createdDatetime) {
                    // the backend API does not support inDateRange operator, so we convert it to AfterDate and BeforeDate
                    filters.push({
                        member: 'createdDatetime',
                        operator: ApiOnlyOperatorEnum.IN_DATE_RANGE,
                        values: [
                            formatReportingQueryDate(
                                statFilters.createdDatetime.start_datetime,
                            ),
                            formatReportingQueryDate(
                                statFilters.createdDatetime.end_datetime,
                            ),
                        ],
                    })
                }
                break
            case 'queueId':
                if (
                    statFilters.voiceQueues &&
                    hasFilter(statFilters.voiceQueues)
                ) {
                    filters.push(
                        createStandardFilter(
                            'queueId',
                            statFilters.voiceQueues.operator,
                            statFilters.voiceQueues.values,
                        ),
                    )
                }
                break
            case 'helpCenterId': {
                if (
                    statFilters.helpCenters &&
                    hasFilter(statFilters.helpCenters)
                ) {
                    filters.push(
                        createStandardFilter(
                            'helpCenterId',
                            statFilters.helpCenters.operator,
                            statFilters.helpCenters.values,
                        ),
                    )
                }
                break
            }
            case 'localeCodes': {
                if (
                    statFilters.localeCodes &&
                    hasFilter(statFilters.localeCodes)
                ) {
                    filters.push(
                        createStandardFilter(
                            'localeCodes',
                            statFilters.localeCodes.operator,
                            statFilters.localeCodes.values.map(
                                toLowerCaseString,
                            ),
                        ),
                    )
                }
                break
            }
            case 'campaignId':
                if (statFilters.campaigns && hasFilter(statFilters.campaigns)) {
                    filters.push(
                        createStandardFilter(
                            'campaignId',
                            statFilters.campaigns.operator,
                            statFilters.campaigns.values,
                        ),
                    )
                }
                break
        }
    })
    return filters as ScopeFilters<TMeta>
}

type SegmentToFilterMapping = {
    segment: string // V1 segment name (e.g., 'VoiceCall.outboundCalls')
    filters: ReportingFilter[] // Equivalent V2 filters
}

/**
 * Maps V1 segments to their equivalent V2 filters.
 * When a V1 segment is converted to V2 filters (as done in voiceCalls.ts withVoiceCallSegment),
 * this mapping allows the query comparison to recognize them as equivalent.
 */
const SEGMENT_TO_FILTER_MAPPINGS: SegmentToFilterMapping[] = [
    {
        segment: 'VoiceCall.outboundCalls',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['outbound'],
            },
        ],
    },
    {
        segment: 'VoiceCall.inboundCalls',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['inbound'],
            },
        ],
    },
    {
        segment: 'VoiceCall.inboundUnansweredCalls',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['inbound'],
            },
            {
                member: 'VoiceCall.terminationStatus',
                operator: ReportingFilterOperator.Equals,
                values: [
                    'missed',
                    'abandoned',
                    'cancelled',
                    'callback-requested',
                ],
            },
        ],
    },
    {
        segment: 'VoiceCall.inboundMissedCalls',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['inbound'],
            },
            {
                member: 'VoiceCall.terminationStatus',
                operator: ReportingFilterOperator.Equals,
                values: ['missed'],
            },
        ],
    },
    {
        segment: 'VoiceCall.inboundAbandonedCalls',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['inbound'],
            },
            {
                member: 'VoiceCall.terminationStatus',
                operator: ReportingFilterOperator.Equals,
                values: ['abandoned'],
            },
        ],
    },
    {
        segment: 'VoiceCall.inboundCancelledCalls',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['inbound'],
            },
            {
                member: 'VoiceCall.terminationStatus',
                operator: ReportingFilterOperator.Equals,
                values: ['cancelled'],
            },
        ],
    },
    {
        segment: 'VoiceCall.inboundCallbackRequestedCalls',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['inbound'],
            },
            {
                member: 'VoiceCall.terminationStatus',
                operator: ReportingFilterOperator.Equals,
                values: ['callback-requested'],
            },
        ],
    },
    {
        segment: 'VoiceCall.inboundUnansweredCallsByAgent',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['inbound'],
            },
            {
                member: 'VoiceCall.unansweredByFilteringAgent',
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
        ],
    },
    {
        segment: 'VoiceCall.inboundAnsweredCallsByAgent',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['inbound'],
            },
            {
                member: 'VoiceCall.answeredByFilteringAgent',
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
        ],
    },
    {
        segment: 'VoiceCall.callSlaBreached',
        filters: [
            {
                member: 'VoiceCall.callSlaStatus',
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
        ],
    },

    // The "survey scored" segment is redundant
    {
        segment: 'TicketSatisfactionSurveyEnriched.surveyScored',
        filters: [],
    },
    // Voice events agents segments
    {
        segment: 'VoiceEventsByAgent.transferredInboundCalls',
        filters: [
            {
                member: 'VoiceEventsByAgent.transferredCalls',
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
        ],
    },
    {
        segment: 'VoiceEventsByAgent.declinedInboundCalls',
        filters: [
            {
                member: 'VoiceEventsByAgent.declinedCalls',
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
        ],
    },

    // VoiceCall.callsInFinalStatus has no additional filters in V2

    // HelpCenter segments
    {
        segment: 'HelpCenterTrackingEvent.searchRequestWithClicks',
        filters: [
            {
                member: 'HelpCenterTrackingEvent.isSearchRequestWithClick',
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
        ],
    },
    {
        segment: 'HelpCenterTrackingEvent.articleViewOnly',
        filters: [
            {
                member: 'HelpCenterTrackingEvent.eventType',
                operator: ReportingFilterOperator.Equals,
                values: ['page.viewed'],
            },
        ],
    },
    {
        segment: 'HelpCenterTrackingEvent.searchRequestedOnly',
        filters: [
            {
                member: 'HelpCenterTrackingEvent.eventType',
                operator: ReportingFilterOperator.Equals,
                values: ['search.requested'],
            },
        ],
    },
    {
        segment: 'HelpCenterTrackingEvent.searchResultClickedOnly',
        filters: [
            {
                member: 'HelpCenterTrackingEvent.eventType',
                operator: ReportingFilterOperator.Equals,
                values: ['search-result.clicked'],
            },
        ],
    },
    {
        segment: 'HelpCenterTrackingEvent.noSearchResultOnly',
        //`${CUBE}.event_type='search.requested' AND ${searchResultCount} = 0`,
        filters: [
            {
                member: 'HelpCenterTrackingEvent.eventType',
                operator: ReportingFilterOperator.Equals,
                values: ['search.requested'],
            },
            {
                member: 'HelpCenterTrackingEvent.searchResultCount',
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
        ],
    },
    {
        segment: 'CampaignEvents.campaignEventsOnly',
        filters: [
            {
                member: 'CampaignEvents.eventType',
                operator: ReportingFilterOperator.Equals,
                values: CAMPAIGN_EVENTS,
            },
        ],
    },
]

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

/**
 * Checks if all expected filters exist in the actual filters array
 */
const hasEquivalentFilters = (
    expectedFilters: ReportingFilter[],
    actualFilters: ReportingFilter[],
): boolean => {
    return expectedFilters.every(
        (expectedFilter) =>
            findMatchingFilter(expectedFilter, actualFilters) !== undefined,
    )
}

/**
 * Checks if a V2 filter comes from a V1 segment transformation
 */
const isFilterFromV1Segment = (
    filter: ReportingFilter,
    v1Segments: (string | undefined)[],
): boolean => {
    return SEGMENT_TO_FILTER_MAPPINGS.some(
        (mapping) =>
            v1Segments.includes(mapping.segment) &&
            findMatchingFilter(filter, mapping.filters) !== undefined,
    )
}

const membersToIgnore = [TicketMember.TotalCustomFieldIdsToMatch]

function compareFilters(
    v1Filters: ReportingFilter[],
    v2Filters: ReportingFilter[],
    v1Segments: (string | undefined)[],
    differences: string[],
) {
    let v1FiltersCount = v1Filters.length
    let v2FiltersCount = v2Filters.length

    for (const v1Filter of v1Filters) {
        if (!findMatchingFilter(v1Filter, v2Filters)) {
            differences.push(
                `V1 filter not found in V2: ${JSON.stringify(v1Filter)}`,
            )
        }
    }

    for (const v2Filter of v2Filters) {
        if (!findMatchingFilter(v2Filter, v1Filters)) {
            // Ignore filters for members that are known to be added in V2 only
            if (membersToIgnore.includes(v2Filter.member as TicketMember)) {
                v2FiltersCount--
                continue
            }
            // Check if this V2 filter comes from a V1 segment transformation
            if (!isFilterFromV1Segment(v2Filter, v1Segments)) {
                // Only report if it's truly a new filter, not from a segment
                differences.push(
                    `V2 filter not found in V1: ${JSON.stringify(v2Filter)}`,
                )
            } else {
                // Filter comes from a V1 segment, so we don't count it
                v2FiltersCount--
            }
        }
    }
    if (v1FiltersCount !== v2FiltersCount) {
        differences.push(
            `filters length: V1 ${v1FiltersCount} !== V2 ${v2FiltersCount}`,
        )
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
 * Compares V1 and V2 segments, accounting for segment-to-filter transformations.
 * V1 segments may be represented as filters in V2, so we check the mapping.
 */
function compareSegments(
    v1Segments: (string | undefined)[],
    v2Segments: (string | undefined)[],
    v2Filters: ReportingFilter[],
    differences: string[],
) {
    // Check V1 segments missing in V2
    for (const v1Segment of v1Segments) {
        if (!v1Segment) continue
        const isInV2Segments = v2Segments.includes(v1Segment)

        if (!isInV2Segments) {
            // Check if this segment has an equivalent filter mapping
            const mapping = SEGMENT_TO_FILTER_MAPPINGS.find(
                (m) => m.segment === v1Segment,
            )

            if (mapping && hasEquivalentFilters(mapping.filters, v2Filters)) {
                // Segment is represented as filters in V2 - this is OK
                continue
            }

            // No equivalent found - report difference
            differences.push(
                `V1 segment not found in V2 segments or filters: ${v1Segment}`,
            )
        }
    }

    // Check V2 segments missing in V1
    for (const v2Segment of v2Segments) {
        if (!v2Segment) continue
        if (!v1Segments.includes(v2Segment)) {
            differences.push(`V2 segment not found in V1: ${v2Segment}`)
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
    if (skipMetricComparison(metricName)) {
        return true
    }

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

        compareFilters(
            v1query.filters,
            v2query.filters,
            (v1query.segments || []) as (string | undefined)[],
            differences,
        )

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

        compareSegments(
            (v1query.segments || []) as string[],
            (v2query.segments || []) as string[],
            v2query.filters,
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
                v1query,
                v2query,
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
                        v1query: JSON.stringify(
                            v1query,
                            [
                                'measures',
                                'dimensions',
                                'timeDimensions',
                                'filters',
                                'segments',
                                'timezone',
                                'order',
                            ],
                            2,
                        ),
                        v2query: JSON.stringify(
                            v2query,
                            [
                                'measures',
                                'dimensions',
                                'timeDimensions',
                                'filters',
                                'segments',
                                'timezone',
                                'order',
                            ],
                            2,
                        ),
                    },
                },
                [`different_queries`, metricName],
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
