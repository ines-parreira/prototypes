import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'
import React from 'react'

import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {
    csatPerIntentMetric,
    customFieldsMetric,
    totalTicketsMetric,
} from 'fixtures/aiAgentInsights'
import {ticketFieldDefinitions} from 'fixtures/customField'
import {useMetric} from 'hooks/reporting/useMetric'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {StatsFilters} from 'models/stat/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import {BREAKDOWN_FIELD, CUSTOM_FIELD_COUNT, TICKET_COUNT} from '../types'
import {
    useAIAgentMetrics,
    useAIAgentTicketsPerIntent,
    useAutomationOpportunityPerIntent,
    useCustomerSatisfactionPerIntent,
    useSuccessRatePerIntent,
} from '../useAIAgentInsightsDataset'
import {useAIAgentUserId} from '../useAIAgentUserId'

const queryClient = mockQueryClient()
const timezone = 'UTC'

jest.mock('hooks/reporting/timeSeries')
jest.mock('hooks/reporting/useMetric')
jest.mock('hooks/reporting/useMetricPerDimension')
jest.mock('hooks/reporting/useMultipleMetricsTrend')

jest.mock('hooks/reporting/automate/useAIAgentUserId')
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')

const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)
const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)
const useMetricMock = assumeMock(useMetric)
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

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

describe('useAiAgentInsightsDataset', () => {
    beforeEach(() => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: ticketFieldDefinitions},
            isLoading: false,
        } as any)

        useAIAgentUserIdMock.mockReturnValue('2')
    })

    describe('useAiAgentMetrics', () => {
        it('should calculate ai agent insights correctly', () => {
            useMultipleMetricsTrendsMock
                .mockReturnValueOnce({
                    // allAutomatedInteractionsData
                    data: {
                        'AutomationDataset.automatedInteractions': {
                            value: 10021,
                            prevValue: 0,
                        },
                        'AutomationDataset.automatedInteractionsByAutoResponders':
                            {
                                value: 1108,
                                prevValue: 0,
                            },
                    },
                    isFetched: true,
                } as any)
                .mockReturnValueOnce({
                    // aiAgentAutomatedInteractionsData
                    data: {
                        'AutomationDataset.automatedInteractions': {
                            value: 1000,
                            prevValue: 0,
                        },
                        'AutomationDataset.automatedInteractionsByAutoResponders':
                            {
                                value: 1000,
                                prevValue: 0,
                            },
                    },
                    isFetched: true,
                } as any)
                .mockReturnValueOnce({
                    // aiAgentTicketsData
                    data: {
                        'TicketCustomFieldsEnriched.ticketCount': {
                            value: 1100,
                            prevValue: 2,
                        },
                    },
                    isFetched: true,
                } as any)
                .mockReturnValueOnce({
                    // ticketDatasetExcludingAIAgent
                    data: {
                        'BillableTicketDataset.billableTicketCount': {
                            value: 4889,
                            prevValue: 2,
                        },
                        'BillableTicketDataset.totalFirstResponseTime': {
                            value: 5220830659,
                            prevValue: 7200,
                        },
                        'BillableTicketDataset.totalResolutionTime': {
                            value: 14048308139,
                            prevValue: 142113600,
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
            const {result} = renderHook(
                () => useAIAgentMetrics(statsFilters, timezone),
                {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                }
            )

            expect(result.current.coverageTrend.data?.value).toBeCloseTo(0.08)
            expect(
                result.current.aiAgentAutomatedInteractionTrend.data
            ).toEqual({
                prevValue: 0,
                value: 1000,
            })
            expect(result.current.aiAgentSuccessRate.data?.value).toBeCloseTo(
                0.91
            )
            expect(result.current.aiAgentCSAT.data).toEqual({
                prevValue: 4,
                value: 5,
            })
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
                        {[TicketDimension.TicketId]: '1'},
                        {[TicketDimension.TicketId]: '2'},
                        {[TicketDimension.TicketId]: '3'},
                    ],
                },
                isFetching: false,
                isError: false,
            } as any)
            // useAiAgentTicketCountPerIntent
            .mockReturnValueOnce(customFieldsMetric)

        jest.spyOn(queryClient, 'invalidateQueries')
        const {result} = renderHook(
            () => useAutomationOpportunityPerIntent(statsFilters, timezone),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            }
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
                        {[TicketDimension.TicketId]: '1'},
                        {[TicketDimension.TicketId]: '2'},
                        {[TicketDimension.TicketId]: '3'},
                    ],
                },
                isFetching: false,
                isError: false,
            } as any)
            // useAiAgentTicketCountPerIntent
            .mockReturnValueOnce(customFieldsMetric)

        jest.spyOn(queryClient, 'invalidateQueries')
        const {result} = renderHook(
            () => useAutomationOpportunityPerIntent(statsFilters, timezone),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            }
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
                        {[TicketDimension.TicketId]: '1'},
                        {[TicketDimension.TicketId]: '2'},
                        {[TicketDimension.TicketId]: '3'},
                    ],
                },
                isFetching: false,
                isError: false,
            } as any)
            // aiAgentTicketsGroupedByIntent
            .mockReturnValueOnce(totalTicketsMetric)

        jest.spyOn(queryClient, 'invalidateQueries')
        const {result} = renderHook(
            () => useAIAgentTicketsPerIntent(statsFilters, timezone),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            }
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
                        {[TicketDimension.TicketId]: '1'},
                        {[TicketDimension.TicketId]: '2'},
                        {[TicketDimension.TicketId]: '3'},
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
                        {[TicketDimension.TicketId]: '1'},
                        {[TicketDimension.TicketId]: '2'},
                        {[TicketDimension.TicketId]: '3'},
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
        const {result} = renderHook(
            () => useSuccessRatePerIntent(statsFilters, timezone),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            }
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

        jest.spyOn(queryClient, 'invalidateQueries')
        const {result} = renderHook(
            () => useCustomerSatisfactionPerIntent(statsFilters, timezone),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            }
        )
        expect(result.current).toEqual(csatPerIntentMetric)
    })
})
