import { OrderDirection } from 'models/api/types'
import { HelpdeskMessageCubeWithJoins } from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsCube,
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import { TicketSatisfactionSurveyDimension } from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import { customerSatisfactionMetricPerAgentQueryFactory } from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {
    deduplicateCustomFields,
    injectDrillDownCustomFieldId,
} from 'models/reporting/queryFactories/utils'
import {
    ReportingFilter,
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const customFieldsTicketCountQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    customFieldId: string,
    sorting?: OrderDirection,
    additionalFilters?: ReportingFilter[],
): ReportingQuery<TicketCustomFieldsCube> => ({
    measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
    dimensions: [TicketCustomFieldsDimension.TicketCustomFieldsValueString],
    timezone,
    segments: [],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
            operator: ReportingFilterOperator.Equals,
            values: [customFieldId],
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

export const customFieldsTicketCountPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    customFieldId: string,
    customFieldsValueStrings: string[] | null,
    customFieldPeriod: StatsFilters['period'],
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const baseQuery = customFieldsTicketCountQueryFactory(
        injectDrillDownCustomFieldId(
            filters,
            Number(customFieldId),
            customFieldsValueStrings,
        ),
        timezone,
        customFieldId,
        sorting,
    )

    return {
        ...baseQuery,
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
            TicketDrillDownFilter,
        ].reduce(deduplicateCustomFields, []),
        dimensions: [TicketDimension.TicketId],
        limit: DRILLDOWN_QUERY_LIMIT,
        order: [[TicketDimension.TicketId, sorting ?? OrderDirection.Asc]],
    }
}

export const customFieldsTicketCountPerIntentLevelPerTicketDrillDownQueryFactory =
    (
        filters: StatsFilters,
        timezone: string,
        customFieldId: string,
        customFieldsValueStrings: string[] | null,
        customFieldPeriod: StatsFilters['period'],
        sorting?: OrderDirection,
    ): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
        return {
            measures: [],
            dimensions: [TicketDimension.TicketId],
            timezone,
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    filters,
                ),
                {
                    member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                    operator: ReportingFilterOperator.Equals,
                    values: [customFieldId],
                },
                ...(customFieldsValueStrings
                    ? [
                          {
                              member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                              operator: ReportingFilterOperator.StartsWith,
                              values: customFieldsValueStrings,
                          },
                      ]
                    : []),
                {
                    member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [
                        formatReportingQueryDate(
                            customFieldPeriod.start_datetime,
                        ),
                        formatReportingQueryDate(
                            customFieldPeriod.end_datetime,
                        ),
                    ],
                },
                TicketDrillDownFilter,
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[TicketDimension.TicketId, sorting ?? OrderDirection.Asc]],
        }
    }

// Coverage rate
export const coverageRateTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    customFieldId: string,
    customFieldsValueStrings: string[] | null,
    customFieldPeriod: StatsFilters['period'],
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const baseQuery = customFieldsTicketCountQueryFactory(
        filters,
        timezone,
        customFieldId,
        sorting,
    )

    const queryFilters = [
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
        TicketDrillDownFilter,
    ].reduce(deduplicateCustomFields, [])

    return {
        ...baseQuery,
        measures: [],
        filters: queryFilters,
        dimensions: [TicketDimension.TicketId],
        limit: DRILLDOWN_QUERY_LIMIT,
    }
}

export const aiInsightsCustomerSatisfactionMetricDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    perAgentId?: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const baseQuery = customerSatisfactionMetricPerAgentQueryFactory(
        filters,
        timezone,
        sorting,
    )

    return {
        ...baseQuery,
        measures: [],
        dimensions: [
            TicketDimension.TicketId,
            TicketSatisfactionSurveyDimension.SurveyScore,
            ...baseQuery.dimensions,
        ],
        filters: [
            ...baseQuery.filters,
            TicketDrillDownFilter,
            ...(perAgentId
                ? [
                      {
                          member: TicketMember.AssigneeUserId,
                          operator: ReportingFilterOperator.Equals,
                          values: [String(perAgentId)],
                      },
                  ]
                : []),
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
    customFieldId: string,
    sorting?: OrderDirection,
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => ({
    ...customFieldsTicketCountQueryFactory(
        filters,
        timezone,
        customFieldId,
        sorting,
    ),
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

export const customFieldsTicketTotalCountQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    customFieldId: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCustomFieldsCube> => ({
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
            values: [customFieldId],
        },
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: [
                formatReportingQueryDate(filters.period.start_datetime),
                formatReportingQueryDate(filters.period.end_datetime),
            ],
        },
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

export const customFieldsTicketFactory = (
    filters: StatsFilters,
    timezone: string,
    customFieldId: string,
    additionalFilter?: ReportingFilter,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
    dimensions: [TicketDimension.TicketId],
    timezone,
    segments: [],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
            operator: ReportingFilterOperator.Equals,
            values: [customFieldId],
        },
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: [
                formatReportingQueryDate(filters.period.start_datetime),
                formatReportingQueryDate(filters.period.end_datetime),
            ],
        },
        ...(additionalFilter ? [additionalFilter] : []),
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
