import { ReportingStatsOperatorsEnum } from '@gorgias/helpdesk-types'

import { MetricScope } from 'domains/reporting/hooks/metricNames'
import { ScopeMeta } from 'domains/reporting/models/scopes/scope'
import {
    compareAndReportQueries,
    createScopeFilters,
} from 'domains/reporting/models/scopes/utils'
import { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

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
                scope: MetricScope.TicketsOpen,
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
                scope: MetricScope.TicketsOpen,
                filters: ['agents'],
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

        it('should add channels filter when present in scope config and stat filters', () => {
            const scopeConfig: ScopeMeta = {
                scope: MetricScope.TicketsOpen,
                filters: ['channels'],
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
                scope: MetricScope.TicketsOpen,
                filters: ['integrations'],
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
                scope: MetricScope.TicketsOpen,
                filters: ['stores'],
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

        describe('tags filter', () => {
            it('should add tags filter with OneOf operator', () => {
                const scopeConfig: ScopeMeta = {
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
        })

        describe('customFields filter', () => {
            it('should add customFields filter with OneOf operator', () => {
                const scopeConfig: ScopeMeta = {
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
        })

        it('should handle multiple filters together', () => {
            const scopeConfig: ScopeMeta = {
                scope: MetricScope.TicketsOpen,
                filters: ['agents', 'channels', 'tags', 'score'],
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
                scope: MetricScope.TicketsOpen,
                filters: ['agents'], // Only agents filter is allowed
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
                scope: MetricScope.TicketsOpen,
                filters: ['agents', 'channels'],
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
                    scope: MetricScope.TicketsOpen,
                    filters: ['agents'],
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
                    scope: MetricScope.TicketsOpen,
                    filters: ['integrations'],
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
                    scope: MetricScope.TicketsOpen,
                    filters: ['stores'],
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
        })

        it('should handle error in createScopeFilters', () => {
            const scopeConfig: ScopeMeta = {
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
            )
        })

        it('should detect differences in timezone', () => {
            const v2Query = { ...baseV2Query, timezone: 'EST' } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, baseV1Query, v2Query)

            expect(consoleSpy).toHaveBeenCalledWith(
                'New Stats API and Legacy API queries are different for metric tickets',
                ['timezone: UTC !== EST'],
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

            // Should not log any errors for equivalent queries
            expect(consoleSpy).not.toHaveBeenCalled()
        })

        it('should detect differences in segments', () => {
            const v1Query = { ...baseV1Query, segments: ['segment1'] }
            const v2Query = { ...baseV2Query, segments: ['segment2'] }

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, v1Query, v2Query)

            expect(consoleSpy).toHaveBeenCalledWith(
                'New Stats API and Legacy API queries are different for metric tickets',
                ['segments: ["segment1"] (V1) !== ["segment2"] (V2)'],
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
            )
        })

        it('should handle order differences', () => {
            const v1Query = {
                ...baseV1Query,
                order: [{ id: 'tickets.count', desc: true }],
            } as any
            const v2Query = {
                ...baseV2Query,
                order: [{ id: 'tickets.count', desc: false }],
            } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, v1Query, v2Query)

            expect(consoleSpy).toHaveBeenCalledWith(
                'New Stats API and Legacy API queries are different for metric tickets',
                [
                    'order: [{"id":"tickets.count","desc":true}] (V1) !== [{"id":"tickets.count","desc":false}] (V2)',
                ],
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

        it('should handle JSON.stringify error with circular reference', () => {
            // Create objects with circular references
            const circularObj1: any = { measures: ['tickets.count'] }
            circularObj1.self = circularObj1

            const circularObj2: any = { measures: ['tickets.count'] }
            circularObj2.self = circularObj2

            const v1Query = {
                ...baseV1Query,
                order: circularObj1,
            } as any

            const v2Query = {
                ...baseV2Query,
                order: circularObj2,
            } as any

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            compareAndReportQueries('tickets' as any, v1Query, v2Query)

            // Should log error due to circular reference
            expect(consoleSpy).toHaveBeenCalled()
        })
    })
})
