import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {
    csatPerIntentMetric,
    customFieldsMetric,
    totalTicketsMetric,
} from 'fixtures/aiAgentInsights'
import { ticketFieldDefinitions } from 'fixtures/customField'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import {
    BREAKDOWN_FIELD,
    CUSTOM_FIELD_COUNT,
    TICKET_COUNT,
} from 'hooks/reporting/automate/types'
import {
    addMetricDataToResults,
    convertResultToTableArrayFormat,
    useAiAgentKnowledgeResourcePerIntent,
    useAIAgentMetrics,
    useAIAgentTicketsPerIntent,
    useAutomationOpportunityPerIntent,
    useCustomerSatisfactionPerIntent,
    useSuccessRatePerIntent,
} from 'hooks/reporting/automate/useAIAgentInsightsDataset'
import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import { useMetric } from 'hooks/reporting/useMetric'
import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import { useMultipleMetricsTrends } from 'hooks/reporting/useMultipleMetricsTrend'
import { OrderDirection } from 'models/api/types'
import {
    RecommendedResourcesDimension,
    RecommendedResourcesMeasure,
} from 'models/reporting/cubes/automate_v2/RecommendedResourcesCube'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import { StatsFilters } from 'models/stat/types'
import {
    IntentMetrics,
    IntentTableColumn,
} from 'pages/aiAgent/insights/IntentTableWidget/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

const queryClient = mockQueryClient()
const timezone = 'UTC'

jest.mock('hooks/reporting/timeSeries')
jest.mock('hooks/reporting/useMetric')
jest.mock('hooks/reporting/useMetricPerDimension')
jest.mock('hooks/reporting/useMultipleMetricsTrend')

jest.mock('hooks/reporting/automate/useAIAgentUserId')
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
jest.mock('hooks/integrations/useGetTicketChannelsStoreIntegrations')

const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)
const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)
const useMetricMock = assumeMock(useMetric)
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const getTicketChannelsStoreIntegrationsMock = assumeMock(
    useGetTicketChannelsStoreIntegrations,
)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: moment()
            .add(1 * 7, 'day')
            .format('YYYY-MM-DDT00:00:00.000'),
        end_datetime: moment()
            .add(3 * 7, 'day')
            .format('YYYY-MM-DDT23:50:59.999'),
    },
}

const shopName = 'test-shop'

describe('useAiAgentInsightsDataset', () => {
    beforeEach(() => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: { data: ticketFieldDefinitions },
            isLoading: false,
        } as any)

        useAIAgentUserIdMock.mockReturnValue('2')
        getTicketChannelsStoreIntegrationsMock.mockReturnValue(['1'])
    })

    describe('useAiAgentMetrics', () => {
        it('should calculate ai agent insights correctly', () => {
            useMetricPerDimensionMock.mockReturnValue({
                // aiAgentTickets
                data: {
                    value: 5,
                    allData: [
                        { [TicketDimension.TicketId]: '1' },
                        { [TicketDimension.TicketId]: '2' },
                        { [TicketDimension.TicketId]: '3' },
                    ],
                },
                isFetching: false,
                isError: false,
            } as any)
            useMultipleMetricsTrendsMock
                .mockReturnValueOnce({
                    // aiAgentAutomatedInteractionsData
                    data: {
                        'AutomatedTickets.count': {
                            value: 1000,
                            prevValue: 0,
                        },
                    },
                    isFetched: true,
                } as any)
                .mockReturnValueOnce({
                    // aiAgentTicketsData
                    data: {
                        'TicketEnriched.ticketCount': {
                            value: 1100,
                            prevValue: 2,
                        },
                    },
                    isFetched: true,
                } as any)
                .mockReturnValueOnce({
                    // allCreatedTickets
                    data: {
                        'TicketEnriched.ticketCount': {
                            value: 2200,
                            prevValue: 100,
                        },
                    },
                    isFetched: true,
                } as any)
                .mockReturnValueOnce({
                    // customerSatisfactionAiAgentData
                    data: {
                        'TicketSatisfactionSurveyEnriched.avgSurveyScore': {
                            value: 5,
                            prevValue: 4,
                        },
                    },
                    isFetched: true,
                } as any)

            jest.spyOn(queryClient, 'invalidateQueries')
            const { result } = renderHook(
                () => useAIAgentMetrics(statsFilters, timezone, shopName),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )

            expect(result.current.coverageTrend.data?.value).toBeCloseTo(0.5)
            expect(
                result.current.aiAgentAutomatedInteractionTrend.data,
            ).toEqual({
                prevValue: 0,
                value: 1000,
            })
            expect(result.current.aiAgentSuccessRate.data?.value).toBeCloseTo(
                0.91,
            )
            expect(result.current.aiAgentCSAT.data).toEqual({
                prevValue: 4,
                value: 5,
            })
        })
    })

    describe('useAutomationOpportunityPerIntent', () => {
        it('should calculate ai agent insights correctly', () => {
            useMetricMock.mockReturnValueOnce({
                // aiAgentTickets
                data: {
                    value: 5,
                },
                isFetching: false,
                isError: false,
            } as any)
            useMetricPerDimensionMock
                .mockReturnValueOnce({
                    // aiAgentNotAutomatedTicketsData
                    data: {
                        allData: [
                            { [TicketDimension.TicketId]: '1' },
                            { [TicketDimension.TicketId]: '2' },
                            { [TicketDimension.TicketId]: '3' },
                        ],
                    },
                    isFetching: false,
                    isError: false,
                } as any)
                // useAiAgentTicketCountPerIntent
                .mockReturnValueOnce(customFieldsMetric)

            jest.spyOn(queryClient, 'invalidateQueries')
            const { result } = renderHook(
                () =>
                    useAutomationOpportunityPerIntent({
                        filters: statsFilters,
                        timezone,
                    }),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )

            expect(result.current.isError).toBe(false)
            expect(result.current.isFetching).toBe(false)
            expect(result.current.data).toEqual([
                {
                    [BREAKDOWN_FIELD]: 'Other::Platform',
                    [TICKET_COUNT]: '5',
                    [CUSTOM_FIELD_COUNT]: '3',
                    automationOpportunity: 0.6,
                },
                {
                    [BREAKDOWN_FIELD]: 'Other::Other',
                    [TICKET_COUNT]: '5',
                    [CUSTOM_FIELD_COUNT]: '1',
                    automationOpportunity: 0.2,
                },
                {
                    [BREAKDOWN_FIELD]: 'Other::App',
                    [TICKET_COUNT]: '5',
                    [CUSTOM_FIELD_COUNT]: '1',
                    automationOpportunity: 0.2,
                },
            ])
        })
    })

    describe('useAutomationOpportunityPerIntent', () => {
        it('should enrich automation opportunity per intent correctly', () => {
            useMetricMock.mockReturnValueOnce({
                // aiAgentTickets
                data: {
                    value: 5,
                },
                isFetching: false,
                isError: false,
            } as any)
            useMetricPerDimensionMock
                .mockReturnValueOnce({
                    // aiAgentNotAutomatedTicketsData
                    data: {
                        allData: [
                            { [TicketDimension.TicketId]: '1' },
                            { [TicketDimension.TicketId]: '2' },
                            { [TicketDimension.TicketId]: '3' },
                        ],
                    },
                    isFetching: false,
                    isError: false,
                } as any)
                // useAiAgentTicketCountPerIntent
                .mockReturnValueOnce(customFieldsMetric)

            jest.spyOn(queryClient, 'invalidateQueries')
            const { result } = renderHook(
                () =>
                    useAutomationOpportunityPerIntent({
                        filters: statsFilters,
                        timezone,
                    }),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )

            expect(result.current.isError).toBe(false)
            expect(result.current.isFetching).toBe(false)
            expect(result.current.data).toEqual([
                {
                    [BREAKDOWN_FIELD]: 'Other::Platform',
                    [TICKET_COUNT]: '5',
                    [CUSTOM_FIELD_COUNT]: '3',
                    automationOpportunity: 0.6,
                },
                {
                    [BREAKDOWN_FIELD]: 'Other::Other',
                    [TICKET_COUNT]: '5',
                    [CUSTOM_FIELD_COUNT]: '1',
                    automationOpportunity: 0.2,
                },
                {
                    [BREAKDOWN_FIELD]: 'Other::App',
                    [TICKET_COUNT]: '5',
                    [CUSTOM_FIELD_COUNT]: '1',
                    automationOpportunity: 0.2,
                },
            ])
        })
    })

    describe('useAIAgentTicketsPerIntent', () => {
        it('should return ai agent tickets correctly', () => {
            useMetricPerDimensionMock
                .mockReturnValueOnce({
                    // aiAgentTicketsData
                    data: {
                        allData: [
                            { [TicketDimension.TicketId]: '1' },
                            { [TicketDimension.TicketId]: '2' },
                            { [TicketDimension.TicketId]: '3' },
                        ],
                    },
                    isFetching: false,
                    isError: false,
                } as any)
                // aiAgentTicketsGroupedByIntent
                .mockReturnValueOnce(totalTicketsMetric)

            jest.spyOn(queryClient, 'invalidateQueries')
            const { result } = renderHook(
                () => useAIAgentTicketsPerIntent(statsFilters, timezone),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )
            expect(result.current).toEqual(totalTicketsMetric)
        })
    })

    describe('useSuccessRatePerIntent', () => {
        it('should enrich success rate per intent correctly', () => {
            useMetricPerDimensionMock
                .mockReturnValueOnce({
                    // aiAgentAutomatedTicketsData
                    data: {
                        decile: null,
                        value: null,
                        allData: [
                            { [TicketDimension.TicketId]: '1' },
                            { [TicketDimension.TicketId]: '2' },
                            { [TicketDimension.TicketId]: '3' },
                        ],
                    },
                    isFetching: false,
                    isError: false,
                })
                .mockReturnValueOnce({
                    // aiAgentTicketsData
                    data: {
                        decile: null,
                        value: null,
                        allData: [
                            { [TicketDimension.TicketId]: '1' },
                            { [TicketDimension.TicketId]: '2' },
                            { [TicketDimension.TicketId]: '3' },
                        ],
                    },
                    isFetching: false,
                    isError: false,
                })
                // aiAgentTicketsGroupedByIntent
                .mockReturnValueOnce(totalTicketsMetric)
                //useAiAgentTicketCountPerIntent
                .mockReturnValueOnce(customFieldsMetric)

            jest.spyOn(queryClient, 'invalidateQueries')
            const { result } = renderHook(
                () => useSuccessRatePerIntent(statsFilters, timezone),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )
            expect(result.current.data).toEqual([
                {
                    [BREAKDOWN_FIELD]: 'Other::Other',
                    [TICKET_COUNT]: '5',
                    [CUSTOM_FIELD_COUNT]: '1',
                    successRate: 0.2,
                },
                {
                    [BREAKDOWN_FIELD]: 'Other::App',
                    [TICKET_COUNT]: '4',
                    [CUSTOM_FIELD_COUNT]: '1',
                    successRate: 0.25,
                },
                {
                    [BREAKDOWN_FIELD]: 'Other::Platform',
                    [TICKET_COUNT]: '10',
                    [CUSTOM_FIELD_COUNT]: '3',
                    successRate: 0.3,
                },
            ])
        })
    })

    describe('useCustomerSatisfactionPerIntent', () => {
        it('should return csat per intent correctly', () => {
            useMetricPerDimensionMock.mockReturnValueOnce(csatPerIntentMetric)
            useMetricPerDimensionMock.mockReturnValueOnce({
                data: {
                    allData: [
                        {
                            'TicketCustomFieldsEnriched.valueString':
                                'Marketing::Other',
                            'TicketEnriched.ticketId': '1',
                        },
                        {
                            'TicketCustomFieldsEnriched.valueString':
                                'Feedback::Negative',
                            'TicketEnriched.ticketId': '2',
                        },
                        {
                            'TicketCustomFieldsEnriched.valueString':
                                'Other::Other',
                            'TicketEnriched.ticketId': '3',
                        },
                    ],
                    value: null,
                    decile: null,
                },
                isFetching: false,
                isError: false,
            })

            jest.spyOn(queryClient, 'invalidateQueries')
            const { result } = renderHook(
                () => useCustomerSatisfactionPerIntent(statsFilters, timezone),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )
            expect(result.current).toEqual({
                data: [
                    {
                        'TicketCustomFieldsEnriched.valueString':
                            'Marketing::Other',
                        'TicketSatisfactionSurveyEnriched.avgSurveyScore': '5',
                        'TicketSatisfactionSurveyEnriched.ticketId': '1',
                        decile: '9',
                    },
                    {
                        'TicketCustomFieldsEnriched.valueString':
                            'Feedback::Negative',
                        'TicketSatisfactionSurveyEnriched.avgSurveyScore': '5',
                        'TicketSatisfactionSurveyEnriched.ticketId': '2',
                        decile: '6',
                    },
                    {
                        'TicketCustomFieldsEnriched.valueString':
                            'Other::Other',
                        'TicketSatisfactionSurveyEnriched.avgSurveyScore':
                            '2.3',
                        'TicketSatisfactionSurveyEnriched.ticketId': '3',
                        decile: '2',
                    },
                ],
                isError: false,
                isFetching: false,
            })
        })

        it('should filter data based on intent', () => {
            useMetricPerDimensionMock.mockReturnValueOnce(csatPerIntentMetric)
            useMetricPerDimensionMock.mockReturnValueOnce({
                data: {
                    allData: [
                        {
                            'TicketCustomFieldsEnriched.valueString':
                                'Marketing::Other',
                            'TicketEnriched.ticketId': '1',
                        },
                        {
                            'TicketCustomFieldsEnriched.valueString':
                                'Feedback::Negative',
                            'TicketEnriched.ticketId': '2',
                        },
                        {
                            'TicketCustomFieldsEnriched.valueString':
                                'Other::Other',
                            'TicketEnriched.ticketId': '3',
                        },
                    ],
                    value: null,
                    decile: null,
                },
                isFetching: false,
                isError: false,
            })

            jest.spyOn(queryClient, 'invalidateQueries')
            const { result } = renderHook(
                () =>
                    useCustomerSatisfactionPerIntent(
                        statsFilters,
                        timezone,
                        OrderDirection.Asc,
                        'Marketing::Other',
                    ),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )
            expect(result.current).toEqual({
                data: [
                    {
                        'TicketCustomFieldsEnriched.valueString':
                            'Marketing::Other',
                        'TicketSatisfactionSurveyEnriched.avgSurveyScore': '5',
                        'TicketSatisfactionSurveyEnriched.ticketId': '1',
                        decile: '9',
                    },
                ],
                isError: false,
                isFetching: false,
            })
        })
    })

    describe('useAiAgentKnowledgeResourcePerIntent', () => {
        it('should return ai agent knowledge resource per intent correctly', () => {
            useMetricPerDimensionMock
                .mockReturnValueOnce({
                    // mock useAiAgenTickets
                    data: {
                        decile: null,
                        value: null,
                        allData: [
                            {
                                'TicketEnriched.ticketId': '1',
                            },
                            {
                                'TicketEnriched.ticketId': '2',
                            },
                            {
                                'TicketEnriched.ticketId': '3',
                            },
                        ],
                    },
                    isFetching: false,
                    isError: false,
                })
                .mockReturnValueOnce({
                    // aiAgentAutomatedTicketsDataWithIntent
                    data: {
                        decile: null,
                        value: null,
                        allData: [
                            {
                                'TicketEnriched.customField': '1::intentA',
                                'TicketEnriched.ticketId': '1',
                            },
                            {
                                'TicketEnriched.customField': '1::intentA',
                                'TicketEnriched.ticketId': '2',
                            },
                            {
                                'TicketEnriched.customField': '1::intentA',
                                'TicketEnriched.ticketId': '3',
                            },
                        ],
                    },
                    isFetching: false,
                    isError: false,
                })
                .mockReturnValueOnce({
                    // resourcePerTicketId
                    data: {
                        decile: null,
                        value: null,
                        allData: [
                            {
                                [RecommendedResourcesMeasure.NumRecommendedResources]:
                                    '1',
                                [RecommendedResourcesDimension.RecommendedResourceId]:
                                    '1',
                                [RecommendedResourcesDimension.TicketId]: '1',
                            },
                            {
                                [RecommendedResourcesMeasure.NumRecommendedResources]:
                                    '2',
                                [RecommendedResourcesDimension.TicketId]: '2',
                                [RecommendedResourcesDimension.RecommendedResourceId]:
                                    '2',
                            },
                        ],
                    },
                    isFetching: false,
                    isError: false,
                })

            jest.spyOn(queryClient, 'invalidateQueries')
            const { result } = renderHook(
                () =>
                    useAiAgentKnowledgeResourcePerIntent(
                        statsFilters,
                        timezone,
                    ),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )
            expect(result.current.data).toEqual([
                {
                    'TicketEnriched.customField': 'intentA',
                    resources: 3,
                },
            ])
        })

        it('should return empty array when data not available', () => {
            useMetricPerDimensionMock
                .mockReturnValueOnce({
                    // mock useAiAgenTickets
                    data: {
                        decile: null,
                        value: null,
                        allData: [],
                    },
                    isFetching: false,
                    isError: false,
                })
                .mockReturnValueOnce({
                    // aiAgentAutomatedTicketsDataWithIntent
                    data: {
                        decile: null,
                        value: null,
                        allData: [],
                    },
                    isFetching: false,
                    isError: false,
                })
                .mockReturnValueOnce({
                    // resourcePerTicketId
                    data: {
                        decile: null,
                        value: null,
                        allData: [],
                    },
                    isFetching: false,
                    isError: false,
                })

            jest.spyOn(queryClient, 'invalidateQueries')
            const { result } = renderHook(
                () =>
                    useAiAgentKnowledgeResourcePerIntent(
                        statsFilters,
                        timezone,
                    ),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )
            expect(result.current.data).toEqual([])
        })
    })

    describe('addMetricDataToResults', () => {
        it('adds metric data correctly when intents are present', () => {
            const results: Record<string, any> = {}
            const metricData = [
                {
                    'TicketCustomFieldsEnriched.valueString': 'intentA',
                    metricKey: 10,
                },
                {
                    'TicketCustomFieldsEnriched.valueString': 'intentB',
                    metricKey: 20,
                },
            ]

            addMetricDataToResults(results, metricData, 'metricKey')

            expect(results).toEqual({
                intentA: { metricKey: 10 },
                intentB: { metricKey: 20 },
            })
        })

        it('uses resultKey when provided to rename the metric key', () => {
            const results: Record<string, any> = {}
            const metricData = [
                {
                    'TicketCustomFieldsEnriched.valueString': 'intentA',
                    ticketCount: 5,
                },
                {
                    'TicketCustomFieldsEnriched.valueString': 'intentB',
                    ticketCount: 8,
                },
            ]

            addMetricDataToResults(
                results,
                metricData,
                'ticketCount',
                'tickets',
            )

            expect(results).toEqual({
                intentA: { tickets: 5 },
                intentB: { tickets: 8 },
            })
        })

        it('merges new metrics with existing results', () => {
            const results: Record<string, any> = {
                intentA: { metricKey: 10 },
            }
            const metricData = [
                {
                    'TicketCustomFieldsEnriched.valueString': 'intentA',
                    ticketCount: 15,
                },
                {
                    'TicketCustomFieldsEnriched.valueString': 'intentB',
                    ticketCount: 20,
                },
            ]

            addMetricDataToResults(
                results,
                metricData,
                'ticketCount',
                'tickets',
            )

            expect(results).toEqual({
                intentA: { metricKey: 10, tickets: 15 },
                intentB: { tickets: 20 },
            })
        })

        it('handles empty metricData array gracefully', () => {
            const results: Record<string, any> = {}
            const metricData: Record<string, string | number | null>[] = []

            addMetricDataToResults(results, metricData, 'metricKey')

            expect(results).toEqual({})
        })

        it('overwrites existing metric keys with new values', () => {
            const results: Record<string, any> = {
                intentA: { metricKey: 10 },
            }
            const metricData: Record<string, string | number | null>[] = [
                {
                    'TicketCustomFieldsEnriched.valueString': 'intentA',
                    metricKey: 25,
                },
            ]

            addMetricDataToResults(results, metricData, 'metricKey')

            expect(results).toEqual({
                intentA: { metricKey: 25 },
            })
        })
    })

    describe('convertResultToTableArrayFormat', () => {
        enum intentFixture {
            IntentAL1L2 = 'intentA::subIntentA',
            IntentBL1L2 = 'intentB::subIntentB',
            IntentAL1 = 'intentA',
            IntentBL1 = 'intentB',
            IntentAL2 = 'subIntentA',
            IntentBL2 = 'subIntentB',
        }

        it('converts results object to array format with transformed names', () => {
            const results = {
                [intentFixture.IntentAL1L2]: {
                    [IntentTableColumn.AutomationOpportunities]: 10,
                    [IntentTableColumn.Tickets]: 20,
                },
                [intentFixture.IntentBL1L2]: {
                    [IntentTableColumn.AutomationOpportunities]: 15,
                    [IntentTableColumn.Tickets]: 25,
                },
            } as unknown as Record<string, IntentMetrics>

            const result = convertResultToTableArrayFormat(results)

            expect(result).toEqual([
                {
                    [IntentTableColumn.AutomationOpportunities]: 10,
                    [IntentTableColumn.Tickets]: 20,
                    [IntentTableColumn.IntentName]: `${intentFixture.IntentAL1}/${intentFixture.IntentAL2}`,
                    id: intentFixture.IntentAL1L2,
                },
                {
                    [IntentTableColumn.AutomationOpportunities]: 15,
                    [IntentTableColumn.Tickets]: 25,
                    [IntentTableColumn.IntentName]: `${intentFixture.IntentBL1}/${intentFixture.IntentBL2}`,
                    id: intentFixture.IntentBL1L2,
                },
            ])
        })

        it('handles empty results object gracefully', () => {
            const results: Record<string, IntentMetrics> = {}

            const result = convertResultToTableArrayFormat(results)

            expect(result).toEqual([])
        })

        it('preserves all metric fields in the converted array', () => {
            const results = {
                intentA: {
                    [IntentTableColumn.AutomationOpportunities]: 5,
                    [IntentTableColumn.Tickets]: 10,
                    [IntentTableColumn.SuccessRate]: 15,
                    id: intentFixture.IntentAL1,
                },
            } as unknown as Record<string, IntentMetrics>

            const result = convertResultToTableArrayFormat(results)

            expect(result).toEqual([
                {
                    [IntentTableColumn.AutomationOpportunities]: 5,
                    [IntentTableColumn.Tickets]: 10,
                    [IntentTableColumn.SuccessRate]: 15,
                    [IntentTableColumn.IntentName]: intentFixture.IntentAL1,
                    id: intentFixture.IntentAL1,
                },
            ])
        })
    })
})
