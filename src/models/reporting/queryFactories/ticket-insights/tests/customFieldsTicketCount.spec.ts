import {OrderDirection} from 'models/api/types'
import {TicketDimension, TicketMember} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    customFieldsTicketCountPerTicketDrillDownQueryFactory,
    customFieldsTicketCountQueryFactory,
} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {getCustomFieldValueSerializer} from 'models/reporting/queryFactories/utils'
import {ReportingFilterOperator} from 'models/reporting/types'
import {FilterKey} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
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
    const statsFilters = {
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

    describe('customFieldsTicketCountPerTicketDrillDownQueryFactory', () => {
        it('should build expected query', () => {
            const query = customFieldsTicketCountPerTicketDrillDownQueryFactory(
                statsFilters,
                timezone,
                customFieldId,
                null,
                statsFilters.period
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
            const query = customFieldsTicketCountPerTicketDrillDownQueryFactory(
                statsFilters,
                timezone,
                customFieldId,
                customFieldsValueStrings,
                statsFilters.period
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
                        member: TicketMember.CustomField,
                        operator: ReportingFilterOperator.Equals,
                        values: customFieldsValueStrings.map(
                            getCustomFieldValueSerializer(Number(customFieldId))
                        ),
                    },
                    TicketDrillDownFilter,
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
            })
        })

        it('should merge custom field filters per member on one-of operator', () => {
            const someId = 5
            const includedCustomFields = [
                `${someId}::Some::Value`,
                `${someId}::Some::OtherValue`,
            ]
            const oneMoreId = 10
            const moreIncludedCustomFields = [
                `${oneMoreId}::More::Value`,
                `${oneMoreId}::More::OtherValue`,
            ]
            const anotherId = 17
            const excludedCustomFields = [
                `${anotherId}::Different::Value`,
                `${anotherId}::Different::SampleValue`,
            ]
            const customFieldsValueStrings = [
                'some::label',
                'some::other::label',
            ]
            const filtersWithCustomFields = {
                ...statsFilters,
                [FilterKey.CustomFields]: [
                    {
                        customFieldId: someId,
                        member: TicketMember.CustomField,
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: includedCustomFields,
                    },
                    {
                        customFieldId: oneMoreId,
                        member: TicketMember.CustomField,
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: moreIncludedCustomFields,
                    },
                    {
                        customFieldId: anotherId,
                        member: TicketMember.CustomField,
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                        values: excludedCustomFields,
                    },
                ],
            }
            const query = customFieldsTicketCountPerTicketDrillDownQueryFactory(
                filtersWithCustomFields,
                timezone,
                customFieldId,
                customFieldsValueStrings,
                statsFilters.period
            )

            expect(query.filters).toContainEqual(
                expect.objectContaining({
                    member: TicketMember.CustomField,
                    operator: ReportingFilterOperator.Equals,
                    values: expect.arrayContaining([
                        ...customFieldsValueStrings.map(
                            (v) => `${customFieldId}::${v}`
                        ),
                        ...includedCustomFields,
                        ...moreIncludedCustomFields,
                    ]),
                })
            )

            expect(query.filters).toContainEqual(
                expect.objectContaining({
                    member: TicketMember.CustomFieldToExclude,
                    operator: ReportingFilterOperator.NotEquals,
                    values: expect.arrayContaining(excludedCustomFields),
                })
            )
        })
    })
})
