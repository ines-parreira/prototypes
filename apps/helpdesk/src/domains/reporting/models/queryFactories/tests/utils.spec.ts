import { AiSalesAgentOrdersFilterMember } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import {
    addFieldIdToCustomFieldValues,
    addOptionalFilter,
    countUniquePrefixes,
    deduplicateCustomFields,
    FilterOperatorMap,
    getCustomFieldValueSerializer,
    hasFilter,
    injectCustomFieldId,
    isAggregationWindowFilter,
    isCustomFieldFilter,
    isFilterWithLogicalOperator,
    isPeriodFilter,
    isTagFilter,
    toLowerCaseString,
    toUpperCaseString,
    withDefaultCustomFieldAndLogicalOperator,
    withDefaultLogicalOperator,
    withLogicalOperator,
} from 'domains/reporting/models/queryFactories/utils'
import type {
    CustomFieldFilter,
    StatsFilters,
    TagFilter,
} from 'domains/reporting/models/stat/types'
import {
    FilterKey,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import type { ReportingFilter } from 'domains/reporting/models/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'domains/reporting/models/types'
import {
    ApiOnlyOperatorEnum,
    LogicalOperatorEnum,
} from 'domains/reporting/pages/common/components/Filter/constants'

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
                    filterDefaults,
                )

                expect(updatedFilters).toContainEqual({
                    member: filterDefaults.member,
                    operator: filterDefaults.operator,
                    values: filter.map(toLowerCaseString),
                })
            },
        )

        it.each([
            [{ values: [123, 456], operator: LogicalOperatorEnum.ONE_OF }],
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
                filterDefaults,
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
                filterDefaults,
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
                filterDefaults,
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
                filterDefaults,
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
                            'Value',
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
                filterDefaults,
            )

            expect(updatedFilters).toEqual([
                {
                    member: filterDefaults.member,
                    values: filter.reduce<string[]>(
                        (arr, f) => [...arr, ...f.values],
                        [],
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
                filterDefaults,
            )

            expect(updatedFilters).toEqual(
                filter.map((value) => ({
                    values: value.values,
                    member: TicketMember.CustomFieldToExclude,
                    operator: FilterOperatorMap[value.operator],
                })),
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
                filterDefaults,
            )

            expect(updatedFilters).toEqual(
                filter.map((value) => ({
                    values: value.values,
                    member: filterDefaults.member,
                    operator: FilterOperatorMap[value.operator],
                })),
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
                filterDefaults,
            )

            expect(updatedFilters).toEqual(filters)
        })

        it('should convert journey IDs to uppercase when using AiSalesAgentOrdersFilterMember.JourneyId', () => {
            const filter = {
                values: ['01k0spsfvap1xsx3jzyjwtr9q7', 'abc123def456'],
                operator: LogicalOperatorEnum.ONE_OF,
            }

            const filters: ReportingFilter[] = []

            const filterDefaults = {
                member: AiSalesAgentOrdersFilterMember.JourneyId,
                operator: ReportingFilterOperator.Equals,
            }

            const updatedFilters = addOptionalFilter(
                filters,
                filter,
                filterDefaults,
            )

            expect(updatedFilters).toEqual([
                {
                    member: AiSalesAgentOrdersFilterMember.JourneyId,
                    values: ['01K0SPSFVAP1XSX3JZYJWTR9Q7', 'ABC123DEF456'],
                    operator: ReportingFilterOperator.Equals,
                },
            ])
        })
    })

    describe('hasFilter', () => {
        it.each([
            [undefined],
            [[]],
            [{ values: [], operator: LogicalOperatorEnum.ONE_OF }],
        ])('should return false if there is a no value ', (emptyFilter) => {
            expect(hasFilter(emptyFilter)).toBe(false)
        })

        it.each([
            [[1, 2]],
            [{ values: [1, 2], operator: LogicalOperatorEnum.ONE_OF }],
        ])('should return true if there is a value ', (filterWithValues) => {
            expect(hasFilter(filterWithValues)).toBe(true)
        })

        it('should return true for SET operator with empty values', () => {
            const filter = { values: [], operator: ApiOnlyOperatorEnum.SET }
            expect(hasFilter(filter)).toBe(true)
        })

        it('should return false for SET operator with non-empty values', () => {
            const filter = {
                values: ['value1'],
                operator: ApiOnlyOperatorEnum.SET,
            }
            expect(hasFilter(filter)).toBe(false)
        })

        it('should return true for IN_DATE_RANGE operator with exactly 2 values', () => {
            const filter = {
                values: ['2024-01-01', '2024-12-31'],
                operator: ApiOnlyOperatorEnum.IN_DATE_RANGE,
            }
            expect(hasFilter(filter)).toBe(true)
        })

        it('should return false for IN_DATE_RANGE operator with fewer than 2 values', () => {
            const filter = {
                values: ['2024-01-01'],
                operator: ApiOnlyOperatorEnum.IN_DATE_RANGE,
            }
            expect(hasFilter(filter)).toBe(false)
        })

        it('should return false for IN_DATE_RANGE operator with more than 2 values', () => {
            const filter = {
                values: ['2024-01-01', '2024-12-31', '2025-01-01'],
                operator: ApiOnlyOperatorEnum.IN_DATE_RANGE,
            }
            expect(hasFilter(filter)).toBe(false)
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
        it('should support custom fields with logical operator', () => {
            const customFieldId = 123
            const initialCustomFieldsFilter = [
                {
                    customFieldId,
                    ...withDefaultLogicalOperator(['345::asd', '789::qwe']),
                },
            ]
            const filters: StatsFilters = {
                period: {
                    start_datetime: '1970-01-01T00:00:00+00:00',
                    end_datetime: '1970-01-01T00:00:00+00:00',
                },
                [FilterKey.CustomFields]: initialCustomFieldsFilter,
            }
            const drillDownValues = ['xyz']

            const updatedFilters = injectCustomFieldId(filters, customFieldId, [
                'xyz',
            ])

            expect(updatedFilters.period).toEqual(filters.period)
            expect(updatedFilters[FilterKey.CustomFields]).toEqual([
                ...initialCustomFieldsFilter,
                {
                    customFieldId,
                    ...withDefaultLogicalOperator(
                        drillDownValues.map(
                            getCustomFieldValueSerializer(customFieldId),
                        ),
                    ),
                },
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
                } as any),
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
                ] as any),
            ).toBe(false)

            expect(
                isCustomFieldFilter([
                    {
                        customFieldId: 'customFieldId',
                        values: ['1::asd'],
                    },
                ] as any),
            ).toBe(false)
        })
    })

    describe('isAggregationWindowFilter', () => {
        expect(isAggregationWindowFilter(123)).toEqual(false)
        expect(isAggregationWindowFilter(ReportingGranularity.Week)).toEqual(
            true,
        )
    })

    describe('addFieldIdToCustomFieldValues', () => {
        it('should return an empty array when customFieldsValueStrings is null', () => {
            const result = addFieldIdToCustomFieldValues(123, null)
            expect(result).toEqual([])
        })

        it('should return an array with custom field IDs added to each value', () => {
            const customFieldId = 123
            const customFieldsValueStrings = ['value1', 'value2']
            const result = addFieldIdToCustomFieldValues(
                customFieldId,
                customFieldsValueStrings,
            )
            expect(result).toEqual(['123::value1', '123::value2'])
        })
    })

    describe('countUniquePrefixes', () => {
        it('should return 0 for an empty array', () => {
            expect(countUniquePrefixes([])).toBe(0)
        })

        it('should return the correct count of unique prefixes', () => {
            const array = ['123::value1', '123::value2', '456::value3']
            expect(countUniquePrefixes(array)).toBe(2)
        })

        it('should handle arrays with mixed prefixes and no prefixes', () => {
            const array = ['123::value1', 'value2', '456::value3']
            expect(countUniquePrefixes(array)).toBe(3)
        })

        it('should handle arrays with duplicate prefixes', () => {
            const array = ['123::value1', '123::value2', '123::value3']
            expect(countUniquePrefixes(array)).toBe(1)
        })

        it('should count only first prefix', () => {
            const array = ['123::value1::value2', '123::value3::value2']

            expect(countUniquePrefixes(array)).toBe(1)
        })
    })

    describe('isFilterWithLogicalOperator', () => {
        it('should return true for filter with operator and values', () => {
            const filter = {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [1, 2, 3],
            }
            expect(isFilterWithLogicalOperator(filter)).toBe(true)
        })

        it('should return false for array', () => {
            expect(isFilterWithLogicalOperator([1, 2, 3])).toBe(false)
        })

        it('should return false for undefined', () => {
            expect(isFilterWithLogicalOperator(undefined)).toBe(false)
        })

        it('should return false for object without operator', () => {
            expect(isFilterWithLogicalOperator({ values: [1, 2] } as any)).toBe(
                false,
            )
        })

        it('should return false for object without values', () => {
            expect(
                isFilterWithLogicalOperator({
                    operator: LogicalOperatorEnum.ONE_OF,
                } as any),
            ).toBe(false)
        })
    })

    describe('isTagFilter', () => {
        it('should return true for valid tag filter array', () => {
            const filter: TagFilter[] = [
                {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [1, 2, 3],
                    filterInstanceId: TagFilterInstanceId.First,
                },
            ]
            expect(isTagFilter(filter)).toBe(true)
        })

        it('should return false for undefined', () => {
            expect(isTagFilter(undefined)).toBe(false)
        })

        it('should return false for non-array', () => {
            expect(isTagFilter({ operator: 'one-of' } as any)).toBe(false)
        })

        it('should return false for array without filterInstanceId', () => {
            const filter = [
                {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [1, 2, 3],
                },
            ]
            expect(isTagFilter(filter as any)).toBe(false)
        })

        it('should return true for empty array', () => {
            // Empty array satisfies .every() condition (vacuous truth)
            expect(isTagFilter([])).toBe(true)
        })
    })

    describe('toUpperCaseString', () => {
        it('should convert string to uppercase', () => {
            expect(toUpperCaseString('test')).toBe('TEST')
        })

        it('should convert number to uppercase string', () => {
            expect(toUpperCaseString(123)).toBe('123')
        })

        it('should handle mixed case', () => {
            expect(toUpperCaseString('TeSt')).toBe('TEST')
        })
    })

    describe('withLogicalOperator', () => {
        it('should create filter with default ONE_OF operator', () => {
            const result = withLogicalOperator([1, 2, 3])
            expect(result).toEqual({
                operator: LogicalOperatorEnum.ONE_OF,
                values: [1, 2, 3],
            })
        })

        it('should create filter with specified operator', () => {
            const result = withLogicalOperator(
                ['a', 'b'],
                LogicalOperatorEnum.NOT_ONE_OF,
            )
            expect(result).toEqual({
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: ['a', 'b'],
            })
        })

        it('should create filter with ALL_OF operator', () => {
            const result = withLogicalOperator(
                [1, 2],
                LogicalOperatorEnum.ALL_OF,
            )
            expect(result).toEqual({
                operator: LogicalOperatorEnum.ALL_OF,
                values: [1, 2],
            })
        })
    })

    describe('withExtendedLogicalOperator', () => {
        it('should create filter with default ONE_OF operator', () => {
            const result = withLogicalOperator([1, 2, 3])
            expect(result).toEqual({
                operator: 'one-of',
                values: [1, 2, 3],
            })
        })

        it('should create filter with specified extended operator', () => {
            const result = withLogicalOperator(['a', 'b'], 'not-one-of' as any)
            expect(result).toEqual({
                operator: 'not-one-of',
                values: ['a', 'b'],
            })
        })
    })

    describe('withDefaultCustomFieldAndLogicalOperator', () => {
        it('should create custom field filter with default values', () => {
            const result = withDefaultCustomFieldAndLogicalOperator({
                customFieldId: 123,
            })
            expect(result).toEqual({
                customFieldId: 123,
                operator: LogicalOperatorEnum.ONE_OF,
                values: [],
            })
        })

        it('should create custom field filter with provided values', () => {
            const result = withDefaultCustomFieldAndLogicalOperator({
                customFieldId: 456,
                values: ['value1', 'value2'],
            })
            expect(result).toEqual({
                customFieldId: 456,
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['value1', 'value2'],
            })
        })

        it('should create custom field filter with specified operator', () => {
            const result = withDefaultCustomFieldAndLogicalOperator({
                customFieldId: 789,
                values: ['test'],
                operator: LogicalOperatorEnum.NOT_ONE_OF,
            })
            expect(result).toEqual({
                customFieldId: 789,
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: ['test'],
            })
        })
    })

    describe('deduplicateCustomFields', () => {
        it('should add filter when no custom field filter exists', () => {
            const acc: ReportingFilter[] = []
            const filter: ReportingFilter = {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.Equals,
                values: ['123::value1'],
            }
            const result = deduplicateCustomFields(acc, filter)
            expect(result).toEqual([filter])
        })

        it('should merge values when custom field filter exists', () => {
            const existingFilter: ReportingFilter = {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.Equals,
                values: ['123::value1'],
            }
            const acc: ReportingFilter[] = [existingFilter]
            const newFilter: ReportingFilter = {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.Equals,
                values: ['456::value2'],
            }
            const result = deduplicateCustomFields(acc, newFilter)
            expect(result).toEqual([
                {
                    member: TicketMember.CustomField,
                    operator: ReportingFilterOperator.Equals,
                    values: ['123::value1', '456::value2'],
                },
            ])
        })

        it('should handle CustomFieldToExclude member', () => {
            const acc: ReportingFilter[] = []
            const filter: ReportingFilter = {
                member: TicketMember.CustomFieldToExclude,
                operator: ReportingFilterOperator.NotEquals,
                values: ['123::value1'],
            }
            const result = deduplicateCustomFields(acc, filter)
            expect(result).toEqual([filter])
        })

        it('should not deduplicate non-custom field filters', () => {
            const acc: ReportingFilter[] = [
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: ['email'],
                },
            ]
            const filter: ReportingFilter = {
                member: TicketMember.AssigneeUserId,
                operator: ReportingFilterOperator.Equals,
                values: ['123'],
            }
            const result = deduplicateCustomFields(acc, filter)
            expect(result).toEqual([
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: ['email'],
                },
                {
                    member: TicketMember.AssigneeUserId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['123'],
                },
            ])
        })

        it('should merge multiple custom field filters correctly', () => {
            const acc: ReportingFilter[] = [
                {
                    member: TicketMember.CustomField,
                    operator: ReportingFilterOperator.Equals,
                    values: ['123::value1'],
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: ['email'],
                },
            ]
            const filter: ReportingFilter = {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.Equals,
                values: ['456::value2', '789::value3'],
            }
            const result = deduplicateCustomFields(acc, filter)
            expect(result).toEqual([
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: ['email'],
                },
                {
                    member: TicketMember.CustomField,
                    operator: ReportingFilterOperator.Equals,
                    values: ['123::value1', '456::value2', '789::value3'],
                },
            ])
        })
    })
})
