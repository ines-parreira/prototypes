import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    formatReportingQueryDate,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const customFieldsTicketCountQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    customFieldId: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
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

export const customFieldsTicketCountTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    customFieldId: string,
    sorting?: OrderDirection
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => ({
    ...customFieldsTicketCountQueryFactory(
        filters,
        timezone,
        customFieldId,
        sorting
    ),
    timeDimensions: [
        {
            dimension:
                TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
            granularity,
            dateRange: getFilterDateRange(filters),
        },
    ],
    timezone,
})
