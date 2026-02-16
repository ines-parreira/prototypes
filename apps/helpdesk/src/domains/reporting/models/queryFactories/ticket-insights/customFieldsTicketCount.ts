import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { TICKET_FIELDS_LIST_LIMIT } from 'domains/reporting/hooks/voice-of-customer/constants'
import {
    BREAKDOWN_FIELD,
    VALUE_FIELD,
} from 'domains/reporting/hooks/withBreakdown'
import { TicketProductsEnrichedMember } from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import type { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import type { TicketCustomFieldsCube } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { TicketSatisfactionSurveyDimension } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { aiAgentTouchedTicketTotalCountQueryFactory } from 'domains/reporting/models/queryFactories/ai-agent-insights/metrics'
import {
    aiAgentTicketsDefaultFilters,
    aiAgentTicketsFromTicketCustomFieldsDefaultFilters,
} from 'domains/reporting/models/queryFactories/automate_v2/filters'
import { customerSatisfactionForAIAgentTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import {
    addFieldIdToCustomFieldValues,
    countUniquePrefixes,
    deduplicateCustomFields,
    injectCustomFieldId,
} from 'domains/reporting/models/queryFactories/utils'
import { PRODUCT_ID_DIMENSION } from 'domains/reporting/models/queryFactories/voice-of-customer/sentimentPerProduct'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type {
    ReportingFilter,
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

const createdTicketFilter = (filters: StatsFilters) => ({
    member: TicketMember.CreatedDatetime,
    operator: ReportingFilterOperator.InDateRange,
    values: [
        formatReportingQueryDate(filters.period.start_datetime),
        formatReportingQueryDate(filters.period.end_datetime),
    ],
})

export type CustomFieldsReportingQuery = Omit<
    ReportingQuery<TicketCustomFieldsCube>,
    'dimensions'
> & {
    dimensions: [typeof BREAKDOWN_FIELD]
}

// new-stats-api: covered by ticketFieldsCountPerFieldValueQueryV2Factory
export const customFieldsTicketCountQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    customFieldId: number,
    sorting?: OrderDirection,
    additionalFilters?: ReportingFilter[],
): CustomFieldsReportingQuery => ({
    metricName: METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT,
    measures: [VALUE_FIELD],
    dimensions: [BREAKDOWN_FIELD],
    timezone,
    segments: [],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
            operator: ReportingFilterOperator.Equals,
            values: [String(customFieldId)],
        },
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: [
                formatReportingQueryDate(filters.period.start_datetime),
                formatReportingQueryDate(filters.period.end_datetime),
            ],
        },
        ...(additionalFilters ? additionalFilters : []),
    ],
    ...(sorting
        ? {
              order: [
                  [
                      TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                      sorting,
                  ],
              ],
          }
        : {}),
})

// new-stats-api: covered by ticketFieldsCountPerFieldValueQueryV2Factory
export const customFieldsTicketCountWithSortQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    customFieldId: number,
    sortingDirection: OrderDirection,
    sortingValue:
        | TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
        | TicketCustomFieldsDimension.TicketCustomFieldsValue,
): CustomFieldsReportingQuery => {
    const { filters: baseQueryFilters, ...baseQuery } =
        customFieldsTicketCountQueryFactory(
            filters,
            timezone,
            customFieldId,
            sortingDirection,
        )
    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT_WITH_SORT,
        filters: [
            ...baseQueryFilters,
            {
                member: TicketProductsEnrichedMember.ProductId,
                operator: ReportingFilterOperator.Set,
                values: [],
            },
        ],
        order: [[sortingValue, sortingDirection]],
        limit: TICKET_FIELDS_LIST_LIMIT,
    }
}

// new-stats-api: covered by ticketFieldsCountPerFieldValueQueryV2Factory
export const customFieldsTicketCountOnCreatedDatetimeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    customFieldId: number,
    sorting?: OrderDirection,
): ReportingQuery<TicketCustomFieldsCube> => {
    const { filters: baseQueryFilters, ...baseQuery } =
        customFieldsTicketCountQueryFactory(
            filters,
            timezone,
            customFieldId,
            sorting,
        )

    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT_ON_CREATED_DATETIME,
        filters: [...baseQueryFilters, createdTicketFilter(filters)],
    }
}

// new-stats-api: covered by ticketFieldsCountPerFieldValueQueryV2Factory
export const customFieldsTicketCountForProductOnCreatedDatetimeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    customFieldId: number,
    productId: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCustomFieldsCube> => {
    const { filters: baseQueryFilters, ...baseQuery } =
        customFieldsTicketCountQueryFactory(
            filters,
            timezone,
            customFieldId,
            sorting,
        )

    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT_FOR_PRODUCT_ON_CREATED_DATETIME,
        filters: [
            ...baseQueryFilters,
            createdTicketFilter(filters),
            {
                member: PRODUCT_ID_DIMENSION,
                operator: ReportingFilterOperator.Equals,
                values: [productId],
            },
        ],
    }
}

// TODO(new-stats-api): see if this should be covered by a dedicated scope
// Right now, operator StartsWith is not supported in the new stats api
export const aiAgentTicketsPerIntentCountQueryFactory = ({
    filters,
    timezone,
    intentFieldId,
    sorting,
    intentId,
    ticketIds,
}: {
    filters: StatsFilters
    timezone: string
    intentFieldId: number
    sorting?: OrderDirection
    intentId?: string | null
    ticketIds?: string[] | null
}): ReportingQuery<TicketCustomFieldsCube> => {
    return {
        metricName:
            METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT_PER_INTENT_LEVEL,
        measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
        dimensions: [TicketCustomFieldsDimension.TicketCustomFieldsValueString],
        timezone,
        segments: [],
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters,
            ),
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [String(intentFieldId || -1)],
            },
            ...(ticketIds && ticketIds.length > 0
                ? [
                      {
                          member: TicketMember.TicketId,
                          operator: ReportingFilterOperator.In,
                          values: ticketIds,
                      },
                  ]
                : []),
            ...(intentId
                ? [
                      {
                          member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                          operator: ReportingFilterOperator.StartsWith,
                          values: [intentId],
                      },
                  ]
                : []),
        ],
        ...(sorting
            ? {
                  order: [
                      [
                          TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                          sorting,
                      ],
                  ],
              }
            : {}),
    }
}

// TODO(new-stats-api): see if this should be covered by a dedicated scope
// Right now, operator StartsWith is not supported in the new stats api
export const aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory = ({
    filters,
    timezone,
    intentFieldId,
    outcomeFieldId,
    sorting,
    intentId,
    integrationIds,
    outcomeValuesToExclude,
    outcomeValueToInclude,
}: {
    filters: StatsFilters
    timezone: string
    intentFieldId: number
    outcomeFieldId: number
    sorting?: OrderDirection
    intentId?: string | null
    integrationIds?: string[]
    outcomeValuesToExclude?: string[]
    outcomeValueToInclude?: string
}): ReportingQuery<TicketCustomFieldsCube> => {
    return {
        metricName:
            METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT_FROM_TICKET_PER_INTENT_LEVEL,
        measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
        dimensions: [TicketCustomFieldsDimension.TicketCustomFieldsValueString],
        timezone,
        segments: [],
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters,
            ),
            ...aiAgentTicketsFromTicketCustomFieldsDefaultFilters({
                filters,
                integrationIds,
                outcomeFieldId,
                outcomeValuesToExclude,
                outcomeValueToInclude,
            }),
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [String(intentFieldId || -1)],
            },
            ...(intentId
                ? [
                      {
                          member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                          operator: ReportingFilterOperator.StartsWith,
                          values: [intentId],
                      },
                  ]
                : []),
        ],
        ...(sorting
            ? {
                  order: [
                      [
                          TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                          sorting,
                      ],
                  ],
              }
            : {}),
    }
}

// TODO(new-stats-api): see if this should be covered by a dedicated scope
// TODO(new-stats-api): we must refactor frontend code to support enrichment
export const customFieldsTicketCountPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    customFieldId: number,
    customFieldsValueStrings: string[] | null,
    customFieldPeriod: StatsFilters['period'],
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const baseQuery = customFieldsTicketCountQueryFactory(
        injectCustomFieldId(filters, customFieldId, customFieldsValueStrings),
        timezone,
        customFieldId,
        sorting,
    )

    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT_PER_INTENT_LEVEL_PER_TICKET_DRILL_DOWN,
        measures: [],
        filters: [
            ...baseQuery.filters.filter(
                (filter) =>
                    filter.member !==
                    TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
            ),
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: [
                    formatReportingQueryDate(customFieldPeriod.start_datetime),
                    formatReportingQueryDate(customFieldPeriod.end_datetime),
                ],
            },
        ].reduce(deduplicateCustomFields, []),
        dimensions: [TicketDimension.TicketId],
        limit: DRILLDOWN_QUERY_LIMIT,
        order: [[TicketDimension.TicketId, sorting ?? OrderDirection.Asc]],
    }
}

// TODO(new-stats-api): see if this should be covered by a dedicated scope
// TODO(new-stats-api): we must refactor frontend code to support enrichment
export const customFieldsTicketCountOnCreatedDatetimePerTicketDrillDownQueryFactory =
    (
        filters: StatsFilters,
        timezone: string,
        customFieldId: number,
        customFieldsValueStrings: string[] | null,
        customFieldPeriod: StatsFilters['period'],
        sorting?: OrderDirection,
    ): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
        const { filters: baseQueryFilters, ...baseQuery } =
            customFieldsTicketCountPerTicketDrillDownQueryFactory(
                filters,
                timezone,
                customFieldId,
                customFieldsValueStrings,
                customFieldPeriod,
                sorting,
            )

        return {
            ...baseQuery,
            metricName:
                METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT_ON_CREATED_DATETIME_PER_TICKET_DRILL_DOWN,
            filters: [...baseQueryFilters, createdTicketFilter(filters)],
        }
    }

// TODO(new-stats-api): see if this should be covered by a dedicated scope
// TODO(new-stats-api): we must refactor frontend code to support enrichment
export const customFieldsTicketCountPerIntentLevelPerTicketDrillDownQueryFactory =
    (
        filters: StatsFilters,
        timezone: string,
        intentFieldId?: number,
        intentFieldValues?: string[] | null,
        outcomeFieldId?: number,
        sorting?: OrderDirection,
        integrationIds?: string[],
    ): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
        const customFieldsValuesToMatch =
            intentFieldId && intentFieldValues
                ? [
                      ...addFieldIdToCustomFieldValues(
                          intentFieldId,
                          intentFieldValues,
                      ),
                      `${outcomeFieldId}::`,
                  ]
                : [`${outcomeFieldId}::`]

        return {
            metricName:
                METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT_PER_INTENT_LEVEL_DRILL_DOWN,
            measures: [],
            dimensions: [TicketDimension.TicketId],
            timezone,
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    filters,
                ),
                ...(customFieldsValuesToMatch.length > 0
                    ? [
                          {
                              member: TicketMember.TotalCustomFieldIdsToMatch,
                              operator: ReportingFilterOperator.Equals,
                              values: [
                                  String(
                                      countUniquePrefixes(
                                          customFieldsValuesToMatch,
                                      ),
                                  ),
                              ],
                          },
                          {
                              member: TicketMember.CustomField,
                              operator: ReportingFilterOperator.StartsWith,
                              values: customFieldsValuesToMatch,
                          },
                      ]
                    : []),
                ...aiAgentTicketsDefaultFilters({
                    filters,
                    outcomeFieldId,
                    intentFieldId,
                    integrationIds,
                }),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[TicketDimension.TicketId, sorting ?? OrderDirection.Asc]],
        }
    }

// Coverage rate
// TODO(new-stats-api): see if this should be covered by a dedicated scope
// TODO(new-stats-api): we must refactor frontend code to support enrichment
export const coverageRateTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    customFieldId: number,
    intentFieldId: number,
    sorting?: OrderDirection,
    integrationIds?: string[],
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const baseQuery = aiAgentTouchedTicketTotalCountQueryFactory({
        filters,
        timezone,
        outcomeFieldId: customFieldId,
        intentFieldId: intentFieldId,
        sorting,
        integrationIds,
    })

    const queryFilters = baseQuery.filters.filter(
        (filter) =>
            filter.member !==
            TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
    )

    return {
        ...baseQuery,
        metricName: METRIC_NAMES.AI_AGENT_COVERAGE_RATE_TICKET_DRILL_DOWN,
        measures: [],
        filters: queryFilters,
        dimensions: [TicketDimension.TicketId],
        limit: DRILLDOWN_QUERY_LIMIT,
    }
}

// TODO(new-stats-api): see if this should be covered by a dedicated scope
// TODO(new-stats-api): we must refactor frontend code to support enrichment
export const aiInsightsCustomerSatisfactionMetricDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    perAgentId: number,
    intentFieldId?: number,
    outcomeFieldId?: number,
    sorting?: OrderDirection,
    integrationIds?: string[],
    intentIds?: string[] | null,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const baseQuery = customerSatisfactionForAIAgentTicketsQueryFactory({
        filters,
        timezone,
        sorting,
        intentFieldId: intentFieldId,
        outcomeFieldId: outcomeFieldId,
        aiAgentUserId: perAgentId,
        integrationIds,
        intentIds,
    })

    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT_DRILL_DOWN,
        measures: [],
        dimensions: [
            TicketDimension.TicketId,
            TicketSatisfactionSurveyDimension.SurveyScore,
            ...baseQuery.dimensions,
        ],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [
                      [TicketSatisfactionSurveyDimension.SurveyScore, sorting],
                  ],
              }
            : {}),
    }
}

export const customFieldsTicketCountTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    customFieldId: number,
    sorting?: OrderDirection,
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => ({
    ...customFieldsTicketCountQueryFactory(
        filters,
        timezone,
        customFieldId,
        sorting,
    ),
    metricName:
        METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT_TIME_SERIES,
    timeDimensions: [
        {
            dimension:
                TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
    timezone,
})

export const customFieldsTicketCountOnCreatedDatetimeTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    customFieldId: number,
    sorting?: OrderDirection,
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => {
    const baseQuery = customFieldsTicketCountTimeSeriesQueryFactory(
        filters,
        timezone,
        granularity,
        customFieldId,
        sorting,
    )

    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT_ON_CREATED_DATETIME_TIME_SERIES,
        filters: [...baseQuery.filters, createdTicketFilter(filters)],
    }
}
export const customFieldsTicketCountForProductOnCreatedDatetimeTimeSeriesQueryFactory =
    (
        filters: StatsFilters,
        timezone: string,
        granularity: ReportingGranularity,
        customFieldId: number,
        productId: string,
        sorting?: OrderDirection,
    ): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => {
        const baseQuery = customFieldsTicketCountTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
            customFieldId,
            sorting,
        )

        return {
            ...baseQuery,
            metricName:
                METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT_FOR_PRODUCT_ON_CREATED_DATETIME_TIME_SERIES,
            filters: [
                ...baseQuery.filters,
                createdTicketFilter(filters),
                {
                    member: PRODUCT_ID_DIMENSION,
                    operator: ReportingFilterOperator.Equals,
                    values: [productId],
                },
            ],
        }
    }

export const customFieldsTicketTotalCountQueryFactory = ({
    filters,
    timezone,
    customFieldId,
    additionalFilters,
    sorting,
}: {
    filters: StatsFilters
    timezone: string
    customFieldId: number
    additionalFilters?: ReportingFilter[]
    sorting?: OrderDirection
}): ReportingQuery<TicketCustomFieldsCube> => ({
    metricName: METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_TOTAL_COUNT,
    measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
    dimensions: [],
    timezone,
    segments: [],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
            operator: ReportingFilterOperator.Equals,
            values: [String(customFieldId)],
        },
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: [
                formatReportingQueryDate(filters.period.start_datetime),
                formatReportingQueryDate(filters.period.end_datetime),
            ],
        },
        ...(additionalFilters ?? []),
    ],
    ...(sorting
        ? {
              order: [
                  [
                      TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                      sorting,
                  ],
              ],
          }
        : {}),
})
