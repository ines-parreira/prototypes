import { ReportingStatsOperatorsEnum } from '@gorgias/helpdesk-types'

import { ScopeMeta } from 'domains/reporting/models/scopes/scope'
import { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

import { createScopeFilters } from '../utils'

describe('utils', () => {
    describe('createScopeFilters', () => {
        const basePeriodFilters: StatsFiltersWithLogicalOperator = {
            period: {
                start_datetime: '2025-09-22T00:00:00Z',
                end_datetime: '2025-09-22T23:59:59Z',
            },
        }

        it('should create basic period filters', () => {
            const scopeConfig: ScopeMeta = {
                filters: [],
            }

            const result = createScopeFilters(basePeriodFilters, scopeConfig)

            expect(result).toEqual([
                {
                    member: 'periodStart',
                    operator: ReportingStatsOperatorsEnum.AfterDate,
                    values: ['2025-09-22T00:00:00Z'],
                },
                {
                    member: 'periodEnd',
                    operator: ReportingStatsOperatorsEnum.BeforeDate,
                    values: ['2025-09-22T23:59:59Z'],
                },
            ])
        })

        it('should handle scope config with undefined filters', () => {
            const scopeConfig: ScopeMeta = {}

            const result = createScopeFilters(basePeriodFilters, scopeConfig)

            expect(result).toEqual([
                {
                    member: 'periodStart',
                    operator: ReportingStatsOperatorsEnum.AfterDate,
                    values: ['2025-09-22T00:00:00Z'],
                },
                {
                    member: 'periodEnd',
                    operator: ReportingStatsOperatorsEnum.BeforeDate,
                    values: ['2025-09-22T23:59:59Z'],
                },
            ])
        })

        it('should add agents filter when present in scope config and stat filters', () => {
            const scopeConfig: ScopeMeta = {
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
                member: 'agents',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['123', '456'],
            })
        })

        it('should add channels filter when present in scope config and stat filters', () => {
            const scopeConfig: ScopeMeta = {
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
                member: 'channels',
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: ['email', 'chat'],
            })
        })

        it('should add integrations filter when present in scope config and stat filters', () => {
            const scopeConfig: ScopeMeta = {
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
                member: 'integrations',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['789', '101112'],
            })
        })

        describe('tags filter', () => {
            it('should add tags filter with OneOf operator', () => {
                const scopeConfig: ScopeMeta = {
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
        })

        describe('CSAT metrics filters', () => {
            it('should add score filter when present', () => {
                const scopeConfig: ScopeMeta = {
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
                member: 'agents',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['123', '456'],
            })
            expect(result).toContainEqual({
                member: 'channels',
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
                member: 'agents',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['123'],
            })
            expect(result).not.toContainEqual(
                expect.objectContaining({ member: 'channels' }),
            )
        })

        it('should skip filters not present in stat filters even if defined in scope config', () => {
            const scopeConfig: ScopeMeta = {
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
                member: 'agents',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['123'],
            })
            expect(result).not.toContainEqual(
                expect.objectContaining({ member: 'channels' }),
            )
        })

        describe('data type conversion', () => {
            it('should convert agent values to strings', () => {
                const scopeConfig: ScopeMeta = {
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
                    member: 'agents',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['123', '456', '789'],
                })
            })

            it('should convert integration values to strings', () => {
                const scopeConfig: ScopeMeta = {
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
                    member: 'integrations',
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: ['100', '200'],
                })
            })

            it('should convert tag values to strings', () => {
                const scopeConfig: ScopeMeta = {
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
                    filters: ['tags'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    tags: [],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'tags',
                    values: [],
                })
            })

            it('should handle empty arrays for customFields', () => {
                const scopeConfig: ScopeMeta = {
                    filters: ['customFields'],
                }

                const statFilters: StatsFiltersWithLogicalOperator = {
                    ...basePeriodFilters,
                    customFields: [],
                }

                const result = createScopeFilters(statFilters, scopeConfig)

                expect(result).toContainEqual({
                    member: 'customFields',
                    values: [],
                })
            })
        })
    })
})
