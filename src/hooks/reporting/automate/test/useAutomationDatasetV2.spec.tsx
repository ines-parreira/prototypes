import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'
import {QueryClientProvider, UseQueryResult} from '@tanstack/react-query'
import {StatsFilters} from 'models/stat/types'
import {ReportingGranularity} from 'models/reporting/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'
import {
    useAutomationDatasetByEventTypeTimeSeries,
    useAutomationDatasetTimeSeries,
    useBillableTicketDatasetTimeSeries,
} from 'hooks/reporting/timeSeries'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {AUTOMATION_RATE_LABEL} from 'pages/stats/self-service/constants'
import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {
    useAutomateMetricsTimeseriesV2,
    useAutomateMetricsTrendV2,
} from '../useAutomationDatasetV2'
import {AutomateEventType} from '../utils'
import {useAIAgentUserId} from '../useAIAgentUserId'

const queryClient = mockQueryClient()
const timezone = 'UTC'
const granularity = ReportingGranularity.Day
const getMockData = (
    values: number[],
    measure = 'AutomationDataset.automatedInteractions'
) => {
    const data = []
    for (const i of values) {
        data.push({
            dateTime: moment()
                .add(i * 7, 'day')
                .format('YYYY-MM-DDT00:00:00.000'),
            value: i,
            label: measure,
        })
    }
    return data
}

const automatedInteractionsDataByEventType = {
    article_recommendation_started: [
        getMockData(
            [1, 2, 3],
            AutomateEventType.ARTICLE_RECOMMENDATION_STARTED
        ),
    ],
    flow_started: [getMockData([1, 2, 3], AutomateEventType.FLOW_STARTED)],
    automated_response_started: [
        getMockData([1, 2, 3], AutomateEventType.AUTOMATED_RESPONSE_STARTED),
    ],
    track_order: [getMockData([1, 2, 3], AutomateEventType.TRACK_ORDER)],
    loop_returns_started: [
        getMockData([1, 2, 3], AutomateEventType.LOOP_RETURNS_STARTED),
    ],
    ticket_message_created_from_autoresponder: [
        getMockData(
            [1, 2, 3],
            AutomateEventType.TICKET_MESSAGE_CREATED_FROM_AUTORESPONDER
        ),
    ],
    quick_response_started: [
        getMockData([1, 2, 3], AutomateEventType.QUICK_RESPONSE_STARTED),
    ],
}

jest.mock('hooks/reporting/timeSeries')
jest.mock('hooks/reporting/useMultipleMetricsTrend')
jest.mock('hooks/reporting/automate/useAIAgentUserId')
const useAutomationDatasetTimeSeriesMock = assumeMock(
    useAutomationDatasetTimeSeries
)
const useAutomationDatasetByEventTypeTimeSeriesMock = assumeMock(
    useAutomationDatasetByEventTypeTimeSeries
)

const useBillableTicketDatasetTimeSeriesMock = assumeMock(
    useBillableTicketDatasetTimeSeries
)
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
describe('useAutomationDatasetV2', () => {
    it('useAutomateMetricsTimeseriesV2', () => {
        useAutomationDatasetTimeSeriesMock.mockReturnValue({
            data: [
                getMockData([2, 3, 7]),
                getMockData(
                    [0, 1, 1],
                    'AutomationDataset.automatedInteractionsByAutoResponders'
                ),
            ],
            isFetched: true,
        } as UseQueryResult<TimeSeriesDataItem[][]>)
        useBillableTicketDatasetTimeSeriesMock.mockReturnValue({
            data: [
                getMockData(
                    [1, 2, 6],
                    'BillableTicketDataset.billableTicketCount'
                ),
            ],
            isFetched: true,
        } as UseQueryResult<TimeSeriesDataItem[][]>)
        useAIAgentUserIdMock.mockReturnValue('4000')
        useAutomationDatasetByEventTypeTimeSeriesMock.mockReturnValue({
            data: automatedInteractionsDataByEventType,
            isFetched: true,
        } as any)

        jest.spyOn(queryClient, 'invalidateQueries')
        const {result} = renderHook(
            () =>
                useAutomateMetricsTimeseriesV2(
                    statsFilters,
                    timezone,
                    granularity
                ),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            }
        )

        expect(result.current.automationRateTimeSeries).toEqual([
            [
                {
                    dateTime: expect.any(String),
                    value: 0.6666666666666666, // 2/(2+1-0)
                    label: AUTOMATION_RATE_LABEL,
                },
                {
                    dateTime: expect.any(String),
                    value: 0.75, // 3/(3+2-1)
                    label: AUTOMATION_RATE_LABEL,
                },
                {
                    dateTime: expect.any(String),
                    value: 0.5833333333333334, // 7/(7+6-1)
                    label: AUTOMATION_RATE_LABEL,
                },
            ],
        ])
    })

    describe('useAutomateMetricsTrendV2', () => {
        it('should calculate automation rate correctly', () => {
            useMultipleMetricsTrendsMock
                .mockReturnValueOnce({
                    // filteredAutomatedInteractionsData
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
                    // ticketDatasetIncludingAIAgent
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
                    // ticketDatasetResolvedByAIAgent
                    data: {
                        'BillableTicketDataset.billableTicketCount': {
                            value: 0,
                            prevValue: 0,
                        },
                        'BillableTicketDataset.totalFirstResponseTime': {
                            value: 0,
                            prevValue: 0,
                        },
                        'BillableTicketDataset.totalResolutionTime': {
                            value: 0,
                            prevValue: 0,
                        },
                    },
                    isFetched: true,
                } as any)
            useAutomationDatasetByEventTypeTimeSeriesMock.mockReturnValue({
                data: automatedInteractionsDataByEventType,
                isFetched: true,
            } as unknown as UseQueryResult<
                Record<string, TimeSeriesDataItem[][]>
            >)

            jest.spyOn(queryClient, 'invalidateQueries')
            const {result} = renderHook(
                () => useAutomateMetricsTrendV2(statsFilters, timezone),
                {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                }
            )

            expect(result.current.automatedInteractionTrend.data).toEqual({
                prevValue: 0,
                value: 10021,
            })
            expect(result.current.automationRateTrend.data).toEqual({
                prevValue: 0,
                value: 0.7260541950441965,
            })
            expect(
                result.current.decreaseInFirstResponseTimeTrend.data
            ).toEqual({
                prevValue: 0,
                value: 717716.5952535146,
            })
            expect(result.current.decreaseInResolutionTimeTrend.data).toEqual({
                prevValue: 0,
                value: 1931245.1495077917,
            })
        })
    })
})
