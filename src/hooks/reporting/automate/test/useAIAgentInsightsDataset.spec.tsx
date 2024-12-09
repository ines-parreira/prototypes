import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'
import React from 'react'

import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {ticketFieldDefinitions} from 'fixtures/customField'
import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {StatsFilters} from 'models/stat/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import {useAIAgentMetrics} from '../useAIAgentInsightsDataset'
import {useAIAgentUserId} from '../useAIAgentUserId'

const queryClient = mockQueryClient()
const timezone = 'UTC'

jest.mock('hooks/reporting/timeSeries')
jest.mock('hooks/reporting/useMultipleMetricsTrend')
jest.mock('hooks/reporting/automate/useAIAgentUserId')
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')

const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)
const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)

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
