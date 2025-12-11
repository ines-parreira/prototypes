import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import moment from 'moment'
import { Provider } from 'react-redux'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    aggregateResourceMetrics,
    createV1Query,
    parseIntentsData,
    parseIntentsDataByResource,
    useAllResourcesMetrics,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/resourceMetrics'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

jest.mock('domains/reporting/hooks/useMetric')
jest.mock('domains/reporting/hooks/useMetricPerDimension')
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
    () => ({
        useGetCustomTicketsFieldsDefinitionData: jest.fn(() => ({
            outcomeCustomFieldId: 123,
            intentCustomFieldId: 456,
        })),
    }),
)
jest.mock('hooks/useAppSelector', () => jest.fn(() => 'America/New_York'))

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
})

const mockStore = {
    getState: () => ({
        currentUser: {
            data: {
                timezone: 'America/New_York',
            },
        },
    }),
    subscribe: jest.fn(),
    dispatch: jest.fn(),
}

const wrapper = ({ children }: any) => (
    <Provider store={mockStore as any}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </Provider>
)

describe('createV1Query', () => {
    const periodStart = moment()
    const periodEnd = periodStart.clone().add(7, 'days')
    const resourceSourceId = 123
    const resourceSourceSetId = 456
    const timezone = 'America/New_York'

    const baseStatsFilters: StatsFilters = {
        [FilterKey.Period]: {
            start_datetime: periodStart.toISOString(),
            end_datetime: periodEnd.toISOString(),
        },
    }

    describe('base query structure', () => {
        it('should produce query with base filters', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTask.ticketCount',
            )

            expect(query).toMatchObject({
                metricName: METRIC_NAMES.KNOWLEDGE_TICKETS,
                measures: ['TicketInsightsTask.ticketCount'],
                timezone,
            })

            expect(query.filters).toContainEqual({
                member: 'TicketInsightsTask.resourceSourceId',
                operator: 'equals',
                values: [String(resourceSourceId)],
            })
            expect(query.filters).toContainEqual({
                member: 'TicketInsightsTask.resourceSourceSetId',
                operator: 'equals',
                values: [String(resourceSourceSetId)],
            })
            expect(query.filters).toContainEqual({
                member: 'TicketEnriched.isTrashed',
                operator: 'equals',
                values: ['0'],
            })
            expect(query.filters).toContainEqual({
                member: 'TicketEnriched.isSpam',
                operator: 'equals',
                values: ['0'],
            })
        })

        it('should include period filters', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTask.ticketCount',
            )

            expect(query.filters).toContainEqual({
                member: 'TicketEnriched.periodStart',
                operator: 'afterDate',
                values: [baseStatsFilters.period.start_datetime],
            })
            expect(query.filters).toContainEqual({
                member: 'TicketEnriched.periodEnd',
                operator: 'beforeDate',
                values: [baseStatsFilters.period.end_datetime],
            })
        })

        it('should include time dimensions', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTask.ticketCount',
            )

            expect(query.timeDimensions).toEqual([
                {
                    dimension: 'TicketEnriched.createdDatetime',
                    dateRange: [
                        baseStatsFilters.period.start_datetime,
                        baseStatsFilters.period.end_datetime,
                    ],
                },
            ])
        })

        it('should only include specific resource types', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTask.ticketCount',
            )

            expect(query.filters).toContainEqual({
                member: 'TicketInsightsTask.resourceType',
                operator: 'equals',
                values: [
                    'GUIDANCE',
                    'ARTICLE',
                    'MACRO',
                    'EXTERNAL_SNIPPET',
                    'FILE_EXTERNAL_SNIPPET',
                    'STORE_WEBSITE_QUESTION_SNIPPET',
                ],
            })
        })
    })

    describe('dimensions override', () => {
        it('should use standard dimensions for non-intents metrics', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTask.ticketCount',
            )

            expect(query.dimensions).toEqual([
                'TicketInsightsTask.resourceType',
                'TicketInsightsTask.resourceSourceId',
                'TicketInsightsTask.resourceSourceSetId',
            ])
        })

        it('should use extended dimensions for intents metrics', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_INTENTS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTask.ticketCount',
            )

            expect(query.dimensions).toEqual([
                'TicketCustomFieldsEnriched.top2LevelsValue',
                'TicketInsightsTask.resourceType',
                'TicketInsightsTask.resourceSourceId',
                'TicketInsightsTask.resourceSourceSetId',
            ])
        })
    })

    describe('custom field filters', () => {
        it('should add custom field filters when present', () => {
            const customFieldId = 789
            const filtersWithCustomField: StatsFilters = {
                ...baseStatsFilters,
                [FilterKey.CustomFields]: [
                    {
                        customFieldId,
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['Value1', 'Value2'],
                    },
                ],
            }

            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_HANDOVER_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                filtersWithCustomField,
                timezone,
                'TicketInsightsTask.ticketCount',
            )

            expect(query.filters).toContainEqual({
                member: 'TicketCustomFieldsEnriched.customFieldId',
                operator: 'equals',
                values: [String(customFieldId)],
            })
            expect(query.filters).toContainEqual({
                member: 'TicketCustomFieldsEnriched.valueString',
                operator: 'equals',
                values: ['Value1', 'Value2'],
            })
        })

        it('should use notEquals operator for NOT_ONE_OF', () => {
            const customFieldId = 789
            const filtersWithCustomField: StatsFilters = {
                ...baseStatsFilters,
                [FilterKey.CustomFields]: [
                    {
                        customFieldId,
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                        values: ['Spam', 'NoReply'],
                    },
                ],
            }

            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_INTENTS,
                resourceSourceId,
                resourceSourceSetId,
                filtersWithCustomField,
                timezone,
                'TicketInsightsTask.ticketCount',
            )

            expect(query.filters).toContainEqual({
                member: 'TicketCustomFieldsEnriched.valueString',
                operator: 'notEquals',
                values: ['Spam', 'NoReply'],
            })
        })

        it('should handle multiple custom field filters', () => {
            const filtersWithMultipleCustomFields: StatsFilters = {
                ...baseStatsFilters,
                [FilterKey.CustomFields]: [
                    {
                        customFieldId: 111,
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['ValueA'],
                    },
                    {
                        customFieldId: 222,
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                        values: ['ValueB'],
                    },
                ],
            }

            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_CSAT,
                resourceSourceId,
                resourceSourceSetId,
                filtersWithMultipleCustomFields,
                timezone,
                'TicketInsightsTask.avgSurveyScore',
            )

            expect(query.filters).toContainEqual({
                member: 'TicketCustomFieldsEnriched.customFieldId',
                operator: 'equals',
                values: ['111'],
            })
            expect(query.filters).toContainEqual({
                member: 'TicketCustomFieldsEnriched.valueString',
                operator: 'equals',
                values: ['ValueA'],
            })

            expect(query.filters).toContainEqual({
                member: 'TicketCustomFieldsEnriched.customFieldId',
                operator: 'equals',
                values: ['222'],
            })
            expect(query.filters).toContainEqual({
                member: 'TicketCustomFieldsEnriched.valueString',
                operator: 'notEquals',
                values: ['ValueB'],
            })
        })

        it('should not add custom field filters when absent', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTask.ticketCount',
            )

            const customFieldFilters = query.filters.filter(
                (f: any) =>
                    f.member === 'TicketCustomFieldsEnriched.customFieldId' ||
                    f.member === 'TicketCustomFieldsEnriched.valueString',
            )

            expect(customFieldFilters).toHaveLength(0)
        })
    })

    describe('different metric types', () => {
        it('should handle ticket count metric', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTask.ticketCount',
            )

            expect(query.metricName).toBe(METRIC_NAMES.KNOWLEDGE_TICKETS)
            expect(query.measures).toEqual(['TicketInsightsTask.ticketCount'])
        })

        it('should handle handover tickets metric', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_HANDOVER_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTask.ticketCount',
            )

            expect(query.metricName).toBe(
                METRIC_NAMES.KNOWLEDGE_HANDOVER_TICKETS,
            )
            expect(query.measures).toEqual(['TicketInsightsTask.ticketCount'])
        })

        it('should handle CSAT metric', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_CSAT,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTask.avgSurveyScore',
            )

            expect(query.metricName).toBe(METRIC_NAMES.KNOWLEDGE_CSAT)
            expect(query.measures).toEqual([
                'TicketInsightsTask.avgSurveyScore',
            ])
        })

        it('should handle intents metric', () => {
            const query = createV1Query(
                METRIC_NAMES.KNOWLEDGE_INTENTS,
                resourceSourceId,
                resourceSourceSetId,
                baseStatsFilters,
                timezone,
                'TicketInsightsTask.ticketCount',
            )

            expect(query.metricName).toBe(METRIC_NAMES.KNOWLEDGE_INTENTS)
            expect(query.measures).toEqual(['TicketInsightsTask.ticketCount'])
        })
    })
})

describe('parseIntentsData', () => {
    describe('sorting by ticket count', () => {
        it('should sort intents by ticket count descending', () => {
            const mockData = [
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Billing::Payment',
                    'TicketInsightsTask.ticketCount': '5',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Support::Technical',
                    'TicketInsightsTask.ticketCount': '15',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Shipping::Delay',
                    'TicketInsightsTask.ticketCount': '10',
                },
            ]

            const result = parseIntentsData(mockData, false)

            expect(result).toEqual([
                'Support::Technical',
                'Shipping::Delay',
                'Billing::Payment',
            ])
        })

        it('should handle missing or invalid ticket counts', () => {
            const mockData = [
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Valid::Intent',
                    'TicketInsightsTask.ticketCount': '10',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Missing::Count',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Invalid::Count',
                    'TicketInsightsTask.ticketCount': 'not-a-number',
                },
            ]

            const result = parseIntentsData(mockData, false)

            expect(result?.[0]).toBe('Valid::Intent')
        })
    })

    describe('filtering', () => {
        it('should filter out empty string intents', () => {
            const mockData = [
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue': '',
                    'TicketInsightsTask.ticketCount': '10',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Valid::Intent',
                    'TicketInsightsTask.ticketCount': '5',
                },
            ]

            const result = parseIntentsData(mockData, false)

            expect(result).toEqual(['Valid::Intent'])
        })

        it('should filter out null and undefined intents', () => {
            const mockData = [
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue': null,
                    'TicketInsightsTask.ticketCount': '10',
                },
                {
                    'TicketInsightsTask.ticketCount': '8',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Valid::Intent',
                    'TicketInsightsTask.ticketCount': '5',
                },
            ]

            const result = parseIntentsData(mockData, false)

            expect(result).toEqual(['Valid::Intent'])
        })
    })

    describe('edge cases', () => {
        it('should return undefined when allData is undefined', () => {
            expect(parseIntentsData(undefined, false)).toBeUndefined()
        })

        it('should return undefined when isError is true', () => {
            const mockData = [
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Test::Intent',
                    'TicketInsightsTask.ticketCount': '5',
                },
            ]

            expect(parseIntentsData(mockData, true)).toBeUndefined()
        })

        it('should return empty array when allData is empty', () => {
            expect(parseIntentsData([], false)).toEqual([])
        })
    })

    describe('complete scenarios', () => {
        it('should handle realistic data with sorting, filtering, and transformation', () => {
            const mockData = [
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Order::Status',
                    'TicketInsightsTask.ticketCount': '100',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue': '',
                    'TicketInsightsTask.ticketCount': '50',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Shipping::Inquiry',
                    'TicketInsightsTask.ticketCount': '75',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Returns::Process',
                    'TicketInsightsTask.ticketCount': '60',
                },
            ]

            const result = parseIntentsData(mockData, false)

            expect(result).toEqual([
                'Order::Status',
                'Shipping::Inquiry',
                'Returns::Process',
            ])
        })
    })
})

describe('parseIntentsDataByResource', () => {
    describe('grouping by resource', () => {
        it('should group intents by resourceSourceId and resourceSourceSetId', () => {
            const mockData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Billing::Payment',
                    'TicketInsightsTask.ticketCount': '10',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Support::Technical',
                    'TicketInsightsTask.ticketCount': '5',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '101',
                    'TicketInsightsTask.resourceSourceSetId': '201',
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Shipping::Delay',
                    'TicketInsightsTask.ticketCount': '15',
                },
            ]

            const result = parseIntentsDataByResource(mockData, false)

            expect(result).toEqual({
                '100-200': ['Billing::Payment', 'Support::Technical'],
                '101-201': ['Shipping::Delay'],
            })
        })

        it('should handle multiple resources with different intents', () => {
            const mockData = [
                {
                    'TicketInsightsTask.resourceSourceId': '1',
                    'TicketInsightsTask.resourceSourceSetId': '10',
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'Intent::A',
                    'TicketInsightsTask.ticketCount': '20',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '1',
                    'TicketInsightsTask.resourceSourceSetId': '10',
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'Intent::B',
                    'TicketInsightsTask.ticketCount': '15',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '2',
                    'TicketInsightsTask.resourceSourceSetId': '20',
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'Intent::C',
                    'TicketInsightsTask.ticketCount': '30',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '2',
                    'TicketInsightsTask.resourceSourceSetId': '20',
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'Intent::D',
                    'TicketInsightsTask.ticketCount': '25',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '3',
                    'TicketInsightsTask.resourceSourceSetId': '30',
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'Intent::E',
                    'TicketInsightsTask.ticketCount': '5',
                },
            ]

            const result = parseIntentsDataByResource(mockData, false)

            expect(result).toEqual({
                '1-10': ['Intent::A', 'Intent::B'],
                '2-20': ['Intent::C', 'Intent::D'],
                '3-30': ['Intent::E'],
            })
        })
    })

    describe('sorting within each resource group', () => {
        it('should sort intents by ticket count descending within each resource', () => {
            const mockData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'Low::Count',
                    'TicketInsightsTask.ticketCount': '5',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'High::Count',
                    'TicketInsightsTask.ticketCount': '50',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Medium::Count',
                    'TicketInsightsTask.ticketCount': '25',
                },
            ]

            const result = parseIntentsDataByResource(mockData, false)

            expect(result['100-200']).toEqual([
                'High::Count',
                'Medium::Count',
                'Low::Count',
            ])
        })
    })

    describe('filtering', () => {
        it('should filter out empty string intents', () => {
            const mockData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue': '',
                    'TicketInsightsTask.ticketCount': '10',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Valid::Intent',
                    'TicketInsightsTask.ticketCount': '5',
                },
            ]

            const result = parseIntentsDataByResource(mockData, false)

            expect(result['100-200']).toEqual(['Valid::Intent'])
        })

        it('should filter out null and undefined intents', () => {
            const mockData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue': null,
                    'TicketInsightsTask.ticketCount': '10',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '8',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Valid::Intent',
                    'TicketInsightsTask.ticketCount': '5',
                },
            ]

            const result = parseIntentsDataByResource(mockData, false)

            expect(result['100-200']).toEqual(['Valid::Intent'])
        })
    })

    describe('edge cases', () => {
        it('should return empty object when allData is undefined', () => {
            expect(parseIntentsDataByResource(undefined, false)).toEqual({})
        })

        it('should return empty object when isError is true', () => {
            const mockData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Test::Intent',
                    'TicketInsightsTask.ticketCount': '5',
                },
            ]

            expect(parseIntentsDataByResource(mockData, true)).toEqual({})
        })

        it('should return empty object when allData is empty', () => {
            expect(parseIntentsDataByResource([], false)).toEqual({})
        })

        it('should handle resources with no valid intents', () => {
            const mockData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue': '',
                    'TicketInsightsTask.ticketCount': '10',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue': null,
                    'TicketInsightsTask.ticketCount': '5',
                },
            ]

            const result = parseIntentsDataByResource(mockData, false)

            expect(result['100-200']).toEqual([])
        })
    })
})

describe('aggregateResourceMetrics', () => {
    describe('basic aggregation', () => {
        it('should aggregate all metrics for a single resource', () => {
            const ticketsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '50',
                },
            ]

            const handoverData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '5',
                },
            ]

            const csatData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.avgSurveyScore': '4.5',
                },
            ]

            const intentsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'Intent::A',
                    'TicketInsightsTask.ticketCount': '10',
                },
            ]

            const result = aggregateResourceMetrics(
                ticketsData,
                handoverData,
                csatData,
                intentsData,
            )

            expect(result).toEqual([
                {
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    tickets: 50,
                    handoverTickets: 5,
                    csat: 4.5,
                    intents: ['Intent::A'],
                },
            ])
        })

        it('should aggregate metrics for multiple resources', () => {
            const ticketsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '50',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '101',
                    'TicketInsightsTask.resourceSourceSetId': '201',
                    'TicketInsightsTask.ticketCount': '30',
                },
            ]

            const handoverData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '5',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '101',
                    'TicketInsightsTask.resourceSourceSetId': '201',
                    'TicketInsightsTask.ticketCount': '3',
                },
            ]

            const result = aggregateResourceMetrics(
                ticketsData,
                handoverData,
                undefined,
                undefined,
            )

            expect(result).toHaveLength(2)
            expect(result).toContainEqual({
                resourceSourceId: 100,
                resourceSourceSetId: 200,
                tickets: 50,
                handoverTickets: 5,
                csat: null,
                intents: null,
            })
            expect(result).toContainEqual({
                resourceSourceId: 101,
                resourceSourceSetId: 201,
                tickets: 30,
                handoverTickets: 3,
                csat: null,
                intents: null,
            })
        })
    })

    describe('partial data handling', () => {
        it('should handle resource with only tickets data', () => {
            const ticketsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '50',
                },
            ]

            const result = aggregateResourceMetrics(
                ticketsData,
                undefined,
                undefined,
                undefined,
            )

            expect(result).toEqual([
                {
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    tickets: 50,
                    handoverTickets: null,
                    csat: null,
                    intents: null,
                },
            ])
        })
    })

    describe('data merging', () => {
        it('should merge data from different sources for same resource', () => {
            const ticketsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '50',
                },
            ]

            const handoverData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '5',
                },
            ]

            const result = aggregateResourceMetrics(
                ticketsData,
                handoverData,
                undefined,
                undefined,
            )

            expect(result).toEqual([
                {
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    tickets: 50,
                    handoverTickets: 5,
                    csat: null,
                    intents: null,
                },
            ])
        })

        it('should handle resources appearing in some but not all data sources', () => {
            const ticketsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '50',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '101',
                    'TicketInsightsTask.resourceSourceSetId': '201',
                    'TicketInsightsTask.ticketCount': '30',
                },
            ]

            const handoverData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '5',
                },
            ]

            const result = aggregateResourceMetrics(
                ticketsData,
                handoverData,
                undefined,
                undefined,
            )

            expect(result).toHaveLength(2)
            expect(result).toContainEqual({
                resourceSourceId: 100,
                resourceSourceSetId: 200,
                tickets: 50,
                handoverTickets: 5,
                csat: null,
                intents: null,
            })
            expect(result).toContainEqual({
                resourceSourceId: 101,
                resourceSourceSetId: 201,
                tickets: 30,
                handoverTickets: null,
                csat: null,
                intents: null,
            })
        })
    })

    describe('CSAT handling', () => {
        it('should round CSAT to 2 decimal places', () => {
            const csatData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.avgSurveyScore': '4.567890123',
                },
            ]

            const result = aggregateResourceMetrics(
                undefined,
                undefined,
                csatData,
                undefined,
            )

            expect(result[0].csat).toBe(4.57)
        })
    })

    describe('intents handling', () => {
        it('should include sorted intents for resources', () => {
            const intentsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'Intent::A',
                    'TicketInsightsTask.ticketCount': '5',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'Intent::B',
                    'TicketInsightsTask.ticketCount': '10',
                },
            ]

            const ticketsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '50',
                },
            ]

            const result = aggregateResourceMetrics(
                ticketsData,
                undefined,
                undefined,
                intentsData,
            )

            expect(result[0].intents).toEqual(['Intent::B', 'Intent::A'])
        })

        it('should handle intents for multiple resources', () => {
            const intentsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'Intent::A',
                    'TicketInsightsTask.ticketCount': '10',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '101',
                    'TicketInsightsTask.resourceSourceSetId': '201',
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'Intent::B',
                    'TicketInsightsTask.ticketCount': '5',
                },
            ]

            const ticketsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '50',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '101',
                    'TicketInsightsTask.resourceSourceSetId': '201',
                    'TicketInsightsTask.ticketCount': '30',
                },
            ]

            const result = aggregateResourceMetrics(
                ticketsData,
                undefined,
                undefined,
                intentsData,
            )

            expect(result).toHaveLength(2)
            const resource100 = result.find((r) => r.resourceSourceId === 100)
            const resource101 = result.find((r) => r.resourceSourceId === 101)

            expect(resource100?.intents).toEqual(['Intent::A'])
            expect(resource101?.intents).toEqual(['Intent::B'])
        })

        it('should not add intents for resources not in tickets/handover/csat data', () => {
            const intentsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'Intent::A',
                    'TicketInsightsTask.ticketCount': '10',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '101',
                    'TicketInsightsTask.resourceSourceSetId': '201',
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'Intent::B',
                    'TicketInsightsTask.ticketCount': '5',
                },
            ]

            const ticketsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '50',
                },
            ]

            const result = aggregateResourceMetrics(
                ticketsData,
                undefined,
                undefined,
                intentsData,
            )

            expect(result).toHaveLength(1)
            expect(result[0].resourceSourceId).toBe(100)
            expect(result[0].intents).toEqual(['Intent::A'])
        })
    })

    describe('edge cases', () => {
        it('should return empty array when all data is undefined', () => {
            const result = aggregateResourceMetrics(
                undefined,
                undefined,
                undefined,
                undefined,
            )

            expect(result).toEqual([])
        })

        it('should return empty array when all data is empty arrays', () => {
            const result = aggregateResourceMetrics([], [], [], [])

            expect(result).toEqual([])
        })

        it('should skip records with null resourceSourceId', () => {
            const ticketsData = [
                {
                    'TicketInsightsTask.resourceSourceId': null,
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '50',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '30',
                },
            ]

            const result = aggregateResourceMetrics(
                ticketsData,
                undefined,
                undefined,
                undefined,
            )

            expect(result).toHaveLength(1)
            expect(result[0].resourceSourceId).toBe(100)
        })

        it('should skip records with null resourceSourceSetId', () => {
            const ticketsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': null,
                    'TicketInsightsTask.ticketCount': '50',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '30',
                },
            ]

            const result = aggregateResourceMetrics(
                ticketsData,
                undefined,
                undefined,
                undefined,
            )

            expect(result).toHaveLength(1)
            expect(result[0].resourceSourceSetId).toBe(200)
        })

        it('should handle missing ticket counts as 0', () => {
            const ticketsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                },
            ]

            const result = aggregateResourceMetrics(
                ticketsData,
                undefined,
                undefined,
                undefined,
            )

            expect(result[0].tickets).toBe(0)
        })

        it('should handle invalid ticket counts as 0', () => {
            const ticketsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': 'not-a-number',
                },
            ]

            const result = aggregateResourceMetrics(
                ticketsData,
                undefined,
                undefined,
                undefined,
            )

            expect(result[0].tickets).toBe(0)
        })
    })

    describe('complete scenarios', () => {
        it('should handle realistic multi-resource data with all metrics', () => {
            const ticketsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '100',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '101',
                    'TicketInsightsTask.resourceSourceSetId': '201',
                    'TicketInsightsTask.ticketCount': '75',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '102',
                    'TicketInsightsTask.resourceSourceSetId': '202',
                    'TicketInsightsTask.ticketCount': '50',
                },
            ]

            const handoverData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.ticketCount': '10',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '101',
                    'TicketInsightsTask.resourceSourceSetId': '201',
                    'TicketInsightsTask.ticketCount': '5',
                },
            ]

            const csatData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.avgSurveyScore': '4.5',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '102',
                    'TicketInsightsTask.resourceSourceSetId': '202',
                    'TicketInsightsTask.avgSurveyScore': '3.8',
                },
            ]

            const intentsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Billing::Payment',
                    'TicketInsightsTask.ticketCount': '20',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '101',
                    'TicketInsightsTask.resourceSourceSetId': '201',
                    'TicketCustomFieldsEnriched.top2LevelsValue':
                        'Support::Technical',
                    'TicketInsightsTask.ticketCount': '15',
                },
            ]

            const result = aggregateResourceMetrics(
                ticketsData,
                handoverData,
                csatData,
                intentsData,
            )

            expect(result).toHaveLength(3)

            expect(result).toContainEqual({
                resourceSourceId: 100,
                resourceSourceSetId: 200,
                tickets: 100,
                handoverTickets: 10,
                csat: 4.5,
                intents: ['Billing::Payment'],
            })

            expect(result).toContainEqual({
                resourceSourceId: 101,
                resourceSourceSetId: 201,
                tickets: 75,
                handoverTickets: 5,
                csat: null,
                intents: ['Support::Technical'],
            })

            expect(result).toContainEqual({
                resourceSourceId: 102,
                resourceSourceSetId: 202,
                tickets: 50,
                handoverTickets: null,
                csat: 3.8,
                intents: null,
            })
        })
    })
})

describe('useResourceMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    it('should return loading state when metrics are fetching', () => {
        ;(useMetric as jest.Mock).mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        const { result } = renderHook(
            () =>
                useResourceMetrics({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    timezone: 'America/New_York',
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it('should return error state when any metric has error', () => {
        ;(useMetric as jest.Mock)
            .mockReturnValueOnce({
                isFetching: false,
                isError: true,
                data: undefined,
            })
            .mockReturnValue({
                isFetching: false,
                isError: false,
                data: { value: 10 },
            })
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: { allData: [] },
        })

        const { result } = renderHook(
            () =>
                useResourceMetrics({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    timezone: 'America/New_York',
                }),
            { wrapper },
        )

        expect(result.current.isError).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it('should return data when all metrics are successful', () => {
        ;(useMetric as jest.Mock)
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 100 },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 5 },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 4.5 },
            })
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                allData: [
                    {
                        'TicketInsightsTask.ticketCount': '10',
                        'TicketCustomFieldsEnriched.top2LevelsValue':
                            'Intent::A',
                    },
                ],
            },
        })

        const { result } = renderHook(
            () =>
                useResourceMetrics({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    timezone: 'America/New_York',
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.data?.tickets?.value).toBe(100)
        expect(result.current.data?.handoverTickets?.value).toBe(5)
        expect(result.current.data?.csat?.value).toBe(4.5)
        expect(result.current.data?.intents).toEqual(['Intent::A'])
    })

    it('should return null for metrics without values', () => {
        ;(useMetric as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: { allData: [] },
        })

        const { result } = renderHook(
            () =>
                useResourceMetrics({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    timezone: 'America/New_York',
                }),
            { wrapper },
        )

        expect(result.current.data?.tickets).toBeNull()
        expect(result.current.data?.handoverTickets).toBeNull()
        expect(result.current.data?.csat).toBeNull()
    })

    it('should respect enabled parameter', () => {
        ;(useMetric as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })

        renderHook(
            () =>
                useResourceMetrics({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    timezone: 'America/New_York',
                    enabled: false,
                }),
            { wrapper },
        )

        expect(useMetric).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            false,
        )
        expect(useMetricPerDimensionV2).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            undefined,
            false,
        )
    })

    it('should round CSAT to 2 decimal places', () => {
        ;(useMetric as jest.Mock)
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: undefined,
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: undefined,
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 4.567890123 },
            })
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: { allData: [] },
        })

        const { result } = renderHook(
            () =>
                useResourceMetrics({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    timezone: 'America/New_York',
                }),
            { wrapper },
        )

        expect(result.current.data?.csat?.value).toBe(4.57)
    })
})

describe('useAllResourcesMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    it('should return loading state when metrics are fetching', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        const { result } = renderHook(
            () =>
                useAllResourcesMetrics({
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it('should return error state when any metric has error', () => {
        ;(useMetricPerDimensionV2 as jest.Mock)
            .mockReturnValueOnce({
                isFetching: false,
                isError: true,
                data: undefined,
            })
            .mockReturnValue({
                isFetching: false,
                isError: false,
                data: { allData: [] },
            })

        const { result } = renderHook(
            () =>
                useAllResourcesMetrics({
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                }),
            { wrapper },
        )

        expect(result.current.isError).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it('should aggregate data for multiple resources', () => {
        ;(useMetricPerDimensionV2 as jest.Mock)
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: {
                    allData: [
                        {
                            'TicketInsightsTask.resourceSourceId': '100',
                            'TicketInsightsTask.resourceSourceSetId': '200',
                            'TicketInsightsTask.ticketCount': '50',
                        },
                        {
                            'TicketInsightsTask.resourceSourceId': '101',
                            'TicketInsightsTask.resourceSourceSetId': '201',
                            'TicketInsightsTask.ticketCount': '30',
                        },
                    ],
                },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: {
                    allData: [
                        {
                            'TicketInsightsTask.resourceSourceId': '100',
                            'TicketInsightsTask.resourceSourceSetId': '200',
                            'TicketInsightsTask.ticketCount': '5',
                        },
                    ],
                },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: {
                    allData: [
                        {
                            'TicketInsightsTask.resourceSourceId': '100',
                            'TicketInsightsTask.resourceSourceSetId': '200',
                            'TicketInsightsTask.avgSurveyScore': '4.5',
                        },
                    ],
                },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: {
                    allData: [
                        {
                            'TicketInsightsTask.resourceSourceId': '100',
                            'TicketInsightsTask.resourceSourceSetId': '200',
                            'TicketCustomFieldsEnriched.top2LevelsValue':
                                'Intent::A',
                            'TicketInsightsTask.ticketCount': '10',
                        },
                    ],
                },
            })

        const { result } = renderHook(
            () =>
                useAllResourcesMetrics({
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.data).toHaveLength(2)

        const resource100 = result.current.data?.find(
            (r) => r.resourceSourceId === 100,
        )
        const resource101 = result.current.data?.find(
            (r) => r.resourceSourceId === 101,
        )

        expect(resource100).toEqual({
            resourceSourceId: 100,
            resourceSourceSetId: 200,
            tickets: 50,
            handoverTickets: 5,
            csat: 4.5,
            intents: ['Intent::A'],
        })

        expect(resource101).toEqual({
            resourceSourceId: 101,
            resourceSourceSetId: 201,
            tickets: 30,
            handoverTickets: null,
            csat: null,
            intents: null,
        })
    })

    it('should respect enabled parameter', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })

        renderHook(
            () =>
                useAllResourcesMetrics({
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                    enabled: false,
                }),
            { wrapper },
        )

        expect(useMetricPerDimensionV2).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            undefined,
            false,
        )
    })

    it('should respect loadIntents parameter when true', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: { allData: [] },
        })

        renderHook(
            () =>
                useAllResourcesMetrics({
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                    loadIntents: true,
                }),
            { wrapper },
        )

        expect(useMetricPerDimensionV2).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.anything(),
            undefined,
            true,
        )
    })

    it('should respect loadIntents parameter when false', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: { allData: [] },
        })

        renderHook(
            () =>
                useAllResourcesMetrics({
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                    loadIntents: false,
                }),
            { wrapper },
        )

        expect(useMetricPerDimensionV2).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.anything(),
            undefined,
            false,
        )
    })

    it('should not include intents in loading state when loadIntents is false', () => {
        ;(useMetricPerDimensionV2 as jest.Mock)
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { allData: [] },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { allData: [] },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { allData: [] },
            })
            .mockReturnValueOnce({
                isFetching: true,
                isError: false,
                data: undefined,
            })

        const { result } = renderHook(
            () =>
                useAllResourcesMetrics({
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                    loadIntents: false,
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should not include intents in error state when loadIntents is false', () => {
        ;(useMetricPerDimensionV2 as jest.Mock)
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { allData: [] },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { allData: [] },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { allData: [] },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: true,
                data: undefined,
            })

        const { result } = renderHook(
            () =>
                useAllResourcesMetrics({
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                    loadIntents: false,
                }),
            { wrapper },
        )

        expect(result.current.isError).toBe(false)
    })

    it('should include intents in loading state when loadIntents is true', () => {
        ;(useMetricPerDimensionV2 as jest.Mock)
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { allData: [] },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { allData: [] },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { allData: [] },
            })
            .mockReturnValueOnce({
                isFetching: true,
                isError: false,
                data: undefined,
            })

        const { result } = renderHook(
            () =>
                useAllResourcesMetrics({
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                    loadIntents: true,
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should include intents in error state when loadIntents is true', () => {
        ;(useMetricPerDimensionV2 as jest.Mock)
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { allData: [] },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { allData: [] },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { allData: [] },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: true,
                data: undefined,
            })

        const { result } = renderHook(
            () =>
                useAllResourcesMetrics({
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                    loadIntents: true,
                }),
            { wrapper },
        )

        expect(result.current.isError).toBe(true)
    })

    it('should not pass intents data to aggregation when loadIntents is false', () => {
        ;(useMetricPerDimensionV2 as jest.Mock)
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: {
                    allData: [
                        {
                            'TicketInsightsTask.resourceSourceId': '100',
                            'TicketInsightsTask.resourceSourceSetId': '200',
                            'TicketInsightsTask.ticketCount': '50',
                        },
                    ],
                },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { allData: [] },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { allData: [] },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: {
                    allData: [
                        {
                            'TicketInsightsTask.resourceSourceId': '100',
                            'TicketInsightsTask.resourceSourceSetId': '200',
                            'TicketCustomFieldsEnriched.top2LevelsValue':
                                'Intent::A',
                            'TicketInsightsTask.ticketCount': '10',
                        },
                    ],
                },
            })

        const { result } = renderHook(
            () =>
                useAllResourcesMetrics({
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                    loadIntents: false,
                }),
            { wrapper },
        )

        expect(result.current.data?.[0].intents).toBeNull()
    })

    it('should handle realistic multi-resource data with all metrics', () => {
        ;(useMetricPerDimensionV2 as jest.Mock)
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: {
                    allData: [
                        {
                            'TicketInsightsTask.resourceSourceId': '100',
                            'TicketInsightsTask.resourceSourceSetId': '200',
                            'TicketInsightsTask.ticketCount': '100',
                        },
                        {
                            'TicketInsightsTask.resourceSourceId': '101',
                            'TicketInsightsTask.resourceSourceSetId': '201',
                            'TicketInsightsTask.ticketCount': '75',
                        },
                        {
                            'TicketInsightsTask.resourceSourceId': '102',
                            'TicketInsightsTask.resourceSourceSetId': '202',
                            'TicketInsightsTask.ticketCount': '50',
                        },
                    ],
                },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: {
                    allData: [
                        {
                            'TicketInsightsTask.resourceSourceId': '100',
                            'TicketInsightsTask.resourceSourceSetId': '200',
                            'TicketInsightsTask.ticketCount': '10',
                        },
                        {
                            'TicketInsightsTask.resourceSourceId': '101',
                            'TicketInsightsTask.resourceSourceSetId': '201',
                            'TicketInsightsTask.ticketCount': '5',
                        },
                    ],
                },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: {
                    allData: [
                        {
                            'TicketInsightsTask.resourceSourceId': '100',
                            'TicketInsightsTask.resourceSourceSetId': '200',
                            'TicketInsightsTask.avgSurveyScore': '4.5',
                        },
                        {
                            'TicketInsightsTask.resourceSourceId': '102',
                            'TicketInsightsTask.resourceSourceSetId': '202',
                            'TicketInsightsTask.avgSurveyScore': '3.8',
                        },
                    ],
                },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: {
                    allData: [
                        {
                            'TicketInsightsTask.resourceSourceId': '100',
                            'TicketInsightsTask.resourceSourceSetId': '200',
                            'TicketCustomFieldsEnriched.top2LevelsValue':
                                'Billing::Payment',
                            'TicketInsightsTask.ticketCount': '20',
                        },
                        {
                            'TicketInsightsTask.resourceSourceId': '101',
                            'TicketInsightsTask.resourceSourceSetId': '201',
                            'TicketCustomFieldsEnriched.top2LevelsValue':
                                'Support::Technical',
                            'TicketInsightsTask.ticketCount': '15',
                        },
                    ],
                },
            })

        const { result } = renderHook(
            () =>
                useAllResourcesMetrics({
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.data).toHaveLength(3)

        expect(result.current.data).toContainEqual({
            resourceSourceId: 100,
            resourceSourceSetId: 200,
            tickets: 100,
            handoverTickets: 10,
            csat: 4.5,
            intents: ['Billing::Payment'],
        })

        expect(result.current.data).toContainEqual({
            resourceSourceId: 101,
            resourceSourceSetId: 201,
            tickets: 75,
            handoverTickets: 5,
            csat: null,
            intents: ['Support::Technical'],
        })

        expect(result.current.data).toContainEqual({
            resourceSourceId: 102,
            resourceSourceSetId: 202,
            tickets: 50,
            handoverTickets: null,
            csat: 3.8,
            intents: null,
        })
    })

    it('should return empty array when all metrics return empty data', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            isFetching: false,
            isError: false,
            data: { allData: [] },
        })

        const { result } = renderHook(
            () =>
                useAllResourcesMetrics({
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                }),
            { wrapper },
        )

        expect(result.current.data).toEqual([])
    })
})
