import _flatMap from 'lodash/flatMap'
import {HelpdeskMessageMember} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {
    addOptionalFilter,
    FilterOperatorMap,
    hasFilter,
    toLowerCaseString,
    withDefaultLogicalOperator,
} from 'models/reporting/queryFactories/utils'
import {ReportingFilter, ReportingFilterOperator} from 'models/reporting/types'
import {CustomFieldFilter} from 'models/stat/types'
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

        it('should add TotalTagsToMatch filter for ALL_OF operator with Tags', () => {
            const filter = {
                values: [123, 456],
                operator: LogicalOperatorEnum.ALL_OF,
            }
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
                    values: filter.values.map(toLowerCaseString),
                    member: filterDefaults.member,
                    operator: FilterOperatorMap[filter.operator],
                },
                {
                    member: TicketMember.TotalTagsToMatch,
                    operator: ReportingFilterOperator.Equals,
                    values: [String(filter.values.length)],
                },
            ])
        })

        it('should produce multiple entries for ALL_OF operator for a custom field', () => {
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

            expect(updatedFilters).toEqual(
                _flatMap(
                    filter.map((value) =>
                        filter[0].values.map((val) => ({
                            values: [String(val)],
                            member: filterDefaults.member,
                            operator: FilterOperatorMap[value.operator],
                        }))
                    )
                )
            )
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
            const filter = {
                values: ['123', '456'],
                operator: LogicalOperatorEnum.NOT_ONE_OF,
            }

            const updatedFilters = addOptionalFilter(filters, filter, {
                member: TicketMember.Tags,
                operator: ReportingFilterOperator.Equals,
            })

            expect(updatedFilters).toEqual([
                {
                    member: TicketMember.TagsToExclude,
                    operator: ReportingFilterOperator.NotEquals,
                    values: filter.values,
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
})
