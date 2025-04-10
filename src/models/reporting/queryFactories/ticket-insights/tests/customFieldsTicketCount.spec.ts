import { OrderDirection } from 'models/api/types'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import { TicketMessagesMember } from 'models/reporting/cubes/TicketMessagesCube'
import {
    aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory,
    aiInsightsCustomerSatisfactionMetricDrillDownQueryFactory,
    customFieldsTicketCountOnCreatedDatetimePerTicketDrillDownQueryFactory,
    customFieldsTicketCountOnCreatedDatetimeQueryFactory,
    customFieldsTicketCountOnCreatedDatetimeTimeSeriesQueryFactory,
    customFieldsTicketCountPerIntentLevelPerTicketDrillDownQueryFactory,
    customFieldsTicketCountPerTicketDrillDownQueryFactory,
    customFieldsTicketCountQueryFactory,
    customFieldsTicketTotalCountQueryFactory,
} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import { injectDrillDownCustomFieldId } from 'models/reporting/queryFactories/utils'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import { FilterKey, StatsFilters } from 'models/stat/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

import { aiAgentTicketsFromTicketCustomFieldsDefaultFilters } from '../../automate_v2/filters'

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
    const perAgentId = '1'
    const mockIntentFieldId = 123
    const mockOutcomeFieldId = 456
    const granularity = ReportingGranularity.Day
    const mockIntegrationIds = ['chat::1']
    const mockIntentIds = ['order::other']

    describe('customFieldsTicketCountQueryFactory', () => {
        it('should build expected query', () => {
            const query = customFieldsTicketCountQueryFactory(
                statsFilters,
                timezone,
                customFieldId,
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
                        statsFilters,
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
                                statsFilters.period.start_datetime,
                            ),
                            formatReportingQueryDate(
                                statsFilters.period.end_datetime,
                            ),
                        ],
                    },
                ],
            })
        })

        it('should build the query with sorting', () => {
            const query = customFieldsTicketCountQueryFactory(
                statsFilters,
                timezone,
                customFieldId,
                sorting,
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
                        statsFilters,
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
                                statsFilters.period.start_datetime,
                            ),
                            formatReportingQueryDate(
                                statsFilters.period.end_datetime,
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

    describe('customFieldsTicketCountOnCreatedDatetimeQueryFactory', () => {
        it('should build expected query', () => {
            const actual = customFieldsTicketCountOnCreatedDatetimeQueryFactory(
                statsFilters,
                timezone,
                customFieldId,
            )

            const expected = {
                measures: [
                    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                ],
                dimensions: [
                    TicketCustomFieldsDimension.TicketCustomFieldsValueString,
                ],
                timezone,
                segments: [],
                filters: [
                    {
                        member: TicketMember.IsTrashed,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.IsSpam,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: TicketMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                        operator: ReportingFilterOperator.Equals,
                        values: [customFieldId],
                    },
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [periodStart, periodEnd],
                    },
                    {
                        member: TicketMember.CreatedDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [periodStart, periodEnd],
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('customFieldsTicketCountOnCreatedDatetimeTimeSeriesQueryFactory', () => {
        it('should build expected query', () => {
            const actual =
                customFieldsTicketCountOnCreatedDatetimeTimeSeriesQueryFactory(
                    statsFilters,
                    timezone,
                    granularity,
                    customFieldId,
                )

            const expected = {
                measures: [
                    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                ],
                dimensions: [
                    TicketCustomFieldsDimension.TicketCustomFieldsValueString,
                ],
                timezone,
                segments: [],
                filters: [
                    {
                        member: TicketMember.IsTrashed,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.IsSpam,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: TicketMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                        operator: ReportingFilterOperator.Equals,
                        values: [customFieldId],
                    },
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [periodStart, periodEnd],
                    },
                    {
                        member: TicketMember.CreatedDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [periodStart, periodEnd],
                    },
                ],
                timeDimensions: [
                    {
                        dimension:
                            TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                        granularity,
                        dateRange: [periodStart, periodEnd],
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('customFieldsTicketCountPerTicketDrillDownQueryFactory', () => {
        it('should build expected query', () => {
            const query = customFieldsTicketCountPerTicketDrillDownQueryFactory(
                statsFilters,
                timezone,
                customFieldId,
                null,
                statsFilters.period,
            )

            expect(query).toEqual({
                ...customFieldsTicketCountQueryFactory(
                    statsFilters,
                    timezone,
                    customFieldId,
                ),

                measures: [],
                dimensions: [TicketDimension.TicketId],
                filters: [
                    ...customFieldsTicketCountQueryFactory(
                        statsFilters,
                        timezone,
                        customFieldId,
                    ).filters,
                    TicketDrillDownFilter,
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                order: [[TicketDimension.TicketId, OrderDirection.Asc]],
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
                statsFilters.period,
            )
            const filtersWithDrillDownCustomField =
                injectDrillDownCustomFieldId(
                    statsFilters,
                    Number(customFieldId),
                    customFieldsValueStrings,
                )

            expect(query).toEqual({
                ...customFieldsTicketCountQueryFactory(
                    filtersWithDrillDownCustomField,
                    timezone,
                    customFieldId,
                ),
                measures: [],
                dimensions: [TicketDimension.TicketId],
                filters: [
                    ...customFieldsTicketCountQueryFactory(
                        filtersWithDrillDownCustomField,
                        timezone,
                        customFieldId,
                    ).filters,
                    TicketDrillDownFilter,
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                order: [[TicketDimension.TicketId, OrderDirection.Asc]],
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
                statsFilters.period,
            )

            expect(query.filters).toContainEqual(
                expect.objectContaining({
                    member: TicketMember.CustomField,
                    operator: ReportingFilterOperator.Equals,
                    values: expect.arrayContaining([
                        ...customFieldsValueStrings.map(
                            (v) => `${customFieldId}::${v}`,
                        ),
                        ...includedCustomFields,
                        ...moreIncludedCustomFields,
                    ]),
                }),
            )

            expect(query.filters).toContainEqual(
                expect.objectContaining({
                    member: TicketMember.CustomFieldToExclude,
                    operator: ReportingFilterOperator.NotEquals,
                    values: expect.arrayContaining(excludedCustomFields),
                }),
            )
        })

        it('should replace a custom field filter values with a drill down value', () => {
            const sameId = Number(customFieldId)
            const uiFilterCustomFields = [
                `${sameId}::Some::Value`,
                `${sameId}::Some::OtherValue`,
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
                        customFieldId: sameId,
                        member: TicketMember.CustomField,
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: uiFilterCustomFields,
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
            expect(String(sameId)).toEqual(customFieldId)
            const query = customFieldsTicketCountPerTicketDrillDownQueryFactory(
                filtersWithCustomFields,
                timezone,
                customFieldId,
                customFieldsValueStrings,
                statsFilters.period,
            )

            expect(query.filters).toContainEqual(
                expect.objectContaining({
                    member: TicketMember.CustomField,
                    operator: ReportingFilterOperator.Equals,
                    values: expect.arrayContaining([
                        ...customFieldsValueStrings.map(
                            (v) => `${customFieldId}::${v}`,
                        ),
                        ...moreIncludedCustomFields,
                    ]),
                }),
            )
            expect(query.filters).toContainEqual(
                expect.objectContaining({
                    member: TicketMember.CustomField,
                    operator: ReportingFilterOperator.Equals,
                    values: expect.not.arrayContaining([
                        ...uiFilterCustomFields,
                    ]),
                }),
            )

            expect(query.filters).toContainEqual(
                expect.objectContaining({
                    member: TicketMember.CustomFieldToExclude,
                    operator: ReportingFilterOperator.NotEquals,
                    values: expect.arrayContaining(excludedCustomFields),
                }),
            )
        })
    })

    describe('customFieldsTicketCountOnCreatedDatetimePerTicketDrillDownQueryFactory', () => {
        it('should build expected query', () => {
            const actual =
                customFieldsTicketCountOnCreatedDatetimePerTicketDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    customFieldId,
                    null,
                    statsFilters.period,
                )

            const expected = {
                measures: [],
                dimensions: [TicketDimension.TicketId],
                timezone,
                segments: [],
                limit: DRILLDOWN_QUERY_LIMIT,
                order: [[TicketDimension.TicketId, OrderDirection.Asc]],
                filters: [
                    {
                        member: TicketMember.IsTrashed,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.IsSpam,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: TicketMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                        operator: ReportingFilterOperator.Equals,
                        values: [customFieldId],
                    },
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [periodStart, periodEnd],
                    },
                    {
                        member: TicketMeasure.TicketCount,
                        operator: ReportingFilterOperator.MeasureFilter,
                        values: [],
                    },
                    {
                        member: TicketMember.CreatedDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [periodStart, periodEnd],
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('customFieldsTicketTotalCountQueryFactory', () => {
        it('should build expected query', () => {
            const query = customFieldsTicketTotalCountQueryFactory({
                filters: statsFilters,
                timezone,
                customFieldId,
            })

            expect(query).toEqual({
                measures: [
                    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                ],
                dimensions: [],
                timezone,
                segments: [],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    ...statsFiltersToReportingFilters(
                        TicketStatsFiltersMembers,
                        statsFilters,
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
                                statsFilters.period.start_datetime,
                            ),
                            formatReportingQueryDate(
                                statsFilters.period.end_datetime,
                            ),
                        ],
                    },
                ],
            })
        })

        it('should build the query with sorting', () => {
            const query = customFieldsTicketTotalCountQueryFactory({
                filters: statsFilters,
                timezone,
                customFieldId,
                sorting,
            })

            expect(query).toEqual({
                measures: [
                    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                ],
                dimensions: [],
                timezone,
                segments: [],
                filters: [
                    ...NotSpamNorTrashedTicketsFilter,
                    ...statsFiltersToReportingFilters(
                        TicketStatsFiltersMembers,
                        statsFilters,
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
                                statsFilters.period.start_datetime,
                            ),
                            formatReportingQueryDate(
                                statsFilters.period.end_datetime,
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

    describe('customFieldsTicketCountPerIntentLevelPerTicketDrillDownQueryFactory', () => {
        const mockFilters: StatsFilters = {
            period: {
                start_datetime: '2023-01-01T00:00:00Z',
                end_datetime: '2023-01-31T23:59:59Z',
            },
        }

        const mockTimezone = 'UTC'

        const mockIntentFieldsValueStrings = ['value1', 'value2']
        const mockSorting = OrderDirection.Desc

        test('returns correct query structure with all parameters', () => {
            const query =
                customFieldsTicketCountPerIntentLevelPerTicketDrillDownQueryFactory(
                    mockFilters,
                    mockTimezone,
                    mockIntentFieldId,
                    mockIntentFieldsValueStrings,
                    mockOutcomeFieldId,
                    mockSorting,
                )

            expect(query).toEqual({
                measures: [],
                dimensions: [TicketDimension.TicketId],
                timezone: mockTimezone,
                filters: [
                    {
                        member: TicketMember.IsTrashed,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.IsSpam,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: ['2023-01-01T00:00:00.000'],
                    },
                    {
                        member: TicketMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: ['2023-01-31T23:59:59.000'],
                    },
                    {
                        member: TicketMember.TotalCustomFieldIdsToMatch,
                        operator: ReportingFilterOperator.Equals,
                        values: ['2'],
                    },
                    {
                        member: TicketMember.CustomField,
                        operator: ReportingFilterOperator.StartsWith,
                        values: [
                            `${mockIntentFieldId}::${mockIntentFieldsValueStrings[0]}`,
                            `${mockIntentFieldId}::${mockIntentFieldsValueStrings[1]}`,
                            `${mockOutcomeFieldId}::`,
                        ],
                    },
                    {
                        member: TicketMember.CreatedDatetime,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [
                            '2023-01-01T00:00:00.000',
                            '2023-01-31T23:59:59.000',
                        ],
                    },
                    {
                        member: TicketMember.CustomFieldToExclude,
                        operator: ReportingFilterOperator.NotStartsWith,
                        values: ['123::Other::No Reply'],
                    },
                    {
                        member: TicketMember.CustomField,
                        operator: ReportingFilterOperator.NotStartsWith,
                        values: ['456::Close::Without message'],
                    },
                    {
                        member: TicketMessagesMember.IntegrationChannelPair,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: 'TicketEnriched.ticketCount',
                        operator: 'measureFilter',
                        values: [],
                    },
                ],
                limit: DRILLDOWN_QUERY_LIMIT,
                order: [[TicketDimension.TicketId, mockSorting]],
            })
        })

        test('handles null customFieldsValueStrings', () => {
            const query =
                customFieldsTicketCountPerIntentLevelPerTicketDrillDownQueryFactory(
                    mockFilters,
                    mockTimezone,
                    mockIntentFieldId,
                    null,
                    mockOutcomeFieldId,
                    mockSorting,
                )

            const filtersWithoutCustomFieldValueStrings = query.filters.filter(
                (filter) =>
                    filter.member !==
                    'TicketCustomFieldsMember.TicketCustomFieldsValueString',
            )

            expect(filtersWithoutCustomFieldValueStrings).toHaveLength(
                query.filters.length,
            )
        })

        test('applies default sorting when none is provided', () => {
            const query =
                customFieldsTicketCountPerIntentLevelPerTicketDrillDownQueryFactory(
                    mockFilters,
                    mockTimezone,
                    mockIntentFieldId,
                    mockIntentFieldsValueStrings,
                    mockOutcomeFieldId,
                )

            expect(query.order).toEqual([
                ['TicketEnriched.ticketId', OrderDirection.Asc],
            ])
        })
    })

    describe('aiInsightsCustomerSatisfactionMetricDrillDownQueryFactory', () => {
        it('should return a query with the correct base query structure for aiInsightsCustomerSatisfactionMetricDrillDownQueryFactory', () => {
            const query =
                aiInsightsCustomerSatisfactionMetricDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    perAgentId,
                    mockIntentFieldId,
                    mockOutcomeFieldId,
                    sorting,
                )

            expect(query.filters).toEqual([
                {
                    member: TicketMember.IsTrashed,
                    operator: ReportingFilterOperator.Equals,
                    values: ['0'],
                },
                {
                    member: TicketMember.IsSpam,
                    operator: ReportingFilterOperator.Equals,
                    values: ['0'],
                },
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: ['2021-05-29T00:00:00.000'],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: ['2021-06-04T23:59:59.000'],
                },
                {
                    member: TicketMember.AssigneeUserId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: TicketMember.CustomField,
                    operator: ReportingFilterOperator.StartsWith,
                    values: ['123::'],
                },
                {
                    member: TicketMember.CreatedDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [
                        '2021-05-29T00:00:00.000',
                        '2021-06-04T23:59:59.000',
                    ],
                },
                {
                    member: TicketMember.CustomFieldToExclude,
                    operator: ReportingFilterOperator.NotStartsWith,
                    values: ['123::Other::No Reply'],
                },
                {
                    member: TicketMember.CustomField,
                    operator: ReportingFilterOperator.NotStartsWith,
                    values: ['456::Close::Without message'],
                },
                {
                    member: TicketMessagesMember.IntegrationChannelPair,
                    operator: ReportingFilterOperator.Equals,
                    values: ['0'],
                },
                {
                    member: 'TicketEnriched.ticketCount',
                    operator: 'measureFilter',
                    values: [],
                },
            ])
        })

        it('should return a query with the correct base query structure for aiInsightsCustomerSatisfactionMetricDrillDownQueryFactory for single intent', () => {
            const query =
                aiInsightsCustomerSatisfactionMetricDrillDownQueryFactory(
                    statsFilters,
                    timezone,
                    perAgentId,
                    mockIntentFieldId,
                    mockOutcomeFieldId,
                    sorting,
                    mockIntegrationIds,
                    mockIntentIds,
                )
            expect(query.filters).toEqual([
                {
                    member: TicketMember.IsTrashed,
                    operator: ReportingFilterOperator.Equals,
                    values: ['0'],
                },
                {
                    member: TicketMember.IsSpam,
                    operator: ReportingFilterOperator.Equals,
                    values: ['0'],
                },
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: ['2021-05-29T00:00:00.000'],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: ['2021-06-04T23:59:59.000'],
                },
                {
                    member: TicketMember.AssigneeUserId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: TicketMember.CustomField,
                    operator: ReportingFilterOperator.StartsWith,
                    values: [`${mockIntentFieldId}::${mockIntentIds[0]}`],
                },
                {
                    member: TicketMember.CreatedDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [
                        '2021-05-29T00:00:00.000',
                        '2021-06-04T23:59:59.000',
                    ],
                },
                {
                    member: TicketMember.CustomFieldToExclude,
                    operator: ReportingFilterOperator.NotStartsWith,
                    values: ['123::Other::No Reply'],
                },
                {
                    member: TicketMember.CustomField,
                    operator: ReportingFilterOperator.NotStartsWith,
                    values: ['456::Close::Without message'],
                },
                {
                    member: TicketMessagesMember.IntegrationChannelPair,
                    operator: ReportingFilterOperator.Equals,
                    values: mockIntegrationIds,
                },
                {
                    member: 'TicketEnriched.ticketCount',
                    operator: 'measureFilter',
                    values: [],
                },
            ])
        })
    })

    describe('aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory', () => {
        const filters = {
            period: {
                start_datetime: '2023-01-01T00:00:00Z',
                end_datetime: '2023-01-31T23:59:59Z',
            },
        }
        const timezone = 'UTC'
        const intentFieldId = 123
        const outcomeFieldId = 456
        const sorting = OrderDirection.Asc
        const intentId = 'intent123'
        const integrationIds = ['integration1', 'integration2']
        const outcomeValuesToExclude = ['value1', 'value2']
        const outcomeValueToInclude = 'value3'

        it('should build the query with all parameters', () => {
            const query =
                aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory({
                    filters,
                    timezone,
                    intentFieldId,
                    outcomeFieldId,
                    sorting,
                    intentId,
                    integrationIds,
                    outcomeValuesToExclude,
                    outcomeValueToInclude,
                })

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
                        values: [String(intentFieldId)],
                    },
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                        operator: ReportingFilterOperator.StartsWith,
                        values: [intentId],
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

        it('should handle missing optional parameters', () => {
            const query =
                aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory({
                    filters,
                    timezone,
                    intentFieldId,
                    outcomeFieldId,
                })

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
                        filters,
                    ),
                    ...aiAgentTicketsFromTicketCustomFieldsDefaultFilters({
                        filters,
                        outcomeFieldId,
                    }),
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                        operator: ReportingFilterOperator.Equals,
                        values: [String(intentFieldId)],
                    },
                ],
            })
        })

        it('should handle empty integrationIds and outcomeValuesToExclude', () => {
            const query =
                aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory({
                    filters,
                    timezone,
                    intentFieldId,
                    outcomeFieldId,
                    integrationIds: [],
                    outcomeValuesToExclude: [],
                })

            expect(query.filters).not.toContainEqual(
                expect.objectContaining({
                    member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                    operator: ReportingFilterOperator.StartsWith,
                }),
            )
        })
    })
})
