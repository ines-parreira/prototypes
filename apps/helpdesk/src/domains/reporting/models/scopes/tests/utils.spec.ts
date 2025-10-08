import { ReportingStatsOperatorsEnum } from '@gorgias/helpdesk-types'

import { ScopeMeta } from 'domains/reporting/models/scopes/scope'
import {
    compareReportingQueries,
    createScopeFilters,
} from 'domains/reporting/models/scopes/utils'
import { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

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

        it('should handle error in createScopeFilters', () => {
            const scopeConfig: ScopeMeta = {
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
                    values: ['2025-09-22T00:00:00Z'],
                },
                {
                    member: 'periodEnd',
                    operator: ReportingStatsOperatorsEnum.BeforeDate,
                    values: ['2025-09-22T23:59:59Z'],
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
                    member: 'agents',
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
                    member: 'agents',
                    operator: 'one-of' as any,
                    values: ['123', '456'],
                },
            ],
            metricName: 'tickets' as any,
            timezone: 'UTC',
        }

        it('should return identical queries as equal', () => {
            const result = compareReportingQueries(baseV1Query, baseV2Query)

            expect(result.areEqual).toBe(true)
            expect(result.differences).toHaveLength(0)
            expect(result.summary).toBe('Queries are identical')
        })

        it('should detect differences in measures', () => {
            const v2Query = {
                ...baseV2Query,
                measures: ['orders.count'],
            } as any
            const result = compareReportingQueries(baseV1Query, v2Query)

            expect(result.areEqual).toBe(false)
            expect(result.differences).toContain(
                'measures: ["tickets.count"] !== ["orders.count"]',
            )
        })

        it('should detect differences in dimensions', () => {
            const v2Query = {
                ...baseV2Query,
                dimensions: ['orders.status'],
            } as any
            const result = compareReportingQueries(baseV1Query, v2Query)

            expect(result.areEqual).toBe(false)
            expect(result.differences).toContain(
                'dimensions: ["tickets.status"] !== ["orders.status"]',
            )
        })

        it('should detect differences in timezone', () => {
            const v2Query = { ...baseV2Query, timezone: 'EST' } as any
            const result = compareReportingQueries(baseV1Query, v2Query)

            expect(result.areEqual).toBe(false)
            expect(result.differences).toContain('timezone: UTC !== EST')
        })

        it('should detect differences in filters', () => {
            const v2Query = {
                ...baseV2Query,
                filters: [
                    {
                        member: 'agents',
                        operator: 'one-of',
                        values: ['789'],
                    },
                ],
            } as any
            const result = compareReportingQueries(baseV1Query, v2Query)

            expect(result.areEqual).toBe(false)
            expect(result.differences).toContain(
                'filter not found in v2: {"member":"agents","operator":"one-of","values":["123","456"]}',
            )
        })

        it('should detect different filter lengths', () => {
            const v1Query = {
                ...baseV1Query,
                filters: [
                    { member: 'agents', operator: 'one-of', values: ['123'] },
                    {
                        member: 'channels',
                        operator: 'one-of',
                        values: ['email'],
                    },
                ],
            } as any
            const v2Query = {
                ...baseV2Query,
                filters: [
                    { member: 'agents', operator: 'one-of', values: ['123'] },
                ],
            } as any
            const result = compareReportingQueries(v1Query, v2Query)

            expect(result.areEqual).toBe(false)
            expect(result.differences).toContain('filters length: 2 !== 1')
        })

        it('should handle filters in different order', () => {
            const v1Query = {
                ...baseV1Query,
                filters: [
                    { member: 'agents', operator: 'one-of', values: ['123'] },
                    {
                        member: 'channels',
                        operator: 'one-of',
                        values: ['email'],
                    },
                ],
            } as any
            const v2Query = {
                ...baseV2Query,
                filters: [
                    {
                        member: 'channels',
                        operator: 'one-of',
                        values: ['email'],
                    },
                    { member: 'agents', operator: 'one-of', values: ['123'] },
                ],
            } as any
            const result = compareReportingQueries(v1Query, v2Query)

            expect(result.areEqual).toBe(true)
        })

        it('should detect differences in segments', () => {
            const v1Query = { ...baseV1Query, segments: ['segment1'] }
            const v2Query = { ...baseV2Query, segments: ['segment2'] }
            const result = compareReportingQueries(v1Query, v2Query)

            expect(result.areEqual).toBe(false)
            expect(result.differences).toContain(
                'segments: ["segment1"] !== ["segment2"]',
            )
        })

        it('should handle empty arrays', () => {
            const v1Query = { ...baseV1Query, measures: [], dimensions: [] }
            const v2Query = { ...baseV2Query, measures: [], dimensions: [] }
            const result = compareReportingQueries(v1Query, v2Query)

            expect(result.areEqual).toBe(true)
        })

        it('should handle undefined values', () => {
            const v1Query = { ...baseV1Query, timezone: undefined }
            const v2Query = { ...baseV2Query, timezone: undefined }
            const result = compareReportingQueries(v1Query, v2Query)

            expect(result.areEqual).toBe(true)
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
            const result = compareReportingQueries(v1Query, v2Query)

            expect(result.areEqual).toBe(false)
            expect(result.differences).toContain(
                'timeDimensions[0].granularity: day !== month',
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
            const result = compareReportingQueries(v1Query, v2Query)

            expect(result.areEqual).toBe(false)
            expect(result.differences).toContain(
                'timeDimensions length: 2 !== 1',
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
            const result = compareReportingQueries(v1Query, v2Query)

            expect(result.areEqual).toBe(false)
            expect(result.differences).toContain(
                'timeDimensions[0].dimension: tickets.created_at !== tickets.updated_at',
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
            const result = compareReportingQueries(v1Query, v2Query)

            expect(result.areEqual).toBe(false)
            expect(result.differences).toContain(
                'order: [{"id":"tickets.count","desc":true}] !== [{"id":"tickets.count","desc":false}]',
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
            const result = compareReportingQueries(v1Query, v2Query)

            // Should be equal because metricName, limit, and offset are not compared
            expect(result.areEqual).toBe(true)
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

            const result = compareReportingQueries(v1Query, v2Query)

            expect(result.areEqual).toBe(false)
            expect(result.differences[0]).toContain(
                'Converting circular structure to JSON',
            )
            expect(result.summary).toBe('Error comparing reporting queries')
        })
    })
})
