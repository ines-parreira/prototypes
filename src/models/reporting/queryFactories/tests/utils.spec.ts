import {HelpdeskMessageMember} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {
    addOptionalFilter,
    FilterOperatorMap,
    getCustomFieldValueSerializer,
    hasFilter,
    injectDrillDownCustomFieldId,
    isAggregationWindowFilter,
    isCustomFieldFilter,
    isPeriodFilter,
    toLowerCaseString,
    withDefaultLogicalOperator,
} from 'models/reporting/queryFactories/utils'
import {
    ReportingFilter,
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import {
    CustomFieldFilter,
    FilterKey,
    TagFilter,
    TagFilterInstanceId,
} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

describe('utils', () => {
    describe('addOptionalFilter', () => {
        it.each([[[123, 456]], [['asd', 'qwe']]])(
            'should add Legacy filter with default values',
            (filter) => {
                const filters: ReportingFilter[] = []
                const filterDefaults = {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                }

                const updatedFilters = addOptionalFilter(
                    filters,
                    filter,
                    filterDefaults
                )

                expect(updatedFilters).toContainEqual({
                    member: filterDefaults.member,
                    operator: filterDefaults.operator,
                    values: filter.map(toLowerCaseString),
                })
            }
        )

        it.each([
            [{values: [123, 456], operator: LogicalOperatorEnum.ONE_OF}],
            [
                {
                    values: ['asd', 'qwe'],
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                },
            ],
        ])('should add the filter with logical operators', (filter) => {
            const filters: ReportingFilter[] = []
            const filterDefaults = {
                member: TicketMember.Channel,
                operator: ReportingFilterOperator.Equals,
            }

            const updatedFilters = addOptionalFilter(
                filters,
                filter,
                filterDefaults
            )

            expect(updatedFilters).toContainEqual({
                values: filter.values.map(toLowerCaseString),
                member: filterDefaults.member,
                operator: FilterOperatorMap[filter.operator],
            })
        })

        it('should add Tags filter with ONE_Of operator', () => {
            const filter: TagFilter[] = [
                {
                    values: [123, 456],
                    operator: LogicalOperatorEnum.ONE_OF,
                    filterInstanceId: TagFilterInstanceId.First,
                },
            ]
            const filters: ReportingFilter[] = []
            const filterDefaults = {
                member: TicketMember.Tags,
                operator: ReportingFilterOperator.Equals,
            }

            const updatedFilters = addOptionalFilter(
                filters,
                filter,
                filterDefaults
            )

            expect(updatedFilters).toEqual([
                {
                    values: filter[0].values.map(toLowerCaseString),
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                },
            ])
        })

        it('should use TicketMember.AllTags for ALL_OF operator with Tags', () => {
            const filter: TagFilter[] = [
                {
                    values: [123, 456],
                    operator: LogicalOperatorEnum.ALL_OF,
                    filterInstanceId: TagFilterInstanceId.First,
                },
            ]
            const filters: ReportingFilter[] = []
            const filterDefaults = {
                member: TicketMember.Tags,
                operator: ReportingFilterOperator.Equals,
            }

            const updatedFilters = addOptionalFilter(
                filters,
                filter,
                filterDefaults
            )

            expect(updatedFilters).toEqual([
                {
                    values: filter[0].values.map(toLowerCaseString),
                    member: TicketMember.AllTags,
                    operator: FilterOperatorMap[filter[0].operator],
                },
            ])
        })

        it('should produce single entry for ALL_OF operator for a custom field with a values count', () => {
            const filter: CustomFieldFilter[] = [
                {
                    values: ['123:One', '456:Two'],
                    operator: LogicalOperatorEnum.ALL_OF,
                    customFieldId: 123,
                },
            ]
            const filterDefaults = {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.Equals,
            }
            const filters: ReportingFilter[] = []

            const updatedFilters = addOptionalFilter(
                filters,
                filter,
                filterDefaults
            )

            expect(updatedFilters).toEqual([
                {
                    values: filter[0].values,
                    member: filterDefaults.member,
                    operator: FilterOperatorMap[filter[0].operator],
                },
                {
                    member: TicketMember.TotalCustomFieldIdsToMatch,
                    operator: ReportingFilterOperator.Equals,
                    values: [String(filter[0].values.length)],
                },
            ])
        })

        it('should add the TicketMember.TotalCustomFieldIdsToMatch for multiple Custom Fields', () => {
            const customFieldId = 123
            const anotherCustomFieldId = 456
            const filter: CustomFieldFilter[] = [
                {
                    values: [
                        getCustomFieldValueSerializer(customFieldId)('One'),
                        getCustomFieldValueSerializer(customFieldId)('Two'),
                    ],
                    operator: LogicalOperatorEnum.ONE_OF,
                    customFieldId: customFieldId,
                },
                {
                    values: [
                        getCustomFieldValueSerializer(anotherCustomFieldId)(
                            'Value'
                        ),
                    ],
                    operator: LogicalOperatorEnum.ONE_OF,
                    customFieldId: anotherCustomFieldId,
                },
            ]
            const filterDefaults = {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.Equals,
            }
            const filters: ReportingFilter[] = []

            const updatedFilters = addOptionalFilter(
                filters,
                filter,
                filterDefaults
            )

            expect(updatedFilters).toEqual([
                {
                    member: filterDefaults.member,
                    values: filter.reduce<string[]>(
                        (arr, f) => [...arr, ...f.values],
                        []
                    ),
                    operator: FilterOperatorMap[filter[0].operator],
                },
                {
                    member: TicketMember.TotalCustomFieldIdsToMatch,
                    operator: ReportingFilterOperator.Equals,
                    values: [
                        String([customFieldId, anotherCustomFieldId].length),
                    ],
                },
            ])
        })

        it('should produce multiple entries for NOT_ONE_OF operator for a custom field', () => {
            const filter: CustomFieldFilter[] = [
                {
                    values: ['123:One', '456:Two'],
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    customFieldId: 123,
                },
            ]
            const filterDefaults = {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.Equals,
            }
            const filters: ReportingFilter[] = []

            const updatedFilters = addOptionalFilter(
                filters,
                filter,
                filterDefaults
            )

            expect(updatedFilters).toEqual(
                filter.map((value) => ({
                    values: value.values,
                    member: TicketMember.CustomFieldToExclude,
                    operator: FilterOperatorMap[value.operator],
                }))
            )
        })

        it('should produce multiple entries for ONE_OF operator for a custom field', () => {
            const filter: CustomFieldFilter[] = [
                {
                    values: ['123:one', '456:two'],
                    operator: LogicalOperatorEnum.ONE_OF,
                    customFieldId: 123,
                },
            ]
            const filterDefaults = {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.Equals,
            }
            const filters: ReportingFilter[] = []

            const updatedFilters = addOptionalFilter(
                filters,
                filter,
                filterDefaults
            )

            expect(updatedFilters).toEqual(
                filter.map((value) => ({
                    values: value.values,
                    member: filterDefaults.member,
                    operator: FilterOperatorMap[value.operator],
                }))
            )
        })

        it('should use alternative member for tags with NOT_ONE_OF operator', () => {
            const filters: ReportingFilter[] = []
            const filter: TagFilter[] = [
                {
                    values: [123, 456],
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    filterInstanceId: TagFilterInstanceId.First,
                },
            ]

            const updatedFilters = addOptionalFilter(filters, filter, {
                member: TicketMember.Tags,
                operator: ReportingFilterOperator.Equals,
            })

            expect(updatedFilters).toEqual([
                {
                    member: TicketMember.TagsToExclude,
                    operator: ReportingFilterOperator.NotEquals,
                    values: filter[0].values.map(String),
                },
            ])
        })

        it('should use alternative member for messageSenderId with NOT_ONE_OF operator', () => {
            const filters: ReportingFilter[] = []
            const filter = {
                values: ['123', '456'],
                operator: LogicalOperatorEnum.NOT_ONE_OF,
            }

            const updatedFilters = addOptionalFilter(filters, filter, {
                member: TicketMember.MessageSenderId,
                operator: ReportingFilterOperator.Equals,
            })

            expect(updatedFilters).toEqual([
                {
                    member: TicketMember.MessageSenderIdToExclude,
                    operator: ReportingFilterOperator.NotEquals,
                    values: filter.values,
                },
            ])
        })

        it('should add null value for HelpdeskMessageMember.SenderId with NOT_ONE_OF', () => {
            const filters: ReportingFilter[] = []
            const filter = {
                values: ['123', '456'],
                operator: LogicalOperatorEnum.NOT_ONE_OF,
            }

            const updatedFilters = addOptionalFilter(filters, filter, {
                member: HelpdeskMessageMember.SenderId,
                operator: ReportingFilterOperator.Equals,
            })

            expect(updatedFilters).toEqual([
                {
                    member: HelpdeskMessageMember.SenderId,
                    operator: ReportingFilterOperator.NotEquals,
                    values: [...filter.values, null],
                },
            ])
        })

        it.each([
            undefined,
            [],
            {
                values: [],
                operator: LogicalOperatorEnum.NOT_ONE_OF,
            },
            [
                {
                    values: [],
                    operator: LogicalOperatorEnum.ONE_OF,
                    filterInstanceId: TagFilterInstanceId.First,
                },
            ],
        ])('should not add the new filter if empty', (filter) => {
            const filters: ReportingFilter[] = []
            const filterDefaults = {
                member: TicketMember.Channel,
                operator: ReportingFilterOperator.Equals,
            }

            const updatedFilters = addOptionalFilter(
                filters,
                filter,
                filterDefaults
            )

            expect(updatedFilters).toEqual(filters)
        })
    })

    describe('hasFilter', () => {
        it.each([
            [undefined],
            [[]],
            [{values: [], operator: LogicalOperatorEnum.ONE_OF}],
        ])('should return false if there is a no value ', (emptyFilter) => {
            expect(hasFilter(emptyFilter)).toBe(false)
        })

        it.each([
            [[1, 2]],
            [{values: [1, 2], operator: LogicalOperatorEnum.ONE_OF}],
        ])('should return true if there is a value ', (filterWithValues) => {
            expect(hasFilter(filterWithValues)).toBe(true)
        })
    })

    describe('withDefaultLogicalOperator', () => {
        it('should return empty filter with default logic operator on undefined', () => {
            expect(withDefaultLogicalOperator(undefined)).toEqual({
                values: [],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        })

        it('should return filter with passed logic operator', () => {
            const filterValue = [1, 2]
            const operator = LogicalOperatorEnum.ALL_OF

            expect(withDefaultLogicalOperator(filterValue, operator)).toEqual({
                values: filterValue,
                operator,
            })
        })
    })

    describe('injectCustomFieldId', () => {
        it('should support custom fields without logical operator', () => {
            const filters = {
                period: {
                    start_datetime: '1970-01-01T00:00:00+00:00',
                    end_datetime: '1970-01-01T00:00:00+00:00',
                },
                [FilterKey.CustomFields]: ['345::asd', '789::qwe'],
            }
            const customFieldId = 123
            const drillDownValues = ['xyz']

            const updatedFilters = injectDrillDownCustomFieldId(
                filters,
                customFieldId,
                ['xyz']
            )

            expect(updatedFilters.period).toEqual(filters.period)
            expect(updatedFilters[FilterKey.CustomFields]).toEqual([
                ...filters[FilterKey.CustomFields],
                ...drillDownValues.map(
                    getCustomFieldValueSerializer(customFieldId)
                ),
            ])
        })
    })

    describe('isPeriodFilter', () => {
        it('should return true', () => {
            const periodFilter = {
                start_datetime: '1970-01-01T00:00:00+00:00',
                end_datetime: '1970-01-01T00:00:00+00:00',
            }

            expect(isPeriodFilter(periodFilter as any)).toBe(true)
        })

        it('should return false', () => {
            expect(
                isPeriodFilter({
                    test: '1970-01-01T00:00:00+00:00',
                    end_datetime: '1970-01-01T00:00:00+00:00',
                } as any)
            ).toBe(false)

            expect(isPeriodFilter(['test'])).toBe(false)
        })
    })

    describe('isCustomFieldFilter', () => {
        it('should return true', () => {
            const customFieldFilters = [
                {
                    operator: LogicalOperatorEnum.ONE_OF,
                    customFieldId: 'customFieldId',
                    values: ['1::asd'],
                },
            ] as any

            expect(isCustomFieldFilter(customFieldFilters)).toBe(true)
        })

        it('should return false', () => {
            expect(
                isCustomFieldFilter([
                    {
                        operator: LogicalOperatorEnum.ONE_OF,
                        customFieldId: 'customFieldId',
                    },
                ] as any)
            ).toBe(false)

            expect(
                isCustomFieldFilter([
                    {
                        customFieldId: 'customFieldId',
                        values: ['1::asd'],
                    },
                ] as any)
            ).toBe(false)
        })
    })

    describe('isAggregationWindowFilter', () => {
        expect(isAggregationWindowFilter(123)).toEqual(false)
        expect(isAggregationWindowFilter(ReportingGranularity.Week)).toEqual(
            true
        )
        expect(isAggregationWindowFilter(ReportingGranularity.Second)).toEqual(
            false
        )
    })
})
