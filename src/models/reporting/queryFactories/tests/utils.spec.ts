import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {
    addOptionalFilter,
    FilterOperatorMap,
    hasFilter,
    toLowerCaseString,
    withDefaultLogicalOperator,
} from 'models/reporting/queryFactories/utils'
import {ReportingFilter, ReportingFilterOperator} from 'models/reporting/types'
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

        it('should produce multiple entries for ALL_OF operator', () => {
            const filter = {
                values: [123, 456],
                operator: LogicalOperatorEnum.ALL_OF,
            }
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
            // // ALL OF
            // const cubeFilter = [
            //     {
            //         values: ['123'],
            //         member: filterDefaults.member,
            //         operator: ReportingFilterOperator.Equals,
            //     },
            //     {
            //         values: ['456'],
            //         member: filterDefaults.member,
            //         operator: ReportingFilterOperator.Equals,
            //     }
            // ]
            // // ONE OF
            // const cubeFilter = [
            //     {
            //         values: ['123', '456'],
            //         member: filterDefaults.member,
            //         operator: ReportingFilterOperator.Equals,
            //     },
            // ]
            // // NOT ONE OF
            // const cubeFilter = [
            //     {
            //         values: ['123', '456'],
            //         member: filterDefaults.member,
            //         operator: ReportingFilterOperator.NotEquals,
            //     },
            // ]

            expect(updatedFilters).toEqual(
                filter.values.map((value) => ({
                    values: [toLowerCaseString(value)],
                    member: filterDefaults.member,
                    operator: FilterOperatorMap[filter.operator],
                }))
            )
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
