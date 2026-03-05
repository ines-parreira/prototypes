import { ReportingStatsOperatorsEnum } from '@gorgias/helpdesk-types'

import { MetricScope } from 'domains/reporting/hooks/metricNames'
import type { ScopeMeta } from 'domains/reporting/models/scopes/scope'
import {
    compareAndReportQueries,
    createScopeFilters,
} from 'domains/reporting/models/scopes/utils'
import type {
    ApiStatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import {
    ApiOnlyOperatorEnum,
    LogicalOperatorEnum,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { reportError } from 'utils/errors'

jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))

describe('utils', () => {
    describe('createScopeFilters', () => {
        const basePeriodFilters: StatsFiltersWithLogicalOperator = {
            period: {
                start_datetime: '2025-09-22T00:00:00.000',
                end_datetime: '2025-09-22T23:59:59.000',
            },
        }

        it('should create basic period filters', () => {
            const scopeConfig: ScopeMeta = {
                measures: ['ticketCount'],
                scope: MetricScope.TicketsOpen,
                filters: [],
            }

            const result = createScopeFilters(basePeriodFilters, scopeConfig)

            expect(result).toEqual([
                {
                    member: 'periodStart',
                    operator: ReportingStatsOperatorsEnum.AfterDate,
                    values: ['2025-09-22T00:00:00.000'],
                },
                {
                    member: 'periodEnd',
                    operator: ReportingStatsOperatorsEnum.BeforeDate,
                    values: ['2025-09-22T23:59:59.000'],
                },
            ])
        })

        it('should handle scope config with undefined filters', () => {
            const scopeConfig: ScopeMeta = {
                measures: ['ticketCount'],
                scope: MetricScope.TicketsOpen,
                filters: ['periodStart', 'periodEnd'],
            }

            const result = createScopeFilters(basePeriodFilters, scopeConfig)

            expect(result).toEqual([
                {
                    member: 'periodStart',
                    operator: ReportingStatsOperatorsEnum.AfterDate,
                    values: ['2025-09-22T00:00:00.000'],
                },
                {
                    member: 'periodEnd',
                    operator: ReportingStatsOperatorsEnum.BeforeDate,
                    values: ['2025-09-22T23:59:59.000'],
                },
            ])
        })

        it('should add agents filter when present in scope config and stat filters', () => {
            const scopeConfig: ScopeMeta = {
                measures: ['ticketCount'],
                scope: MetricScope.TicketsOpen,
                filters: ['agentId'],
            }

            const statFilters: StatsFiltersWithLogicalOperator = {
                ...basePeriodFilters,
                agents: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [123, 456],
                },
            }

            const result = createScopeFilters(statFilters, scopeConfig)

            expect(result).toContainEqual({
                member: 'agentId',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [123, 456],
            })
        })

        it('should add agentId filter when using agentId field instead of agents', () => {
            const scopeConfig: ScopeMeta = {
                measures: ['ticketCount'],
                scope: MetricScope.TicketsOpen,
                filters: ['agentId'],
            }

            const statFilters: ApiStatsFilters = {
                ...basePeriodFilters,
                agentId: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [123, 456],
                },
            }

            const result = createScopeFilters(statFilters, scopeConfig)

            expect(result).toContainEqual({
                member: 'agentId',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [123, 456],
            })
        })

        it('should add channels filter when present in scope config and stat filters', () => {
            const scopeConfig: ScopeMeta = {
                measures: ['ticketCount'],
                scope: MetricScope.TicketsOpen,
                filters: ['channel'],
            }

            const statFilters: StatsFiltersWithLogicalOperator = {
                ...basePeriodFilters,
                channels: {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: ['email', 'chat'],
                },
            }

            const result = createScopeFilters(statFilters, scopeConfig)

            expect(result).toContainEqual({
                member: 'channel',
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: ['email', 'chat'],
            })
        })

        it('should add integrations filter when present in scope config and stat filters', () => {
            const scopeConfig: ScopeMeta = {
                measures: ['ticketCount'],
                scope: MetricScope.TicketsOpen,
                filters: ['integrationId'],
            }

            const statFilters: StatsFiltersWithLogicalOperator = {
                ...basePeriodFilters,
                integrations: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [789, 101112],
                },
            }

            const result = createScopeFilters(statFilters, scopeConfig)

            expect(result).toContainEqual({
                member: 'integrationId',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [789, 101112],
            })
        })

        it('should add stores filter when present in scope config and stat filters', () => {
            const scopeConfig: ScopeMeta = {
                measures: ['ticketCount'],
                scope: MetricScope.TicketsOpen,
                filters: ['storeId'],
            }

            const statFilters: StatsFiltersWithLogicalOperator = {
                ...basePeriodFilters,
                stores: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [877777, 101112],
                },
            }

            const result = createScopeFilters(statFilters, scopeConfig)

            expect(result).toContainEqual({
                member: 'storeId',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [877777, 101112],
            })
        })

        it('should add teams filter when present in scope config and stat filters', () => {
            const scopeConfig: ScopeMeta = {
                measures: ['ticketCount'],
                scope: MetricScope.TicketsOpen,
                filters: ['teamId'],
            }

            const statFilters: StatsFiltersWithLogicalOperator = {
                ...basePeriodFilters,
                teams: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [1, 2, 3],
                },
            }

            const result = createScopeFilters(statFilters, scopeConfig)

            expect(result).toContainEqual({
                member: 'teamId',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [1, 2, 3],
            })
        })

        it('should add teams filter with NOT_ONE_OF operator', () => {
            const scopeConfig: ScopeMeta = {
                measures: ['ticketCount'],
                scope: MetricScope.TicketsOpen,
                filters: ['teamId'],
            }

            const statFilters: StatsFiltersWithLogicalOperator = {
                ...basePeriodFilters,
                teams: {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [5, 10],
                },
            }

            const result = createScopeFilters(statFilters, scopeConfig)

            expect(result).toContainEqual({
                member: 'teamId',
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: [5, 10],
            })
        })

        it('should not add teams filter when values array is empty', () => {
            const scopeConfig: ScopeMeta = {
                measures: ['ticketCount'],
                scope: MetricScope.TicketsOpen,
                filters: ['teamId'],
            }

            const statFilters: StatsFiltersWithLogicalOperator = {
                ...basePeriodFilters,
                teams: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [],
                },
            }

            const result = createScopeFilters(statFilters, scopeConfig)

            expect(result).not.toContainEqual(
                expect.objectContaining({ member: 'teamId' }),
            )
            expect(result).toHaveLength(2)
        })

        it('should not add teams filter when teams is undefined', () => {
            const scopeConfig: ScopeMeta = {
                measures: ['ticketCount'],
                scope: MetricScope.TicketsOpen,
                filters: ['teamId'],
            }

            const statFilters: StatsFiltersWithLogicalOperator = {
                ...basePeriodFilters,
            }

            const result = createScopeFilters(statFilters, scopeConfig)

            expect(result).not.toContainEqual(
                expect.objectContaining({ member: 'teamId' }),
            )
            expect(result).toHaveLength(2)
        })

        describe('tags filter', () => {
            it('should add tags filter with OneOf operator', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['tags'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    tags: [
                        {
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: [1, 2],
                            filterInstanceId: 'first' as any,
                        },
                    ],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'tags',
                    values: [
                        {
                            operator: 'one-of',
                            values: ['1', '2'],
                        },
                    ],
                })
            })

            it('should add tags filter with NotOneOf operator', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['tags'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    tags: [
                        {
                            operator: LogicalOperatorEnum.NOT_ONE_OF,
                            values: [3],
                            filterInstanceId: 'first' as any,
                        },
                    ],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'tags',
                    values: [
                        {
                            operator: 'not-one-of',
                            values: ['3'],
                        },
                    ],
                })
            })

            it('should add tags filter with default AllOf operator', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['tags'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    tags: [
                        {
                            operator: LogicalOperatorEnum.ALL_OF,
                            values: [4],
                            filterInstanceId: 'first' as any,
                        },
                    ],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'tags',
                    values: [
                        {
                            operator: 'all-of',
                            values: ['4'],
                        },
                    ],
                })
            })

            it('should skip tags operators with empty values', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['tags'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    tags: [
                        {
                            operator: LogicalOperatorEnum.ALL_OF,
                            values: [4],
                            filterInstanceId: 'first' as any,
                        },
                        {
                            operator: LogicalOperatorEnum.NOT_ONE_OF,
                            values: [],
                            filterInstanceId: 'first' as any,
                        },
                    ],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'tags',
                    values: [
                        {
                            operator: 'all-of',
                            values: ['4'],
                        },
                    ],
                })
            })

            it('should skip tags with empty values', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['tags'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    tags: [
                        {
                            operator: LogicalOperatorEnum.NOT_ONE_OF,
                            values: [],
                            filterInstanceId: 'first' as any,
                        },
                    ],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                // periodStart + periodEnd filters, no tags
                expect(result).toHaveLength(2)
            })
        })

        describe('customFields filter', () => {
            it('should add customFields filter with OneOf operator', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['customFields'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    customFields: [
                        {
                            customFieldId: 123,
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: ['value1', 'value2'],
                        },
                    ],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'customFields',
                    values: [
                        {
                            custom_field_id: '123',
                            operator: 'one-of',
                            values: ['value1', 'value2'],
                        },
                    ],
                })
            })

            it('should add customFields filter with NotOneOf operator', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['customFields'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    customFields: [
                        {
                            customFieldId: 456,
                            operator: LogicalOperatorEnum.NOT_ONE_OF,
                            values: ['excluded'],
                        },
                    ],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'customFields',
                    values: [
                        {
                            custom_field_id: '456',
                            operator: 'not-one-of',
                            values: ['excluded'],
                        },
                    ],
                })
            })

            it('should remove ID prefix from custom field values when value after separator is an integer', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['customFields'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    customFields: [
                        {
                            customFieldId: 123,
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: ['1234::5678', '5678::9012', '9012::123'],
                        },
                    ],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'customFields',
                    values: [
                        {
                            custom_field_id: '123',
                            operator: 'one-of',
                            values: ['5678', '9012', '123'],
                        },
                    ],
                })
            })

            it('should remove ID prefix from custom field values when value after separator is not an integer', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['customFields'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    customFields: [
                        {
                            customFieldId: 123,
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: [
                                '1234::High Priority',
                                '5678::Medium Priority',
                                '9012::Low Priority',
                            ],
                        },
                    ],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'customFields',
                    values: [
                        {
                            custom_field_id: '123',
                            operator: 'one-of',
                            values: [
                                'High Priority',
                                'Medium Priority',
                                'Low Priority',
                            ],
                        },
                    ],
                })
            })

            it('should handle mixed custom field values with integers and non-integers', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['customFields'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    customFields: [
                        {
                            customFieldId: 123,
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: [
                                '1234::5678',
                                '5678::High Priority',
                                '9012::123',
                                'Low',
                            ],
                        },
                    ],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'customFields',
                    values: [
                        {
                            custom_field_id: '123',
                            operator: 'one-of',
                            values: ['5678', 'High Priority', '123', 'Low'],
                        },
                    ],
                })
            })

            it('should handle custom field values without ID prefix', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['customFields'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    customFields: [
                        {
                            customFieldId: 789,
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: ['Plain Value', 'Another Value'],
                        },
                    ],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'customFields',
                    values: [
                        {
                            custom_field_id: '789',
                            operator: 'one-of',
                            values: ['Plain Value', 'Another Value'],
                        },
                    ],
                })
            })
        })

        describe('CSAT metrics filters', () => {
            it('should add score filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['score'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    score: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['3', '4', '5'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'score',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['3', '4', '5'],
                })
            })

            it('should add communicationSkills filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['communicationSkills'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    communicationSkills: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['excellent', 'good'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'communicationSkills',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['excellent', 'good'],
                })
            })

            it('should add languageProficiency filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['languageProficiency'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    languageProficiency: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['native', 'fluent'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'languageProficiency',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['native', 'fluent'],
                })
            })

            it('should add resolutionCompleteness filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['resolutionCompleteness'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    resolutionCompleteness: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['complete', 'partial'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'resolutionCompleteness',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['complete', 'partial'],
                })
            })

            it('should add accuracy filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['accuracy'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    accuracy: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['high', 'medium'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'accuracy',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['high', 'medium'],
                })
            })

            it('should add efficiency filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['efficiency'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    efficiency: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['efficient', 'very-efficient'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'efficiency',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['efficient', 'very-efficient'],
                })
            })

            it('should add internalCompliance filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['internalCompliance'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    internalCompliance: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['compliant', 'non-compliant'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'internalCompliance',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['compliant', 'non-compliant'],
                })
            })

            it('should add brandVoice filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['brandVoice'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    brandVoice: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['professional', 'friendly', 'casual'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'brandVoice',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['professional', 'friendly', 'casual'],
                })
            })

            it('should add customFieldValue filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['customFieldValue'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    customFieldValue: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['value1', 'value2'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'customFieldValue',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['value1', 'value2'],
                })
            })

            it('should add customFieldId filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['customFieldId'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    customFieldId: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [123, 456],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'customFieldId',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [123, 456],
                })
            })

            it('should add productId filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['productId'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    productId: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['1', '2', '3'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'productId',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['1', '2', '3'],
                })
            })

            it('should add resourceSourceId filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['resourceSourceId'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    resourceSourceId: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['source1', 'source2'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'resourceSourceId',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['source1', 'source2'],
                })
            })

            it('should add resourceSourceSetId filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['resourceSourceSetId'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    resourceSourceSetId: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['set1', 'set2'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'resourceSourceSetId',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['set1', 'set2'],
                })
            })

            it('should add storeId filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['storeId'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    stores: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [111, 222],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'storeId',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [111, 222],
                })
            })

            it('should add callDirection filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['callDirection'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    callDirection: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['inbound', 'outbound'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'callDirection',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['inbound', 'outbound'],
                })
            })

            it('should add callTerminationStatus filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['callTerminationStatus'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    callTerminationStatus: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['completed', 'missed'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'callTerminationStatus',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['completed', 'missed'],
                })
            })

            it('should add isAnsweredByAgent filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['isAnsweredByAgent'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    isAnsweredByAgent: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [true, false],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'isAnsweredByAgent',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [true, false],
                })
            })

            it('should add displayStatus filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['displayStatus'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    displayStatus: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['open', 'closed'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'displayStatus',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['open', 'closed'],
                })
            })

            it('should add queueId filter when present with ONE_OF operator', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['queueId'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    voiceQueues: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [1001, 1002],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'queueId',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [1001, 1002],
                })
            })

            it('should add queueId filter when present with NOT_ONE_OF operator', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['queueId'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    voiceQueues: {
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                        values: [1003, 1004],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'queueId',
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [1003, 1004],
                })
            })

            it('should not add queueId filter when voiceQueues has empty values', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['queueId'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    voiceQueues: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).not.toContainEqual(
                    expect.objectContaining({ member: 'queueId' }),
                )
                expect(result).toHaveLength(2)
            })

            it('should not add queueId filter when voiceQueues is undefined', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['queueId'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).not.toContainEqual(
                    expect.objectContaining({ member: 'queueId' }),
                )
                expect(result).toHaveLength(2)
            })

            it('should add slaPolicyUuid filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['slaPolicyUuid'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    slaPolicies: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['uuid-1', 'uuid-2'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'slaPolicyUuid',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['uuid-1', 'uuid-2'],
                })
            })

            it('should not add slaPolicyUuid filter when slaPolicies has empty values', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['slaPolicyUuid'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    slaPolicies: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).not.toContainEqual(
                    expect.objectContaining({ member: 'slaPolicyUuid' }),
                )
            })
        })

        describe('createdDatetime filter', () => {
            it('should add createdDatetime filter with inDateRange operators', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['createdDatetime'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    createdDatetime: {
                        start_datetime: '2025-10-01T00:00:00.000',
                        end_datetime: '2025-10-31T23:59:59.000',
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'createdDatetime',
                    operator: ApiOnlyOperatorEnum.IN_DATE_RANGE,
                    values: [
                        '2025-10-01T00:00:00.000',
                        '2025-10-31T23:59:59.000',
                    ],
                })
            })

            it('should not add createdDatetime filter when not present in statFilters', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['createdDatetime'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                const hasCreatedDatetime = result.some(
                    (filter: any) => filter.member === 'createdDatetime',
                )
                expect(hasCreatedDatetime).toBe(false)
            })
        })

        describe('convert filters', () => {
            it('should add shopName filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['shopName'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    shopName: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [
                            'shop-a.myshopify.com',
                            'shop-b.myshopify.com',
                        ],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'shopName',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['shop-a.myshopify.com', 'shop-b.myshopify.com'],
                })
            })

            it('should not add shopName filter when values array is empty', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['shopName'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    shopName: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).not.toContainEqual(
                    expect.objectContaining({ member: 'shopName' }),
                )
                expect(result).toHaveLength(2)
            })

            it('should not add shopName filter when shopName is undefined', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['shopName'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).not.toContainEqual(
                    expect.objectContaining({ member: 'shopName' }),
                )
                expect(result).toHaveLength(2)
            })

            it('should add abVariant filter when present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['abVariant'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    abVariant: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['control', 'variant-a'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'abVariant',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['control', 'variant-a'],
                })
            })

            it('should not add abVariant filter when values array is empty', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['abVariant'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    abVariant: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).not.toContainEqual(
                    expect.objectContaining({ member: 'abVariant' }),
                )
                expect(result).toHaveLength(2)
            })

            it('should not add abVariant filter when abVariant is undefined', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['abVariant'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).not.toContainEqual(
                    expect.objectContaining({ member: 'abVariant' }),
                )
                expect(result).toHaveLength(2)
            })

            it('should add campaignId filter when campaigns are present', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['campaignId'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    campaigns: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['campaign-1', 'campaign-2'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'campaignId',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['campaign-1', 'campaign-2'],
                })
            })

            it('should not add campaignId filter when campaigns values are empty', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['campaignId'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                    campaigns: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).not.toContainEqual(
                    expect.objectContaining({ member: 'campaignId' }),
                )
                expect(result).toHaveLength(2)
            })

            it('should not add campaignId filter when campaigns is undefined', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['campaignId'],
                }

                const statFilters: ApiStatsFilters = {
                    ...basePeriodFilters,
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).not.toContainEqual(
                    expect.objectContaining({ member: 'campaignId' }),
                )
                expect(result).toHaveLength(2)
            })
        })

        it('should handle multiple filters together', () => {
            const scopeConfig: ScopeMeta = {
                measures: ['ticketCount'],
                scope: MetricScope.TicketsOpen,
                filters: ['agentId', 'channel', 'tags', 'score'],
            }

            const statFilters: StatsFiltersWithLogicalOperator = {
                ...basePeriodFilters,
                agents: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [123, 456],
                },
                channels: {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: ['email'],
                },
                tags: [
                    {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [1],
                        filterInstanceId: 'first' as any,
                    },
                ],
                score: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['4', '5'],
                },
            }

            const result = createScopeFilters(statFilters, scopeConfig)

            expect(result).toHaveLength(6) // 2 period filters + 4 scope filters
            expect(result).toContainEqual({
                member: 'agentId',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [123, 456],
            })
            expect(result).toContainEqual({
                member: 'channel',
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: ['email'],
            })
            expect(result).toContainEqual({
                member: 'tags',
                values: [
                    {
                        operator: 'one-of',
                        values: ['1'],
                    },
                ],
            })
            expect(result).toContainEqual({
                member: 'score',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['4', '5'],
            })
        })

        it('should skip filters not defined in scope config', () => {
            const scopeConfig: ScopeMeta = {
                measures: ['ticketCount'],
                scope: MetricScope.TicketsOpen,
                filters: ['agentId'], // Only agents filter is allowed
            }

            const statFilters: StatsFiltersWithLogicalOperator = {
                ...basePeriodFilters,
                agents: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [123],
                },
                channels: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['email'], // This should be ignored
                },
            }

            const result = createScopeFilters(statFilters, scopeConfig)

            expect(result).toHaveLength(3) // 2 period filters + 1 agents filter
            expect(result).toContainEqual({
                member: 'agentId',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [123],
            })
            expect(result).not.toContainEqual(
                expect.objectContaining({ member: 'channel' }),
            )
        })

        it('should skip filters not present in stat filters even if defined in scope config', () => {
            const scopeConfig: ScopeMeta = {
                measures: ['ticketCount'],
                scope: MetricScope.TicketsOpen,
                filters: ['agentId', 'channel'],
            }

            const statFilters: StatsFiltersWithLogicalOperator = {
                ...basePeriodFilters,
                agents: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [123],
                },
                // channels is missing from statFilters
            }

            const result = createScopeFilters(statFilters, scopeConfig)

            expect(result).toHaveLength(3) // 2 period filters + 1 agents filter
            expect(result).toContainEqual({
                member: 'agentId',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [123],
            })
            expect(result).not.toContainEqual(
                expect.objectContaining({ member: 'channel' }),
            )
        })

        describe('data type handling', () => {
            it('should keep agent values as numbers', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['agentId'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    agents: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [123, 456, 789],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'agentId',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [123, 456, 789],
                })
            })

            it('should keep integration values as numbers', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['integrationId'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    integrations: {
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                        values: [100, 200],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'integrationId',
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [100, 200],
                })
            })

            it('should keep store values as numbers', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['storeId'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    stores: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [300, 400],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'storeId',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [300, 400],
                })
            })

            it('should keep score values as strings', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['score'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    score: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['3', '4', '5'],
                    },
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'score',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['3', '4', '5'],
                })
            })

            it('should convert tag values to strings', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['tags'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    tags: [
                        {
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: [123, 456],
                            filterInstanceId: 'first' as any,
                        },
                    ],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'tags',
                    values: [
                        {
                            operator: 'one-of',
                            values: ['123', '456'],
                        },
                    ],
                })
            })

            it('should convert custom field IDs to strings', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['customFields'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    customFields: [
                        {
                            customFieldId: 12345,
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: ['value1', 'value2'],
                        },
                    ],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'customFields',
                    values: [
                        {
                            custom_field_id: '12345',
                            operator: 'one-of',
                            values: ['value1', 'value2'],
                        },
                    ],
                })
            })

            it('should handle empty arrays for tags', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['tags'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    tags: [],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                // Empty tags array should not be added to filters
                expect(result).not.toContainEqual({
                    member: 'tags',
                    values: [],
                })
                // Should only contain period filters
                expect(result).toHaveLength(2)
            })

            it('should handle empty arrays for customFields', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['customFields'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    customFields: [],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                // Empty customFields array should not be added to filters
                expect(result).not.toContainEqual({
                    member: 'customFields',
                    values: [],
                })
                // Should only contain period filters
                expect(result).toHaveLength(2)
            })

            it('should handle arrays with values and not empty for customFields', () => {
                const scopeConfig: ScopeMeta = {
                    measures: ['ticketCount'],
                    scope: MetricScope.TicketsOpen,
                    filters: ['customFields'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    customFields: [
                        {
                            customFieldId: 123,
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: ['value1', 'value2'],
                        },
                        {
                            customFieldId: 456,
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: [],
                        },
                    ],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                // empty values should be filtered out
                expect(result).toContainEqual({
                    member: 'customFields',
                    values: [
                        {
                            custom_field_id: '123',
                            operator: 'one-of',
                            values: ['value1', 'value2'],
                        },
                    ],
                })

                expect(result).toHaveLength(3)
            })
        })

        it('should handle error in createScopeFilters', () => {
            const scopeConfig: ScopeMeta = {
                measures: ['ticketCount'],
                scope: MetricScope.TicketsOpen,
                filters: ['invalidFilter' as any], // Invalid filter type
            }

            const statFilters: StatsFiltersWithLogicalOperator = {
                ...basePeriodFilters,
                agents: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [123],
                },
            }

            // This should not throw an error, but should skip the invalid filter
            const result = createScopeFilters(statFilters, scopeConfig)

            // Should only contain the period filters since invalidFilter is skipped
            expect(result).toHaveLength(2) // 2 period filters only
            expect(result).toEqual([
                {
                    member: 'periodStart',
                    operator: ReportingStatsOperatorsEnum.AfterDate,
                    values: ['2025-09-22T00:00:00.000'],
                },
                {
                    member: 'periodEnd',
                    operator: ReportingStatsOperatorsEnum.BeforeDate,
                    values: ['2025-09-22T23:59:59.000'],
                },
            ])
        })
    })

    describe('compareReportingQueries', () => {
        const baseV1Query: ReportingQuery<any> = {
            measures: ['tickets.count'],
            dimensions: ['tickets.status'],
            filters: [
                {
                    member: 'agentId',
                    operator: 'one-of' as any,
                    values: ['123', '456'],
                },
            ],
            metricName: 'tickets' as any,
            timezone: 'UTC',
        }

        const baseV2Query: ReportingQuery<any> = {
            measures: ['tickets.count'],
            dimensions: ['tickets.status'],
            filters: [
                {
                    member: 'agentId',
                    operator: 'one-of' as any,
                    values: ['123', '456'],
                },
            ],
            metricName: 'tickets' as any,
            timezone: 'UTC',
        }
        // The function doesn't return anything, it just logs errors if there are differences
        // For identical queries, no error should be logged
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

        afterAll(() => {
            consoleSpy.mockRestore()
        })

        it('should return identical queries as equal', () => {
            compareAndReportQueries('tickets' as any, baseV1Query, baseV2Query)

            // Should not log any errors for identical queries
            expect(consoleSpy).not.toHaveBeenCalled()
        })

        it('should detect differences in measures', () => {
            const v2Query = {
                ...baseV2Query,
                measures: ['orders.count'],
            } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, baseV1Query, v2Query)

            expect(consoleSpy).toHaveBeenCalledWith(
                'New Stats API and Legacy API queries are different for metric tickets',
                ['measures: ["tickets.count"] (V1) !== ["orders.count"] (V2)'],
                baseV1Query,
                v2Query,
            )
        })

        it('should detect differences in dimensions', () => {
            const v2Query = {
                ...baseV2Query,
                dimensions: ['orders.status'],
            } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, baseV1Query, v2Query)

            expect(consoleSpy).toHaveBeenCalledWith(
                'New Stats API and Legacy API queries are different for metric tickets',
                [
                    'dimensions: ["tickets.status"] (V1) !== ["orders.status"] (V2)',
                ],
                baseV1Query,
                v2Query,
            )
        })

        it('should detect differences in timezone', () => {
            const v2Query = { ...baseV2Query, timezone: 'EST' } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, baseV1Query, v2Query)

            expect(consoleSpy).toHaveBeenCalledWith(
                'New Stats API and Legacy API queries are different for metric tickets',
                ['timezone: UTC !== EST'],
                baseV1Query,
                v2Query,
            )
        })

        it('should detect differences in filters', () => {
            const v2Query = {
                ...baseV2Query,
                filters: [
                    {
                        member: 'agentId',
                        operator: 'one-of',
                        values: ['789'],
                    },
                ],
            } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, baseV1Query, v2Query)

            expect(consoleSpy).toHaveBeenCalledWith(
                'New Stats API and Legacy API queries are different for metric tickets',
                expect.arrayContaining([
                    'V1 filter not found in V2: {"member":"agentId","operator":"one-of","values":["123","456"]}',
                ]),
                baseV1Query,
                v2Query,
            )
        })

        it('should detect different filter lengths', () => {
            const v1Query = {
                ...baseV1Query,
                filters: [
                    { member: 'agentId', operator: 'one-of', values: ['123'] },
                    {
                        member: 'channel',
                        operator: 'one-of',
                        values: ['email'],
                    },
                ],
            } as any
            const v2Query = {
                ...baseV2Query,
                filters: [
                    { member: 'agentId', operator: 'one-of', values: ['123'] },
                ],
            } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, v1Query, v2Query)

            expect(consoleSpy).toHaveBeenCalledWith(
                'New Stats API and Legacy API queries are different for metric tickets',
                expect.arrayContaining(['filters length: V1 2 !== V2 1']),
                v1Query,
                v2Query,
            )
        })

        it('should handle filters in different order', () => {
            const v1Query = {
                ...baseV1Query,
                filters: [
                    { member: 'agentId', operator: 'one-of', values: ['123'] },
                    {
                        member: 'channel',
                        operator: 'one-of',
                        values: ['email'],
                    },
                ],
            } as any
            const v2Query = {
                ...baseV2Query,
                filters: [
                    {
                        member: 'channel',
                        operator: 'one-of',
                        values: ['email'],
                    },
                    { member: 'agentId', operator: 'one-of', values: ['123'] },
                ],
            } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, v1Query, v2Query)

            expect(consoleSpy).not.toHaveBeenCalled()
        })

        it('should detect differences in segments', () => {
            const v1Query = { ...baseV1Query, segments: ['segment1'] }
            const v2Query = { ...baseV2Query, segments: ['segment2'] }

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, v1Query, v2Query)

            expect(consoleSpy).toHaveBeenCalledWith(
                'New Stats API and Legacy API queries are different for metric tickets',
                [
                    'V1 segment not found in V2 segments or filters: segment1',
                    'V2 segment not found in V1: segment2',
                ],
                v1Query,
                v2Query,
            )
        })

        it('should handle empty arrays', () => {
            const v1Query = { ...baseV1Query, measures: [], dimensions: [] }
            const v2Query = { ...baseV2Query, measures: [], dimensions: [] }

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, v1Query, v2Query)

            // Should not log any errors for equivalent queries
            expect(consoleSpy).not.toHaveBeenCalled()
        })

        it('should handle undefined values', () => {
            const v1Query = { ...baseV1Query, timezone: undefined }
            const v2Query = { ...baseV2Query, timezone: undefined }

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, v1Query, v2Query)

            // Should not log any errors for equivalent queries
            expect(consoleSpy).not.toHaveBeenCalled()
        })

        it('should handle timeDimensions differences', () => {
            const v1Query = {
                ...baseV1Query,
                timeDimensions: [
                    {
                        dimension: 'tickets.created_at',
                        granularity: 'day',
                        dateRange: ['2023-01-01', '2023-01-31'],
                    },
                ],
            } as any
            const v2Query = {
                ...baseV2Query,
                timeDimensions: [
                    {
                        dimension: 'tickets.created_at',
                        granularity: 'month',
                        dateRange: ['2023-01-01', '2023-01-31'],
                    },
                ],
            } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, v1Query, v2Query)

            expect(consoleSpy).toHaveBeenCalledWith(
                'New Stats API and Legacy API queries are different for metric tickets',
                ['timeDimensions[0].granularity: day (V1) !== month (V2)'],
                v1Query,
                v2Query,
            )
        })

        it('should detect different timeDimensions lengths', () => {
            const v1Query = {
                ...baseV1Query,
                timeDimensions: [
                    {
                        dimension: 'tickets.created_at',
                        granularity: 'day',
                        dateRange: ['2023-01-01', '2023-01-31'],
                    },
                    {
                        dimension: 'tickets.updated_at',
                        granularity: 'month',
                        dateRange: ['2023-01-01', '2023-12-31'],
                    },
                ],
            } as any
            const v2Query = {
                ...baseV2Query,
                timeDimensions: [
                    {
                        dimension: 'tickets.created_at',
                        granularity: 'day',
                        dateRange: ['2023-01-01', '2023-01-31'],
                    },
                ],
            } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, v1Query, v2Query)

            expect(consoleSpy).toHaveBeenCalledWith(
                'New Stats API and Legacy API queries are different for metric tickets',
                ['timeDimensions length: 2 (V1) !== 1 (V2)'],
                v1Query,
                v2Query,
            )
        })

        it('should detect different timeDimensions dimensions', () => {
            const v1Query = {
                ...baseV1Query,
                timeDimensions: [
                    {
                        dimension: 'tickets.created_at',
                        granularity: 'day',
                        dateRange: ['2023-01-01', '2023-01-31'],
                    },
                ],
            } as any
            const v2Query = {
                ...baseV2Query,
                timeDimensions: [
                    {
                        dimension: 'tickets.updated_at',
                        granularity: 'day',
                        dateRange: ['2023-01-01', '2023-01-31'],
                    },
                ],
            } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, v1Query, v2Query)

            expect(consoleSpy).toHaveBeenCalledWith(
                'New Stats API and Legacy API queries are different for metric tickets',
                [
                    'timeDimensions[0].dimension: tickets.created_at (V1) !== tickets.updated_at (V2)',
                ],
                v1Query,
                v2Query,
            )
        })

        it('should find no differences between orders', () => {
            const v1Query = {
                ...baseV1Query,
                order: [{ id: 'tickets.count', desc: true }],
            } as any
            const v2Query = {
                ...baseV2Query,
                order: [['tickets.count', 'desc']],
            } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, v1Query, v2Query)

            expect(consoleSpy).not.toHaveBeenCalled()
        })

        it('should handle order differences', () => {
            const v1Query = {
                ...baseV1Query,
                order: [{ id: 'tickets.count', desc: true }],
            } as any
            const v2Query = {
                ...baseV2Query,
                order: [['tickets.count', 'asc']],
            } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, v1Query, v2Query)

            expect(consoleSpy).toHaveBeenCalledWith(
                'New Stats API and Legacy API queries are different for metric tickets',
                [
                    'order: [{\"id\":\"tickets.count\",\"desc\":true}] (V1) !== [[\"tickets.count\",\"asc\"]] (V2)',
                ],
                v1Query,
                v2Query,
            )
        })

        it('should handle order differences when desc is false and V2 asc is true', () => {
            const v1Query = {
                ...baseV1Query,
                order: [{ id: 'tickets.count', desc: false }],
            } as any
            const v2Query = {
                ...baseV2Query,
                order: [['tickets.count', 'asc']],
            } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, v1Query, v2Query)

            expect(consoleSpy).not.toHaveBeenCalled()
        })

        it('should handle order differences when desc is false and V2 desc is true', () => {
            const v1Query = {
                ...baseV1Query,
                order: [{ id: 'tickets.count', desc: false }],
            } as any
            const v2Query = {
                ...baseV2Query,
                order: [['tickets.count', 'desc']],
            } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, v1Query, v2Query)

            expect(consoleSpy).toHaveBeenCalledWith(
                'New Stats API and Legacy API queries are different for metric tickets',
                [
                    'order: [{\"id\":\"tickets.count\",\"desc\":false}] (V1) !== [[\"tickets.count\",\"desc\"]] (V2)',
                ],
                v1Query,
                v2Query,
            )
        })

        it('should not compare metricName, limit, or offset', () => {
            const v1Query = {
                ...baseV1Query,
                metricName: 'different-metric' as any,
                limit: 100,
                offset: 10,
            }
            const v2Query = {
                ...baseV2Query,
                metricName: 'another-metric' as any,
                limit: 200,
                offset: 20,
            }

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, v1Query, v2Query)

            // Should not log any errors because metricName, limit, and offset are not compared
            expect(consoleSpy).not.toHaveBeenCalled()
        })

        it('should handle errors during comparison and return false', () => {
            const badV1Query = {
                ...baseV1Query,
                measures: null,
            } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
            const reportErrorMock = reportError as jest.Mock

            const result = compareAndReportQueries(
                'tickets' as any,
                badV1Query,
                baseV2Query,
            )

            expect(result).toBe(false)
            expect(reportErrorMock).toHaveBeenCalledWith(
                expect.any(TypeError),
                expect.objectContaining({
                    tags: expect.any(Object),
                    extra: expect.objectContaining({
                        message:
                            'Error comparing reporting queries in New Stats API',
                    }),
                }),
            )

            consoleSpy.mockRestore()
        })

        describe('segment-to-filter mappings', () => {
            it('should recognize V1 segment VoiceCall.outboundCalls converted to V2 filters', () => {
                const v1Query = {
                    ...baseV1Query,
                    segments: ['VoiceCall.outboundCalls'],
                    filters: [],
                }
                const v2Query = {
                    ...baseV2Query,
                    segments: [],
                    filters: [
                        {
                            member: 'VoiceCall.direction',
                            operator: ReportingFilterOperator.Equals,
                            values: ['outbound'],
                        },
                    ],
                }

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('voiceCalls' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })

            it('should recognize V1 segment VoiceCall.inboundCalls converted to V2 filters', () => {
                const v1Query = {
                    ...baseV1Query,
                    segments: ['VoiceCall.inboundCalls'],
                    filters: [],
                }
                const v2Query = {
                    ...baseV2Query,
                    segments: [],
                    filters: [
                        {
                            member: 'VoiceCall.direction',
                            operator: ReportingFilterOperator.Equals,
                            values: ['inbound'],
                        },
                    ],
                }

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('voiceCalls' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })

            it('should recognize V1 segment VoiceCall.inboundUnansweredCalls converted to V2 filters', () => {
                const v1Query = {
                    ...baseV1Query,
                    segments: ['VoiceCall.inboundUnansweredCalls'],
                    filters: [],
                }
                const v2Query = {
                    ...baseV2Query,
                    segments: [],
                    filters: [
                        {
                            member: 'VoiceCall.direction',
                            operator: ReportingFilterOperator.Equals,
                            values: ['inbound'],
                        },
                        {
                            member: 'VoiceCall.terminationStatus',
                            operator: ReportingFilterOperator.Equals,
                            values: [
                                'missed',
                                'abandoned',
                                'cancelled',
                                'callback-requested',
                            ],
                        },
                    ],
                }

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('voiceCalls' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })

            it('should recognize V1 segment VoiceCall.inboundMissedCalls converted to V2 filters', () => {
                const v1Query = {
                    ...baseV1Query,
                    segments: ['VoiceCall.inboundMissedCalls'],
                    filters: [],
                }
                const v2Query = {
                    ...baseV2Query,
                    segments: [],
                    filters: [
                        {
                            member: 'VoiceCall.direction',
                            operator: ReportingFilterOperator.Equals,
                            values: ['inbound'],
                        },
                        {
                            member: 'VoiceCall.terminationStatus',
                            operator: ReportingFilterOperator.Equals,
                            values: ['missed'],
                        },
                    ],
                }

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('voiceCalls' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })

            it('should recognize V1 segment VoiceCall.inboundAbandonedCalls converted to V2 filters', () => {
                const v1Query = {
                    ...baseV1Query,
                    segments: ['VoiceCall.inboundAbandonedCalls'],
                    filters: [],
                }
                const v2Query = {
                    ...baseV2Query,
                    segments: [],
                    filters: [
                        {
                            member: 'VoiceCall.direction',
                            operator: ReportingFilterOperator.Equals,
                            values: ['inbound'],
                        },
                        {
                            member: 'VoiceCall.terminationStatus',
                            operator: ReportingFilterOperator.Equals,
                            values: ['abandoned'],
                        },
                    ],
                }

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('voiceCalls' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })

            it('should recognize V1 segment VoiceCall.inboundCancelledCalls converted to V2 filters', () => {
                const v1Query = {
                    ...baseV1Query,
                    segments: ['VoiceCall.inboundCancelledCalls'],
                    filters: [],
                }
                const v2Query = {
                    ...baseV2Query,
                    segments: [],
                    filters: [
                        {
                            member: 'VoiceCall.direction',
                            operator: ReportingFilterOperator.Equals,
                            values: ['inbound'],
                        },
                        {
                            member: 'VoiceCall.terminationStatus',
                            operator: ReportingFilterOperator.Equals,
                            values: ['cancelled'],
                        },
                    ],
                }

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('voiceCalls' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })

            it('should recognize V1 segment VoiceCall.inboundCallbackRequestedCalls converted to V2 filters', () => {
                const v1Query = {
                    ...baseV1Query,
                    segments: ['VoiceCall.inboundCallbackRequestedCalls'],
                    filters: [],
                }
                const v2Query = {
                    ...baseV2Query,
                    segments: [],
                    filters: [
                        {
                            member: 'VoiceCall.direction',
                            operator: ReportingFilterOperator.Equals,
                            values: ['inbound'],
                        },
                        {
                            member: 'VoiceCall.terminationStatus',
                            operator: ReportingFilterOperator.Equals,
                            values: ['callback-requested'],
                        },
                    ],
                }

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('voiceCalls' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })

            it('should recognize V1 segment VoiceCall.inboundUnansweredCallsByAgent converted to V2 filters', () => {
                const v1Query = {
                    ...baseV1Query,
                    segments: ['VoiceCall.inboundUnansweredCallsByAgent'],
                    filters: [],
                }
                const v2Query = {
                    ...baseV2Query,
                    segments: [],
                    filters: [
                        {
                            member: 'VoiceCall.direction',
                            operator: ReportingFilterOperator.Equals,
                            values: ['inbound'],
                        },
                        {
                            member: 'VoiceCall.unansweredByFilteringAgent',
                            operator: ReportingFilterOperator.Equals,
                            values: ['1'],
                        },
                    ],
                }

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('voiceCalls' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })

            it('should recognize V1 segment VoiceCall.inboundAnsweredCallsByAgent converted to V2 filters', () => {
                const v1Query = {
                    ...baseV1Query,
                    segments: ['VoiceCall.inboundAnsweredCallsByAgent'],
                    filters: [],
                }
                const v2Query = {
                    ...baseV2Query,
                    segments: [],
                    filters: [
                        {
                            member: 'VoiceCall.direction',
                            operator: ReportingFilterOperator.Equals,
                            values: ['inbound'],
                        },
                        {
                            member: 'VoiceCall.answeredByFilteringAgent',
                            operator: ReportingFilterOperator.Equals,
                            values: ['1'],
                        },
                    ],
                }

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('voiceCalls' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })

            it('should skip undefined segments in V1 array', () => {
                const v1Query = {
                    ...baseV1Query,
                    segments: [undefined, 'segment1'],
                }
                const v2Query = { ...baseV2Query, segments: ['segment1'] }

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('tickets' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })

            it('should skip undefined segments in V2 array', () => {
                const v1Query = { ...baseV1Query, segments: ['segment1'] }
                const v2Query = {
                    ...baseV2Query,
                    segments: ['segment1', undefined],
                }

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('tickets' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })

            it('should not count V2 filters that come from V1 segments in filter length comparison', () => {
                const v1Query = {
                    ...baseV1Query,
                    segments: ['VoiceCall.outboundCalls'],
                    filters: [
                        {
                            member: 'agentId',
                            operator: 'one-of' as any,
                            values: ['123'],
                        },
                    ],
                }
                const v2Query = {
                    ...baseV2Query,
                    segments: [],
                    filters: [
                        {
                            member: 'agentId',
                            operator: 'one-of' as any,
                            values: ['123'],
                        },
                        {
                            member: 'VoiceCall.direction',
                            operator: ReportingFilterOperator.Equals,
                            values: ['outbound'],
                        },
                    ],
                }

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('voiceCalls' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })
        })

        describe('order edge cases', () => {
            it('should handle empty order arrays', () => {
                const v1Query = {
                    ...baseV1Query,
                    order: [],
                } as any
                const v2Query = {
                    ...baseV2Query,
                    order: [],
                } as any

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('tickets' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })

            it('should handle undefined order', () => {
                const v1Query = {
                    ...baseV1Query,
                    order: undefined,
                } as any
                const v2Query = {
                    ...baseV2Query,
                    order: undefined,
                } as any

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('tickets' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })

            it('should handle order with empty id in V1', () => {
                const v1Query = {
                    ...baseV1Query,
                    order: [{ id: '', desc: false }],
                } as any
                const v2Query = {
                    ...baseV2Query,
                    order: [['tickets.count', 'asc']],
                } as any

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('tickets' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })

            it('should handle order with empty string in V2', () => {
                const v1Query = {
                    ...baseV1Query,
                    order: [{ id: 'tickets.count', desc: true }],
                } as any
                const v2Query = {
                    ...baseV2Query,
                    order: [['', 'desc']],
                } as any

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('tickets' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })
        })

        describe('timeDimensions edge cases', () => {
            it('should not compare individual time dimensions when lengths differ', () => {
                const v1Query = {
                    ...baseV1Query,
                    timeDimensions: [
                        {
                            dimension: 'tickets.created_at',
                            granularity: 'day',
                            dateRange: ['2023-01-01', '2023-01-31'],
                        },
                    ],
                } as any
                const v2Query = {
                    ...baseV2Query,
                    timeDimensions: [],
                } as any

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('tickets' as any, v1Query, v2Query)

                expect(consoleSpy).toHaveBeenCalledWith(
                    'New Stats API and Legacy API queries are different for metric tickets',
                    ['timeDimensions length: 1 (V1) !== 0 (V2)'],
                    v1Query,
                    v2Query,
                )
                consoleSpy.mockRestore()
            })
        })

        describe('membersToIgnore', () => {
            it('should ignore TicketEnriched.totalCustomFieldIdsToMatch filter when present in V2 but not V1', () => {
                const v1Query = {
                    ...baseV1Query,
                    filters: [
                        {
                            member: 'agentId',
                            operator: 'one-of' as any,
                            values: ['123'],
                        },
                    ],
                }
                const v2Query = {
                    ...baseV2Query,
                    filters: [
                        {
                            member: 'agentId',
                            operator: 'one-of' as any,
                            values: ['123'],
                        },
                        {
                            member: 'TicketEnriched.totalCustomFieldIdsToMatch',
                            operator: 'equals' as any,
                            values: ['5'],
                        },
                    ],
                }

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('tickets' as any, v1Query, v2Query)

                expect(consoleSpy).not.toHaveBeenCalled()
                consoleSpy.mockRestore()
            })

            it('should still report V1 filter differences when membersToIgnore filter causes early return', () => {
                const v1Query = {
                    ...baseV1Query,
                    filters: [
                        {
                            member: 'agentId',
                            operator: 'one-of' as any,
                            values: ['123'],
                        },
                    ],
                }
                const v2Query = {
                    ...baseV2Query,
                    filters: [
                        {
                            member: 'TicketEnriched.totalCustomFieldIdsToMatch',
                            operator: 'equals' as any,
                            values: ['5'],
                        },
                        {
                            member: 'agentId',
                            operator: 'one-of' as any,
                            values: ['456'],
                        },
                    ],
                }

                const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                compareAndReportQueries('tickets' as any, v1Query, v2Query)

                expect(consoleSpy).toHaveBeenCalledWith(
                    'New Stats API and Legacy API queries are different for metric tickets',
                    [
                        'V1 filter not found in V2: {"member":"agentId","operator":"one-of","values":["123"]}',
                        'V2 filter not found in V1: {"member":"agentId","operator":"one-of","values":["456"]}',
                    ],
                    v1Query,
                    v2Query,
                )
                consoleSpy.mockRestore()
            })
        })
    })
})
