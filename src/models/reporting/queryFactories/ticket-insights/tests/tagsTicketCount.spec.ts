import { OrderDirection } from 'models/api/types'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import {
    TicketTagsEnrichedDimension,
    TicketTagsEnrichedMeasure,
} from 'models/reporting/cubes/TicketTagsEnrichedCube'
import { coverageRateTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {
    tagsTicketCountDrillDownQueryFactory,
    tagsTicketCountQueryFactory,
    tagsTicketCountTimeSeriesFactory,
} from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

describe('tagsTicketCount query factories', () => {
    const periodStart = '2021-05-29T00:00:00.000'
    const periodEnd = '2021-06-04T23:59:59.000'
    const statsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const granularity = ReportingGranularity.Day
    const tagId = '123'
    const timezone = 'UTC'
    const sorting = OrderDirection.Asc
    const customFieldId = 1
    const intentFieldId = 2

    describe('tagsTicketCountQueryFactory', () => {
        it('should build a query', () => {
            const query = tagsTicketCountQueryFactory(statsFilters, timezone)

            expect(query).toEqual({
                measures: [TicketTagsEnrichedMeasure.TicketCount],
                dimensions: [TicketTagsEnrichedDimension.TagId],
                timezone,
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    ...statsFiltersToReportingFilters(
                        TicketStatsFiltersMembers,
                        statsFilters,
                    ),
                ],
                segments: [],
            })
        })

        it('should build a query with sorting', () => {
            const query = tagsTicketCountQueryFactory(
                statsFilters,
                timezone,
                sorting,
            )

            expect(query).toEqual({
                measures: [TicketTagsEnrichedMeasure.TicketCount],
                dimensions: [TicketTagsEnrichedDimension.TagId],
                timezone,
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    ...statsFiltersToReportingFilters(
                        TicketStatsFiltersMembers,
                        statsFilters,
                    ),
                ],
                order: [[TicketTagsEnrichedMeasure.TicketCount, sorting]],
                segments: [],
            })
        })
    })

    describe('tagsTicketCountTimeSeriesFactory', () => {
        it('should build a query with Time dimensions', () => {
            const query = tagsTicketCountTimeSeriesFactory(
                statsFilters,
                timezone,
                granularity,
                sorting,
            )

            expect(query).toEqual({
                ...tagsTicketCountQueryFactory(statsFilters, timezone, sorting),
                timeDimensions: [
                    {
                        dimension: TicketTagsEnrichedDimension.Timestamp,
                        granularity,
                        dateRange: getFilterDateRange(statsFilters.period),
                    },
                ],
            })
        })
    })

    describe('tagsTicketCountTimeSeriesFactory', () => {
        it('should build a query with tagId and Tagging timestamp', () => {
            const periodStart = '2021-05-30T00:00:00.000'
            const periodEnd = '2021-05-30T23:59:59.000'
            const tagNarrowedPeriod = {
                start_datetime: periodStart,
                end_datetime: periodEnd,
            }

            const query = tagsTicketCountDrillDownQueryFactory(
                statsFilters,
                timezone,
                tagId,
                tagNarrowedPeriod,
                sorting,
            )

            expect(query).toEqual({
                ...tagsTicketCountQueryFactory(statsFilters, timezone, sorting),
                dimensions: [TicketDimension.TicketId],
                filters: [
                    ...tagsTicketCountQueryFactory(
                        statsFilters,
                        timezone,
                        sorting,
                    ).filters,
                    {
                        member: TicketTagsEnrichedDimension.TagId,
                        operator: ReportingFilterOperator.Equals,
                        values: [tagId],
                    },
                    {
                        member: TicketTagsEnrichedDimension.Timestamp,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [
                            formatReportingQueryDate(
                                tagNarrowedPeriod.start_datetime,
                            ),
                            formatReportingQueryDate(
                                tagNarrowedPeriod.end_datetime,
                            ),
                        ],
                    },
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
            })
        })

        it('should build a query with tagId and Tagging timestamp and tag filters', () => {
            const periodStart = '2021-05-30T00:00:00.000'
            const periodEnd = '2021-05-30T23:59:59.000'
            const tagNarrowedPeriod = {
                start_datetime: periodStart,
                end_datetime: periodEnd,
            }
            const filters: StatsFilters = {
                ...statsFilters,
                tags: [
                    {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [1, 2],
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                    {
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                        values: [4, 5],
                        filterInstanceId: TagFilterInstanceId.Second,
                    },
                ],
            }

            const query = tagsTicketCountDrillDownQueryFactory(
                filters,
                timezone,
                tagId,
                tagNarrowedPeriod,
                sorting,
            )

            expect(query).toEqual({
                ...tagsTicketCountQueryFactory(filters, timezone, sorting),
                dimensions: [TicketDimension.TicketId],
                filters: [
                    ...tagsTicketCountQueryFactory(filters, timezone, sorting)
                        .filters,
                    {
                        member: TicketTagsEnrichedDimension.TagId,
                        operator: ReportingFilterOperator.Equals,
                        values: [tagId],
                    },
                    {
                        member: TicketTagsEnrichedDimension.Timestamp,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [
                            formatReportingQueryDate(
                                tagNarrowedPeriod.start_datetime,
                            ),
                            formatReportingQueryDate(
                                tagNarrowedPeriod.end_datetime,
                            ),
                        ],
                    },
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
            })
        })
    })

    describe('coverageRateTicketDrillDownQueryFactory', () => {
        it('should return a query with the correct base query structure for coverageRateTicketDrillDownQueryFactory', () => {
            const customFieldPeriod = {
                start_datetime: periodStart,
                end_datetime: periodEnd,
            }

            const query = coverageRateTicketDrillDownQueryFactory(
                statsFilters,
                timezone,
                customFieldId,
                intentFieldId,
                customFieldPeriod,
                sorting,
            )

            expect(query.filters).toEqual([
                {
                    member: 'TicketEnriched.isTrashed',
                    operator: 'equals',
                    values: ['0'],
                },
                {
                    member: 'TicketEnriched.isSpam',
                    operator: 'equals',
                    values: ['0'],
                },
                {
                    member: 'TicketEnriched.periodStart',
                    operator: 'afterDate',
                    values: ['2021-05-29T00:00:00.000'],
                },
                {
                    member: 'TicketEnriched.periodEnd',
                    operator: 'beforeDate',
                    values: ['2021-06-04T23:59:59.000'],
                },
                {
                    member: 'TicketEnriched.totalCustomFieldIdsToMatch',
                    operator: 'equals',
                    values: ['2'],
                },
                {
                    member: 'TicketEnriched.customField',
                    operator: 'startsWith',
                    values: ['2::', '1::'],
                },
                {
                    member: 'TicketEnriched.customFieldToExclude',
                    operator: 'notStartsWith',
                    values: ['2::Other::No Reply'],
                },
                {
                    member: 'TicketCustomFieldsEnriched.customFieldUpdatedDatetime',
                    operator: 'inDateRange',
                    values: [
                        '2021-05-29T00:00:00.000',
                        '2021-06-04T23:59:59.000',
                    ],
                },
                {
                    member: 'TicketEnriched.ticketCount',
                    operator: 'measureFilter',
                    values: [],
                },
            ])
        })
    })
})
