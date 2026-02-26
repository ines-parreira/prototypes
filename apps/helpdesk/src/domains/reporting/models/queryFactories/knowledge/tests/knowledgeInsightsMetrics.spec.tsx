import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import moment from 'moment'
import { Provider } from 'react-redux'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketInsightsTaskMeasure } from 'domains/reporting/models/cubes/TicketInsightsTaskCube'
import {
    aggregateResourceMetrics,
    createV1DrillDownQuery,
    createV1Query,
    getLast28DaysDateRange,
    knowledgeCSATDrillDownQueryFactory,
    knowledgeHandoverTicketsDrillDownQueryFactory,
    knowledgeRecentTicketsQueryFactory,
    knowledgeTicketsDrillDownQueryFactory,
    parseIntentsData,
    parseIntentsDataByResource,
    useAllResourcesMetrics,
    useRecentTickets,
    useRecentTicketsWithDrilldown,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import type {
    ApiStatsFilters,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/useMetric')
jest.mock('domains/reporting/hooks/useMetricPerDimension')
jest.mock('@gorgias/helpdesk-queries', () => ({
    useGetTicket: jest.fn(),
}))
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
jest.mock('hooks/useAppDispatch', () => jest.fn(() => jest.fn()))

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

const testDateRange = {
    start_datetime: moment().subtract(28, 'days').toISOString(),
    end_datetime: moment().toISOString(),
}

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
                values: [
                    formatReportingQueryDate(
                        baseStatsFilters.period.start_datetime,
                    ),
                ],
            })
            expect(query.filters).toContainEqual({
                member: 'TicketEnriched.periodEnd',
                operator: 'beforeDate',
                values: [
                    formatReportingQueryDate(
                        baseStatsFilters.period.end_datetime,
                    ),
                ],
            })
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
                member: 'TicketEnriched.customField',
                operator: 'equals',
                values: [
                    customFieldId + '::' + 'Value1',
                    customFieldId + '::' + 'Value2',
                ],
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
                member: 'TicketEnriched.customFieldToExclude',
                operator: 'notEquals',
                values: [
                    customFieldId + '::' + 'Spam',
                    customFieldId + '::' + 'NoReply',
                ],
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
                member: 'TicketEnriched.customField',
                operator: 'equals',
                values: [111 + '::' + 'ValueA'],
            })

            expect(query.filters).toContainEqual({
                member: 'TicketEnriched.customFieldToExclude',
                operator: 'notEquals',
                values: [222 + '::' + 'ValueB'],
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
                { intent: 'Support::Technical', ticketCount: 15 },
                { intent: 'Shipping::Delay', ticketCount: 10 },
                { intent: 'Billing::Payment', ticketCount: 5 },
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

            expect(result?.[0]).toEqual({
                intent: 'Valid::Intent',
                ticketCount: 10,
            })
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

            expect(result).toEqual([
                { intent: 'Valid::Intent', ticketCount: 5 },
            ])
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

            expect(result).toEqual([
                { intent: 'Valid::Intent', ticketCount: 5 },
            ])
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
                { intent: 'Order::Status', ticketCount: 100 },
                { intent: 'Shipping::Inquiry', ticketCount: 75 },
                { intent: 'Returns::Process', ticketCount: 60 },
            ])
        })
    })

    describe('V2 API field names', () => {
        it('should handle V2 field names (unprefixed)', () => {
            const mockData = [
                {
                    customFieldTop2LevelsValue: 'Billing::Payment',
                    ticketCount: '15',
                },
                {
                    customFieldTop2LevelsValue: 'Support::Technical',
                    ticketCount: '10',
                },
                {
                    customFieldTop2LevelsValue: 'Shipping::Delay',
                    ticketCount: '20',
                },
            ]

            const result = parseIntentsData(mockData, false)

            expect(result).toEqual([
                { intent: 'Shipping::Delay', ticketCount: 20 },
                { intent: 'Billing::Payment', ticketCount: 15 },
                { intent: 'Support::Technical', ticketCount: 10 },
            ])
        })

        it('should handle mixed V1 and V2 field names', () => {
            const mockData = [
                {
                    customFieldTop2LevelsValue: 'Intent::V2',
                    ticketCount: '25',
                },
                {
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'Intent::V1',
                    'TicketInsightsTask.ticketCount': '15',
                },
            ]

            const result = parseIntentsData(mockData, false)

            expect(result).toEqual([
                { intent: 'Intent::V2', ticketCount: 25 },
                { intent: 'Intent::V1', ticketCount: 15 },
            ])
        })

        it('should handle missing or invalid ticket counts with V2 fields', () => {
            const mockData = [
                {
                    customFieldTop2LevelsValue: 'Valid::Intent',
                    ticketCount: '10',
                },
                {
                    customFieldTop2LevelsValue: 'Missing::Count',
                },
                {
                    customFieldTop2LevelsValue: 'Invalid::Count',
                    ticketCount: 'not-a-number',
                },
            ]

            const result = parseIntentsData(mockData, false)

            expect(result?.[0]).toEqual({
                intent: 'Valid::Intent',
                ticketCount: 10,
            })
        })

        it('should filter out empty string intents with V2 fields', () => {
            const mockData = [
                {
                    customFieldTop2LevelsValue: '',
                    ticketCount: '10',
                },
                {
                    customFieldTop2LevelsValue: 'Valid::Intent',
                    ticketCount: '5',
                },
            ]

            const result = parseIntentsData(mockData, false)

            expect(result).toEqual([
                { intent: 'Valid::Intent', ticketCount: 5 },
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
                '100-200': [
                    { intent: 'Billing::Payment', ticketCount: 10 },
                    { intent: 'Support::Technical', ticketCount: 5 },
                ],
                '101-201': [{ intent: 'Shipping::Delay', ticketCount: 15 }],
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
                '1-10': [
                    { intent: 'Intent::A', ticketCount: 20 },
                    { intent: 'Intent::B', ticketCount: 15 },
                ],
                '2-20': [
                    { intent: 'Intent::C', ticketCount: 30 },
                    { intent: 'Intent::D', ticketCount: 25 },
                ],
                '3-30': [{ intent: 'Intent::E', ticketCount: 5 }],
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
                { intent: 'High::Count', ticketCount: 50 },
                { intent: 'Medium::Count', ticketCount: 25 },
                { intent: 'Low::Count', ticketCount: 5 },
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

            expect(result['100-200']).toEqual([
                { intent: 'Valid::Intent', ticketCount: 5 },
            ])
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

            expect(result['100-200']).toEqual([
                { intent: 'Valid::Intent', ticketCount: 5 },
            ])
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

    describe('V2 API field names', () => {
        it('should handle V2 field names (unprefixed)', () => {
            const mockData = [
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    customFieldTop2LevelsValue: 'Billing::Payment',
                    ticketCount: '15',
                },
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    customFieldTop2LevelsValue: 'Support::Technical',
                    ticketCount: '10',
                },
                {
                    resourceSourceId: '101',
                    resourceSourceSetId: '201',
                    customFieldTop2LevelsValue: 'Shipping::Delay',
                    ticketCount: '20',
                },
            ]

            const result = parseIntentsDataByResource(mockData, false)

            expect(result).toEqual({
                '100-200': [
                    { intent: 'Billing::Payment', ticketCount: 15 },
                    { intent: 'Support::Technical', ticketCount: 10 },
                ],
                '101-201': [{ intent: 'Shipping::Delay', ticketCount: 20 }],
            })
        })

        it('should handle mixed V1 and V2 field names', () => {
            const mockData = [
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    customFieldTop2LevelsValue: 'Intent::V2',
                    ticketCount: '25',
                },
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'Intent::V1',
                    'TicketInsightsTask.ticketCount': '15',
                },
            ]

            const result = parseIntentsDataByResource(mockData, false)

            expect(result['100-200']).toEqual([
                { intent: 'Intent::V2', ticketCount: 25 },
                { intent: 'Intent::V1', ticketCount: 15 },
            ])
        })

        it('should sort intents by ticket count descending within each resource with V2 fields', () => {
            const mockData = [
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    customFieldTop2LevelsValue: 'Low::Priority',
                    ticketCount: '5',
                },
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    customFieldTop2LevelsValue: 'High::Priority',
                    ticketCount: '20',
                },
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    customFieldTop2LevelsValue: 'Medium::Priority',
                    ticketCount: '10',
                },
            ]

            const result = parseIntentsDataByResource(mockData, false)

            expect(result['100-200']).toEqual([
                { intent: 'High::Priority', ticketCount: 20 },
                { intent: 'Medium::Priority', ticketCount: 10 },
                { intent: 'Low::Priority', ticketCount: 5 },
            ])
        })

        it('should filter out empty string intents with V2 fields', () => {
            const mockData = [
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    customFieldTop2LevelsValue: '',
                    ticketCount: '10',
                },
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    customFieldTop2LevelsValue: 'Valid::Intent',
                    ticketCount: '5',
                },
            ]

            const result = parseIntentsDataByResource(mockData, false)

            expect(result['100-200']).toEqual([
                { intent: 'Valid::Intent', ticketCount: 5 },
            ])
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
                    intents: [{ intent: 'Intent::A', ticketCount: 10 }],
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
        it('should round CSAT to 1 decimal place', () => {
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

            expect(result[0].csat).toBe(4.6)
        })

        it('should set CSAT to null when avgScore is 0', () => {
            const csatData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.avgSurveyScore': '0',
                },
            ]

            const result = aggregateResourceMetrics(
                undefined,
                undefined,
                csatData,
                undefined,
            )

            expect(result[0].csat).toBeNull()
        })

        it('should set CSAT to null when avgScore is empty string', () => {
            const csatData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.avgSurveyScore': '',
                },
            ]

            const result = aggregateResourceMetrics(
                undefined,
                undefined,
                csatData,
                undefined,
            )

            expect(result[0].csat).toBeNull()
        })

        it('should set CSAT to null when avgScore is null', () => {
            const csatData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.avgSurveyScore': null,
                },
            ]

            const result = aggregateResourceMetrics(
                undefined,
                undefined,
                csatData,
                undefined,
            )

            expect(result[0].csat).toBeNull()
        })

        it('should set CSAT to null when avgScore is undefined', () => {
            const csatData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketInsightsTask.avgSurveyScore': undefined,
                },
            ]

            const result = aggregateResourceMetrics(
                undefined,
                undefined,
                csatData,
                undefined,
            )

            expect(result[0].csat).toBeNull()
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

            expect(result[0].intents).toEqual([
                { intent: 'Intent::B', ticketCount: 10 },
                { intent: 'Intent::A', ticketCount: 5 },
            ])
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

            expect(resource100?.intents).toEqual([
                { intent: 'Intent::A', ticketCount: 10 },
            ])
            expect(resource101?.intents).toEqual([
                { intent: 'Intent::B', ticketCount: 5 },
            ])
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
            expect(result[0].intents).toEqual([
                { intent: 'Intent::A', ticketCount: 10 },
            ])
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
                intents: [{ intent: 'Billing::Payment', ticketCount: 20 }],
            })

            expect(result).toContainEqual({
                resourceSourceId: 101,
                resourceSourceSetId: 201,
                tickets: 75,
                handoverTickets: 5,
                csat: null,
                intents: [{ intent: 'Support::Technical', ticketCount: 15 }],
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

    describe('V2 API field names', () => {
        it('should aggregate all metrics for a single resource with V2 field names', () => {
            const ticketsData = [
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    ticketCount: '50',
                },
            ]

            const handoverData = [
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    ticketCount: '5',
                },
            ]

            const csatData = [
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    averageSurveyScore: '4.5',
                },
            ]

            const intentsData = [
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    customFieldTop2LevelsValue: 'Intent::A',
                    ticketCount: '10',
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
                    intents: [{ intent: 'Intent::A', ticketCount: 10 }],
                },
            ])
        })

        it('should aggregate metrics for multiple resources with V2 field names', () => {
            const ticketsData = [
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    ticketCount: '50',
                },
                {
                    resourceSourceId: '101',
                    resourceSourceSetId: '201',
                    ticketCount: '30',
                },
            ]

            const handoverData = [
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    ticketCount: '5',
                },
            ]

            const csatData = [
                {
                    resourceSourceId: '101',
                    resourceSourceSetId: '201',
                    averageSurveyScore: '3.8',
                },
            ]

            const result = aggregateResourceMetrics(
                ticketsData,
                handoverData,
                csatData,
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
                csat: 3.8,
                intents: null,
            })
        })

        it('should handle mixed V1 and V2 field names', () => {
            const ticketsData = [
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    ticketCount: '50',
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
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    averageSurveyScore: '4.5',
                },
            ]

            const intentsData = [
                {
                    'TicketInsightsTask.resourceSourceId': '100',
                    'TicketInsightsTask.resourceSourceSetId': '200',
                    'TicketCustomFieldsEnriched.top2LevelsValue': 'Intent::V1',
                    'TicketInsightsTask.ticketCount': '10',
                },
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    customFieldTop2LevelsValue: 'Intent::V2',
                    ticketCount: '15',
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
                    intents: [
                        { intent: 'Intent::V2', ticketCount: 15 },
                        { intent: 'Intent::V1', ticketCount: 10 },
                    ],
                },
            ])
        })

        it('should round CSAT to 1 decimal place with V2 fields', () => {
            const csatData = [
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    averageSurveyScore: '4.567890',
                },
            ]

            const result = aggregateResourceMetrics(
                undefined,
                undefined,
                csatData,
                undefined,
            )

            expect(result[0].csat).toBe(4.6)
        })

        it('should handle missing ticket counts as 0 with V2 fields', () => {
            const ticketsData = [
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    ticketCount: undefined,
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

        it('should skip records with null resourceSourceId with V2 fields', () => {
            const ticketsData = [
                {
                    resourceSourceId: null,
                    resourceSourceSetId: '200',
                    ticketCount: '50',
                },
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    ticketCount: '30',
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

        it('should skip records with null resourceSourceSetId with V2 fields', () => {
            const ticketsData = [
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: null,
                    ticketCount: '50',
                },
                {
                    resourceSourceId: '100',
                    resourceSourceSetId: '200',
                    ticketCount: '30',
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
    })
})

describe('knowledgeCSATDrillDownQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.clone().add(7, 'days')
    const resourceSourceId = 123
    const resourceSourceSetId = 456
    const timezone = 'America/New_York'

    const statsFilters: StatsFilters = {
        [FilterKey.Period]: {
            start_datetime: periodStart.toISOString(),
            end_datetime: periodEnd.toISOString(),
        },
    }

    it('should include avgSurveyScore measure in drilldown query', () => {
        const query = knowledgeCSATDrillDownQueryFactory(
            statsFilters,
            timezone,
            resourceSourceId,
            resourceSourceSetId,
        )

        expect(query.measures).toEqual([
            TicketInsightsTaskMeasure.AvgSurveyScore,
        ])
        expect(query.metricName).toBe(METRIC_NAMES.KNOWLEDGE_CSAT_DRILL_DOWN)
    })

    it('should include ticketId dimension for drilldown', () => {
        const query = knowledgeCSATDrillDownQueryFactory(
            statsFilters,
            timezone,
            resourceSourceId,
            resourceSourceSetId,
        )

        expect(query.dimensions).toContain('TicketEnriched.ticketId')
    })

    it('should include resource filters', () => {
        const query = knowledgeCSATDrillDownQueryFactory(
            statsFilters,
            timezone,
            resourceSourceId,
            resourceSourceSetId,
        )

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
    })

    it('should have drilldown query limit', () => {
        const query = knowledgeCSATDrillDownQueryFactory(
            statsFilters,
            timezone,
            resourceSourceId,
            resourceSourceSetId,
        )

        expect(query.limit).toBe(100)
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
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                    dateRange: testDateRange,
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
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                    dateRange: testDateRange,
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
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.data?.tickets?.value).toBe(100)
        expect(result.current.data?.handoverTickets?.value).toBe(5)
        expect(result.current.data?.csat?.value).toBe(4.5)
        expect(result.current.data?.intents).toEqual([
            { intent: 'Intent::A', ticketCount: 10 },
        ])
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
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                    dateRange: testDateRange,
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
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                    dateRange: testDateRange,
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

    it('should round CSAT to 1 decimal place', () => {
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
                    shopIntegrationId: 1,
                    timezone: 'America/New_York',
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current.data?.csat?.value).toBe(4.6)
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
                    dateRange: testDateRange,
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
                    dateRange: testDateRange,
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
                    dateRange: testDateRange,
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
            intents: [{ intent: 'Intent::A', ticketCount: 10 }],
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
                    dateRange: testDateRange,
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
                    dateRange: testDateRange,
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
                    dateRange: testDateRange,
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
                    dateRange: testDateRange,
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
                    dateRange: testDateRange,
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
                    dateRange: testDateRange,
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
                    dateRange: testDateRange,
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
                    dateRange: testDateRange,
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
                    dateRange: testDateRange,
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
            intents: [{ intent: 'Billing::Payment', ticketCount: 20 }],
        })

        expect(result.current.data).toContainEqual({
            resourceSourceId: 101,
            resourceSourceSetId: 201,
            tickets: 75,
            handoverTickets: 5,
            csat: null,
            intents: [{ intent: 'Support::Technical', ticketCount: 15 }],
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
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current.data).toEqual([])
    })
})

describe('createV1Query edge cases', () => {
    const resourceSourceId = 123
    const resourceSourceSetId = 456
    const timezone = 'America/New_York'

    it('should throw error when period filters are missing', () => {
        const invalidFilters = {} as any

        expect(() =>
            createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                invalidFilters,
                timezone,
                'TicketInsightsTask.ticketCount',
            ),
        ).toThrow(
            'Period filters (start_datetime and end_datetime) are required for knowledge metrics queries',
        )
    })

    it('should throw error when start_datetime is missing', () => {
        const invalidFilters = {
            [FilterKey.Period]: {
                end_datetime: moment().toISOString(),
            },
        } as any

        expect(() =>
            createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                invalidFilters,
                timezone,
                'TicketInsightsTask.ticketCount',
            ),
        ).toThrow(
            'Period filters (start_datetime and end_datetime) are required for knowledge metrics queries',
        )
    })

    it('should throw error when end_datetime is missing', () => {
        const invalidFilters = {
            [FilterKey.Period]: {
                start_datetime: moment().toISOString(),
            },
        } as any

        expect(() =>
            createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS,
                resourceSourceId,
                resourceSourceSetId,
                invalidFilters,
                timezone,
                'TicketInsightsTask.ticketCount',
            ),
        ).toThrow(
            'Period filters (start_datetime and end_datetime) are required for knowledge metrics queries',
        )
    })

    it('should use Set operator when resourceSourceId is null', () => {
        const periodStart = moment()
        const periodEnd = periodStart.clone().add(7, 'days')
        const filters: StatsFilters = {
            [FilterKey.Period]: {
                start_datetime: periodStart.toISOString(),
                end_datetime: periodEnd.toISOString(),
            },
        }

        const query = createV1Query(
            METRIC_NAMES.KNOWLEDGE_TICKETS,
            null,
            resourceSourceSetId,
            filters,
            timezone,
            'TicketInsightsTask.ticketCount',
        )

        expect(query.filters).toContainEqual({
            member: 'TicketInsightsTask.resourceSourceId',
            operator: 'set',
            values: [],
        })
    })

    it('should use Set operator when resourceSourceSetId is null', () => {
        const periodStart = moment()
        const periodEnd = periodStart.clone().add(7, 'days')
        const filters: StatsFilters = {
            [FilterKey.Period]: {
                start_datetime: periodStart.toISOString(),
                end_datetime: periodEnd.toISOString(),
            },
        }

        const query = createV1Query(
            METRIC_NAMES.KNOWLEDGE_TICKETS,
            resourceSourceId,
            null,
            filters,
            timezone,
            'TicketInsightsTask.ticketCount',
        )

        expect(query.filters).toContainEqual({
            member: 'TicketInsightsTask.resourceSourceSetId',
            operator: 'set',
            values: [],
        })
    })

    it('should add shop integration ID filter when present', () => {
        const periodStart = moment()
        const periodEnd = periodStart.clone().add(7, 'days')
        const shopIntegrationId = 999
        const filters: ApiStatsFilters = {
            [FilterKey.Period]: {
                start_datetime: periodStart.toISOString(),
                end_datetime: periodEnd.toISOString(),
            },
            [FilterKey.Stores]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [shopIntegrationId],
            },
        }

        const query = createV1Query(
            METRIC_NAMES.KNOWLEDGE_TICKETS,
            resourceSourceId,
            resourceSourceSetId,
            filters,
            timezone,
            'TicketInsightsTask.ticketCount',
        )

        expect(query.filters).toContainEqual({
            member: 'TicketInsightsTask.shopIntegrationId',
            operator: 'equals',
            values: [String(shopIntegrationId)],
        })
    })

    it('should not add shop integration ID filter when empty', () => {
        const periodStart = moment()
        const periodEnd = periodStart.clone().add(7, 'days')
        const filters: ApiStatsFilters = {
            [FilterKey.Period]: {
                start_datetime: periodStart.toISOString(),
                end_datetime: periodEnd.toISOString(),
            },
            [FilterKey.Stores]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [],
            },
        }

        const query = createV1Query(
            METRIC_NAMES.KNOWLEDGE_TICKETS,
            resourceSourceId,
            resourceSourceSetId,
            filters,
            timezone,
            'TicketInsightsTask.ticketCount',
        )

        const shopIntegrationFilters = query.filters.filter(
            (f: any) => f.member === 'TicketInsightsTask.shopIntegrationId',
        )

        expect(shopIntegrationFilters).toHaveLength(0)
    })
})

describe('createV1DrillDownQuery', () => {
    const periodStart = moment()
    const periodEnd = periodStart.clone().add(7, 'days')
    const resourceSourceId = 123
    const resourceSourceSetId = 456
    const timezone = 'America/New_York'

    const statsFilters: StatsFilters = {
        [FilterKey.Period]: {
            start_datetime: periodStart.toISOString(),
            end_datetime: periodEnd.toISOString(),
        },
    }

    it('should include TicketId dimension', () => {
        const query = createV1DrillDownQuery(
            METRIC_NAMES.KNOWLEDGE_TICKETS,
            resourceSourceId,
            resourceSourceSetId,
            statsFilters,
            timezone,
        )

        expect(query.dimensions).toContain(TicketDimension.TicketId)
        expect(query.dimensions[0]).toBe(TicketDimension.TicketId)
    })

    it('should set limit to 100', () => {
        const query = createV1DrillDownQuery(
            METRIC_NAMES.KNOWLEDGE_TICKETS,
            resourceSourceId,
            resourceSourceSetId,
            statsFilters,
            timezone,
        )

        expect(query.limit).toBe(100)
    })

    it('should have empty measures array', () => {
        const query = createV1DrillDownQuery(
            METRIC_NAMES.KNOWLEDGE_TICKETS,
            resourceSourceId,
            resourceSourceSetId,
            statsFilters,
            timezone,
        )

        expect(query.measures).toEqual([])
    })

    it('should preserve all base filters', () => {
        const query = createV1DrillDownQuery(
            METRIC_NAMES.KNOWLEDGE_TICKETS,
            resourceSourceId,
            resourceSourceSetId,
            statsFilters,
            timezone,
        )

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
    })

    it('should preserve metricName', () => {
        const query = createV1DrillDownQuery(
            METRIC_NAMES.KNOWLEDGE_HANDOVER_TICKETS,
            resourceSourceId,
            resourceSourceSetId,
            statsFilters,
            timezone,
        )

        expect(query.metricName).toBe(METRIC_NAMES.KNOWLEDGE_HANDOVER_TICKETS)
    })
})

describe('knowledgeTicketsDrillDownQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.clone().add(7, 'days')
    const resourceSourceId = 123
    const resourceSourceSetId = 456
    const timezone = 'America/New_York'

    const statsFilters: StatsFilters = {
        [FilterKey.Period]: {
            start_datetime: periodStart.toISOString(),
            end_datetime: periodEnd.toISOString(),
        },
    }

    it('should create drilldown query with KNOWLEDGE_TICKETS metric', () => {
        const query = knowledgeTicketsDrillDownQueryFactory(
            statsFilters,
            timezone,
            resourceSourceId,
            resourceSourceSetId,
        )

        expect(query.metricName).toBe(METRIC_NAMES.KNOWLEDGE_TICKETS_DRILL_DOWN)
        expect(query.limit).toBe(100)
        expect(query.dimensions).toContain(TicketDimension.TicketId)
    })

    it('should include resource filters', () => {
        const query = knowledgeTicketsDrillDownQueryFactory(
            statsFilters,
            timezone,
            resourceSourceId,
            resourceSourceSetId,
        )

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
    })
})

describe('knowledgeHandoverTicketsDrillDownQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.clone().add(7, 'days')
    const resourceSourceId = 123
    const resourceSourceSetId = 456
    const timezone = 'America/New_York'

    const statsFilters: StatsFilters = {
        [FilterKey.Period]: {
            start_datetime: periodStart.toISOString(),
            end_datetime: periodEnd.toISOString(),
        },
    }

    it('should create drilldown query with KNOWLEDGE_HANDOVER_TICKETS metric', () => {
        const query = knowledgeHandoverTicketsDrillDownQueryFactory(
            statsFilters,
            timezone,
            resourceSourceId,
            resourceSourceSetId,
        )

        expect(query.metricName).toBe(
            METRIC_NAMES.KNOWLEDGE_HANDOVER_TICKETS_DRILL_DOWN,
        )
        expect(query.limit).toBe(100)
        expect(query.dimensions).toContain(TicketDimension.TicketId)
    })

    it('should include resource filters', () => {
        const query = knowledgeHandoverTicketsDrillDownQueryFactory(
            statsFilters,
            timezone,
            resourceSourceId,
            resourceSourceSetId,
        )

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
    })
})

describe('knowledgeRecentTicketsQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.clone().add(7, 'days')
    const resourceSourceId = 123
    const resourceSourceSetId = 456
    const timezone = 'America/New_York'

    const statsFilters: StatsFilters = {
        [FilterKey.Period]: {
            start_datetime: periodStart.toISOString(),
            end_datetime: periodEnd.toISOString(),
        },
    }

    it('should set limit to 3 for related tickets', () => {
        const query = knowledgeRecentTicketsQueryFactory(
            statsFilters,
            timezone,
            resourceSourceId,
            resourceSourceSetId,
        )

        expect(query.limit).toBe(3)
    })

    it('should include order by CreatedDatetime descending', () => {
        const query = knowledgeRecentTicketsQueryFactory(
            statsFilters,
            timezone,
            resourceSourceId,
            resourceSourceSetId,
        )

        expect(query.order).toEqual([
            [TicketDimension.CreatedDatetime, OrderDirection.Desc],
        ])
    })

    it('should include TicketId dimension', () => {
        const query = knowledgeRecentTicketsQueryFactory(
            statsFilters,
            timezone,
            resourceSourceId,
            resourceSourceSetId,
        )

        expect(query.dimensions).toContain(TicketDimension.TicketId)
    })

    it('should use KNOWLEDGE_TICKETS metric', () => {
        const query = knowledgeRecentTicketsQueryFactory(
            statsFilters,
            timezone,
            resourceSourceId,
            resourceSourceSetId,
        )

        expect(query.metricName).toBe(METRIC_NAMES.KNOWLEDGE_TICKETS_DRILL_DOWN)
    })

    it('should include resource filters', () => {
        const query = knowledgeRecentTicketsQueryFactory(
            statsFilters,
            timezone,
            resourceSourceId,
            resourceSourceSetId,
        )

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
    })
})

describe('getLast28DaysDateRange', () => {
    it('should return date range for last 28 days', () => {
        const result = getLast28DaysDateRange()

        expect(result).toHaveProperty('start_datetime')
        expect(result).toHaveProperty('end_datetime')

        const startDate = new Date(result.start_datetime)
        const endDate = new Date(result.end_datetime)

        const daysDifference = Math.round(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        )

        expect(daysDifference).toBe(28)
    })

    it('should return ISO string formatted dates', () => {
        const result = getLast28DaysDateRange()

        expect(result.start_datetime).toMatch(/^\d{4}-\d{2}-\d{2}T/)
        expect(result.end_datetime).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })

    it('should return end date at end of current hour', () => {
        const result = getLast28DaysDateRange()
        const endDate = new Date(result.end_datetime)
        const now = new Date()

        const timeDifference = Math.abs(now.getTime() - endDate.getTime())

        expect(timeDifference).toBeLessThan(3600000)

        expect(endDate.getMinutes()).toBe(0)
        expect(endDate.getSeconds()).toBe(0)
        expect(endDate.getMilliseconds()).toBe(0)

        expect(endDate.getTime()).toBeGreaterThanOrEqual(now.getTime())
    })
})

describe('useRecentTickets', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    it('should return null data when disabled', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        })
        ;(useGetTicket as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(
            () =>
                useRecentTickets({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    shopIntegrationId: 456,
                    timezone: 'America/New_York',
                    enabled: false,
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current.data).toBeNull()
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should return loading state when fetching ticket IDs', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
            isError: false,
        })
        ;(useGetTicket as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(
            () =>
                useRecentTickets({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    shopIntegrationId: 456,
                    timezone: 'America/New_York',
                    enabled: true,
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return loading state when fetching ticket details', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            data: {
                allData: [
                    { 'TicketEnriched.ticketId': '1' },
                    { 'TicketEnriched.ticketId': '2' },
                ],
            },
            isFetching: false,
            isError: false,
        })
        ;(useGetTicket as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        })

        const { result } = renderHook(
            () =>
                useRecentTickets({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    shopIntegrationId: 456,
                    timezone: 'America/New_York',
                    enabled: true,
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return error state when metrics fetch fails', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: true,
        })
        ;(useGetTicket as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(
            () =>
                useRecentTickets({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    shopIntegrationId: 456,
                    timezone: 'America/New_York',
                    enabled: true,
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current.isError).toBe(true)
    })

    it('should return error state when ticket fetch fails', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            data: {
                allData: [{ 'TicketEnriched.ticketId': '1' }],
            },
            isFetching: false,
            isError: false,
        })
        ;(useGetTicket as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        })

        const { result } = renderHook(
            () =>
                useRecentTickets({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    shopIntegrationId: 456,
                    timezone: 'America/New_York',
                    enabled: true,
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current.isError).toBe(true)
    })

    it('should transform tickets with handover outcome', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            data: {
                allData: [
                    { 'TicketEnriched.ticketId': '1' },
                    { 'TicketEnriched.ticketId': '2' },
                ],
            },
            isFetching: false,
            isError: false,
        })
        ;(useGetTicket as jest.Mock)
            .mockReturnValueOnce({
                data: {
                    data: {
                        id: 1,
                        subject: 'Test Ticket 1',
                        created_datetime: '2024-01-01T00:00:00Z',
                        messages: [{ id: 1 }, { id: 2 }],
                        custom_fields: {
                            123: { value: 'Handover::With message' },
                        },
                    },
                },
                isLoading: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: {
                    data: {
                        id: 2,
                        subject: 'Test Ticket 2',
                        created_datetime: '2024-01-02T00:00:00Z',
                        messages: [{ id: 1 }],
                        custom_fields: {
                            123: { value: 'Automated::Success' },
                        },
                    },
                },
                isLoading: false,
                isError: false,
            })
            .mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false,
            })

        const { result } = renderHook(
            () =>
                useRecentTickets({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    shopIntegrationId: 456,
                    timezone: 'America/New_York',
                    enabled: true,
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current.data).toHaveLength(2)
        expect(result.current.data?.[0]).toMatchObject({
            id: 1,
            title: 'Test Ticket 1',
            messageCount: 2,
            aiAgentOutcome: 'Handover',
        })
        expect(result.current.data?.[1]).toMatchObject({
            id: 2,
            title: 'Test Ticket 2',
            messageCount: 1,
            aiAgentOutcome: 'Automated',
        })
    })

    it('should use ticket ID as title when subject is missing', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            data: {
                allData: [{ 'TicketEnriched.ticketId': '123' }],
            },
            isFetching: false,
            isError: false,
        })
        ;(useGetTicket as jest.Mock)
            .mockReturnValueOnce({
                data: {
                    data: {
                        id: 123,
                        subject: '',
                        created_datetime: '2024-01-01T00:00:00Z',
                        messages: [],
                        custom_fields: {},
                    },
                },
                isLoading: false,
                isError: false,
            })
            .mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false,
            })

        const { result } = renderHook(
            () =>
                useRecentTickets({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    shopIntegrationId: 456,
                    timezone: 'America/New_York',
                    enabled: true,
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current.data?.[0].title).toBe('Ticket #123')
    })

    it('should limit to 3 tickets', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            data: {
                allData: [
                    { 'TicketEnriched.ticketId': '1' },
                    { 'TicketEnriched.ticketId': '2' },
                    { 'TicketEnriched.ticketId': '3' },
                    { 'TicketEnriched.ticketId': '4' },
                    { 'TicketEnriched.ticketId': '5' },
                ],
            },
            isFetching: false,
            isError: false,
        })
        ;(useGetTicket as jest.Mock).mockImplementation((id) => ({
            data: {
                data: {
                    id,
                    subject: `Ticket ${id}`,
                    created_datetime: '2024-01-01T00:00:00Z',
                    messages: [],
                    custom_fields: {},
                },
            },
            isLoading: false,
            isError: false,
        }))

        const { result } = renderHook(
            () =>
                useRecentTickets({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    shopIntegrationId: 456,
                    timezone: 'America/New_York',
                    enabled: true,
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current.data).toHaveLength(3)
    })

    it('should filter out invalid ticket IDs', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            data: {
                allData: [
                    { 'TicketEnriched.ticketId': 'invalid' },
                    { 'TicketEnriched.ticketId': '1' },
                ],
            },
            isFetching: false,
            isError: false,
        })
        ;(useGetTicket as jest.Mock).mockImplementation((id) =>
            id === 1
                ? {
                      data: {
                          data: {
                              id: 1,
                              subject: 'Valid Ticket',
                              created_datetime: '2024-01-01T00:00:00Z',
                              messages: [],
                              custom_fields: {},
                          },
                      },
                      isLoading: false,
                      isError: false,
                  }
                : {
                      data: undefined,
                      isLoading: false,
                      isError: false,
                  },
        )

        const { result } = renderHook(
            () =>
                useRecentTickets({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    shopIntegrationId: 456,
                    timezone: 'America/New_York',
                    enabled: true,
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current.data).toHaveLength(1)
    })
})

describe('useRecentTicketsWithDrilldown', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    it('should return undefined when disabled', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        })
        ;(useGetTicket as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(
            () =>
                useRecentTicketsWithDrilldown({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    shopIntegrationId: 456,
                    timezone: 'America/New_York',
                    enabled: false,
                    ticketCount: 10,
                    ticketCountIsLoading: false,
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current).toBeUndefined()
    })

    it('should return loading state with ticket count', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
            isError: false,
        })
        ;(useGetTicket as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(
            () =>
                useRecentTicketsWithDrilldown({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    shopIntegrationId: 456,
                    timezone: 'America/New_York',
                    enabled: true,
                    ticketCount: 10,
                    ticketCountIsLoading: false,
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current).toEqual({
            ticketCount: 10,
            isLoading: true,
            resourceSourceId: 100,
            resourceSourceSetId: 200,
            shopIntegrationId: 456,
            dateRange: testDateRange,
            outcomeCustomFieldId: 123,
            intentCustomFieldId: 456,
        })
    })

    it('should return undefined when ticketCount is 0 and no tickets data', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            data: { allData: [] },
            isFetching: false,
            isError: false,
        })
        ;(useGetTicket as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(
            () =>
                useRecentTicketsWithDrilldown({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    shopIntegrationId: 456,
                    timezone: 'America/New_York',
                    enabled: true,
                    ticketCount: 0,
                    ticketCountIsLoading: false,
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current).toBeUndefined()
    })

    it('should return data with tickets and drilldown info', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            data: {
                allData: [{ 'TicketEnriched.ticketId': '1' }],
            },
            isFetching: false,
            isError: false,
        })
        ;(useGetTicket as jest.Mock)
            .mockReturnValueOnce({
                data: {
                    data: {
                        id: 1,
                        subject: 'Test Ticket',
                        created_datetime: '2024-01-01T00:00:00Z',
                        messages: [{ id: 1 }],
                        custom_fields: {
                            123: { value: 'Automated::Success' },
                        },
                    },
                },
                isLoading: false,
                isError: false,
            })
            .mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false,
            })

        const { result } = renderHook(
            () =>
                useRecentTicketsWithDrilldown({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    shopIntegrationId: 456,
                    timezone: 'America/New_York',
                    enabled: true,
                    ticketCount: 5,
                    ticketCountIsLoading: false,
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current).toEqual({
            ticketCount: 5,
            latest3Tickets: [
                {
                    id: 1,
                    title: 'Test Ticket',
                    lastUpdatedDatetime: new Date('2024-01-01T00:00:00Z'),
                    messageCount: 1,
                    aiAgentOutcome: 'Automated',
                },
            ],
            isLoading: false,
            resourceSourceId: 100,
            resourceSourceSetId: 200,
            shopIntegrationId: 456,
            dateRange: testDateRange,
            outcomeCustomFieldId: 123,
            intentCustomFieldId: 456,
        })
    })

    it('should return data without latest3Tickets when none available', () => {
        ;(useMetricPerDimensionV2 as jest.Mock).mockReturnValue({
            data: { allData: [] },
            isFetching: false,
            isError: false,
        })
        ;(useGetTicket as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(
            () =>
                useRecentTicketsWithDrilldown({
                    resourceSourceId: 100,
                    resourceSourceSetId: 200,
                    shopIntegrationId: 456,
                    timezone: 'America/New_York',
                    enabled: true,
                    ticketCount: 5,
                    ticketCountIsLoading: false,
                    dateRange: testDateRange,
                }),
            { wrapper },
        )

        expect(result.current).toEqual({
            ticketCount: 5,
            latest3Tickets: undefined,
            isLoading: false,
            resourceSourceId: 100,
            resourceSourceSetId: 200,
            shopIntegrationId: 456,
            dateRange: testDateRange,
            outcomeCustomFieldId: 123,
            intentCustomFieldId: 456,
        })
    })
})
