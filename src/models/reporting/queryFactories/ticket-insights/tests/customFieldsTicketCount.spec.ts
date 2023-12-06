import {OrderDirection} from 'models/api/types'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    customFieldsTicketCountPerTicketQueryFactory,
    customFieldsTicketCountQueryFactory,
} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

describe('customFieldsTicketCountQueryFactory', () => {
    const periodStart = '2021-05-29T00:00:00.000'
    const periodEnd = '2021-06-04T23:59:59.000'
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const customFieldId = '123'
    const timezone = 'UTC'
    const sorting = OrderDirection.Asc

    describe('customFieldsTicketCountQueryFactory', () => {
        it('should build expected query', () => {
            const query = customFieldsTicketCountQueryFactory(
                statsFilters,
                timezone,
                customFieldId
            )

            expect(query).toEqual({
                measures: [
                    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                ],
                dimensions: [
                    TicketCustomFieldsDimension.TicketCustomFieldsValueString,
                ],
                timezone,
                segments: [],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    ...statsFiltersToReportingFilters(
                        TicketStatsFiltersMembers,
                        statsFilters
                    ),
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                        operator: ReportingFilterOperator.Equals,
                        values: [customFieldId],
                    },
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [
                            formatReportingQueryDate(
                                statsFilters.period.start_datetime
                            ),
                            formatReportingQueryDate(
                                statsFilters.period.end_datetime
                            ),
                        ],
                    },
                ],
            })
        })

        it('should build the query qith sorting', () => {
            const query = customFieldsTicketCountQueryFactory(
                statsFilters,
                timezone,
                customFieldId,
                sorting
            )

            expect(query).toEqual({
                measures: [
                    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                ],
                dimensions: [
                    TicketCustomFieldsDimension.TicketCustomFieldsValueString,
                ],
                timezone,
                segments: [],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    ...statsFiltersToReportingFilters(
                        TicketStatsFiltersMembers,
                        statsFilters
                    ),
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                        operator: ReportingFilterOperator.Equals,
                        values: [customFieldId],
                    },
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [
                            formatReportingQueryDate(
                                statsFilters.period.start_datetime
                            ),
                            formatReportingQueryDate(
                                statsFilters.period.end_datetime
                            ),
                        ],
                    },
                ],
                order: [
                    [
                        TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                        sorting,
                    ],
                ],
            })
        })
    })

    describe('customFieldsTicketCountPerTicketQueryFactory', () => {
        it('should build expected query', () => {
            const query = customFieldsTicketCountPerTicketQueryFactory(
                statsFilters,
                timezone,
                customFieldId
            )

            expect(query).toEqual({
                ...customFieldsTicketCountQueryFactory(
                    statsFilters,
                    timezone,
                    customFieldId
                ),

                measures: [],
                dimensions: [TicketDimension.TicketId],
                filters: [
                    ...customFieldsTicketCountQueryFactory(
                        statsFilters,
                        timezone,
                        customFieldId
                    ).filters,
                    TicketDrillDownFilter,
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
            })
        })

        it('should build expected query with customFieldsValueStrings filter', () => {
            const customFieldsValueStrings = [
                'some::label',
                'some::other::label',
            ]
            const query = customFieldsTicketCountPerTicketQueryFactory(
                statsFilters,
                timezone,
                customFieldId,
                undefined,
                customFieldsValueStrings
            )

            expect(query).toEqual({
                ...customFieldsTicketCountQueryFactory(
                    statsFilters,
                    timezone,
                    customFieldId
                ),
                measures: [],
                dimensions: [TicketDimension.TicketId],
                filters: [
                    ...customFieldsTicketCountQueryFactory(
                        statsFilters,
                        timezone,
                        customFieldId
                    ).filters,
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                        operator: ReportingFilterOperator.In,
                        values: customFieldsValueStrings,
                    },
                    TicketDrillDownFilter,
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
            })
        })
    })
})
