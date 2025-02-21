import {QueryClientProvider, UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'

import moment from 'moment'
import React from 'react'

import {
    useAllAutomatedInteractions,
    useAllAutomatedInteractionsByAutoResponders,
    useBillableTicketsExcludingAIAgent,
    useFilteredAutomatedInteractions,
    useFilteredAutomatedInteractionsByAutoResponders,
    useFirstResponseTimeExcludingAIAgent,
    useFirstResponseTimeIncludingAIAgent,
    useResolutionTimeExcludingAIAgent,
    useResolutionTimeResolvedByAIAgent,
} from 'hooks/reporting/automate/automationTrends'
import {
    fetchAutomationDatasetByEventTypeTimeSeries,
    fetchAutomationDatasetTimeSeries,
    fetchBillableTicketDatasetTimeSeries,
    useAutomationDatasetByEventTypeTimeSeries,
    useAutomationDatasetTimeSeries,
    useBillableTicketDatasetTimeSeries,
} from 'hooks/reporting/automate/timeSeries'
import {useAIAgentUserId} from 'hooks/reporting/automate/useAIAgentUserId'
import {
    fetchAutomateMetricsTimeSeries,
    useAutomateMetricsTimeSeries,
    useAutomateMetricsTrend,
} from 'hooks/reporting/automate/useAutomationDataset'

import {AutomateEventType} from 'hooks/reporting/automate/utils'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {AUTOMATION_RATE_LABEL} from 'pages/stats/self-service/constants'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

const queryClient = mockQueryClient()
const timezone = 'UTC'
const granularity = ReportingGranularity.Day
export const getMockData = (
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

jest.mock('hooks/reporting/automate/useAIAgentUserId')
const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)
jest.mock('hooks/reporting/automate/timeSeries')
const useAutomationDatasetTimeSeriesMock = assumeMock(
    useAutomationDatasetTimeSeries
)
const fetchAutomationDatasetTimeSeriesMock = assumeMock(
    fetchAutomationDatasetTimeSeries
)
const useAutomationDatasetByEventTypeTimeSeriesMock = assumeMock(
    useAutomationDatasetByEventTypeTimeSeries
)
const fetchAutomationDatasetByEventTypeTimeSeriesMock = assumeMock(
    fetchAutomationDatasetByEventTypeTimeSeries
)
const useBillableTicketDatasetTimeSeriesMock = assumeMock(
    useBillableTicketDatasetTimeSeries
)
const fetchBillableTicketDatasetTimeSeriesMock = assumeMock(
    fetchBillableTicketDatasetTimeSeries
)
jest.mock('hooks/reporting/automate/automationTrends')
const useFilteredAutomatedInteractionsMock = assumeMock(
    useFilteredAutomatedInteractions
)
const useAllAutomatedInteractionsByAutoRespondersMock = assumeMock(
    useAllAutomatedInteractionsByAutoResponders
)
const useAllAutomatedInteractionsMock = assumeMock(useAllAutomatedInteractions)
const useBillableTicketsExcludingAIAgentMock = assumeMock(
    useBillableTicketsExcludingAIAgent
)
const useResolutionTimeResolvedByAIAgentMock = assumeMock(
    useResolutionTimeResolvedByAIAgent
)
const useFilteredAutomatedInteractionsByAutoRespondersMock = assumeMock(
    useFilteredAutomatedInteractionsByAutoResponders
)
const useFirstResponseTimeExcludingAIAgentMock = assumeMock(
    useFirstResponseTimeExcludingAIAgent
)
const useFirstResponseTimeIncludingAIAgentMock = assumeMock(
    useFirstResponseTimeIncludingAIAgent
)
const useResolutionTimeExcludingAIAgentMock = assumeMock(
    useResolutionTimeExcludingAIAgent
)

describe('useAutomationDatasetV2', () => {
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
    const aIAgentUserId = '4000'

    it('useAutomateMetricsTimeseriesV2', () => {
        useAIAgentUserIdMock.mockReturnValue(aIAgentUserId)
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

        useAutomationDatasetByEventTypeTimeSeriesMock.mockReturnValue({
            data: automatedInteractionsDataByEventType,
            isFetched: true,
        } as any)

        jest.spyOn(queryClient, 'invalidateQueries')
        const {result} = renderHook(
            () =>
                useAutomateMetricsTimeSeries(
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

    it('fetchAutomateMetricsTimeSeriesV2', async () => {
        fetchAutomationDatasetTimeSeriesMock.mockResolvedValue([
            getMockData([2, 3, 7]),
            getMockData(
                [0, 1, 1],
                'AutomationDataset.automatedInteractionsByAutoResponders'
            ),
        ] as any)
        fetchBillableTicketDatasetTimeSeriesMock.mockResolvedValue([
            getMockData([1, 2, 6], 'BillableTicketDataset.billableTicketCount'),
        ] as any)
        fetchAutomationDatasetByEventTypeTimeSeriesMock.mockResolvedValue({
            data: automatedInteractionsDataByEventType,
            isFetched: true,
        } as any)

        jest.spyOn(queryClient, 'invalidateQueries')
        const result = await fetchAutomateMetricsTimeSeries(
            statsFilters,
            timezone,
            granularity,
            false,
            aIAgentUserId
        )

        expect(result.automationRateTimeSeries).toEqual([
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

    const filteredAutomatedInteractions = {
        value: 10021,
        prevValue: 0,
    }

    const allAutomatedInteractionsData = {
        'AutomationDataset.automatedInteractions': {
            value: 10021,
            prevValue: 0,
        },
        'AutomationDataset.automatedInteractionsByAutoResponders': {
            value: 1108,
            prevValue: 0,
        },
    }
    const BillableTicketsExcludingAIAgent = {
        value: 4889,
        prevValue: 2,
    }
    const ResolutionTimeResolvedByAIAgent = {
        value: 0,
        prevValue: 0,
    }
    const filteredAutomatedInteractionsDataByAutoResponders = {
        value: 1108,
        prevValue: 0,
    }
    const ticketDatasetExcludingAIAgent = {
        value: 5220830659,
        prevValue: 7200,
    }
    const ticketDatasetIncludingAIAgent = {
        value: 5220830659,
        prevValue: 7200,
    }
    const resolutionTimeExcludingAIAgent = {
        value: 14048308139,
        prevValue: 142113600,
    }

    describe('useAutomateMetricsTrendV2', () => {
        it('should calculate automation rate correctly', () => {
            useFilteredAutomatedInteractionsMock.mockReturnValue({
                data: filteredAutomatedInteractions,
                isFetching: false,
                isFetched: true,
            } as any)
            useAllAutomatedInteractionsByAutoRespondersMock.mockReturnValue({
                data: allAutomatedInteractionsData,
                isFetched: true,
                isFetching: false,
            } as any)
            useAllAutomatedInteractionsMock.mockReturnValue({
                data: allAutomatedInteractionsData,
                isFetched: true,
                isFetching: false,
            } as any)

            useBillableTicketsExcludingAIAgentMock.mockReturnValue({
                data: BillableTicketsExcludingAIAgent,
                isFetched: true,
                isFetching: false,
            } as any)

            useResolutionTimeResolvedByAIAgentMock.mockReturnValue({
                data: ResolutionTimeResolvedByAIAgent,
                isFetched: true,
                isFetching: false,
            } as any)
            useFilteredAutomatedInteractionsByAutoRespondersMock.mockReturnValue(
                {
                    data: filteredAutomatedInteractionsDataByAutoResponders,
                    isFetching: false,
                    isFetched: true,
                } as any
            )
            useFirstResponseTimeExcludingAIAgentMock.mockReturnValue({
                data: ticketDatasetExcludingAIAgent,
                isFetched: true,
                isFetching: false,
            } as any)
            useFirstResponseTimeIncludingAIAgentMock.mockReturnValue({
                data: ticketDatasetIncludingAIAgent,
                isFetched: true,
                isFetching: false,
            } as any)
            useResolutionTimeExcludingAIAgentMock.mockReturnValue({
                data: resolutionTimeExcludingAIAgent,
                isFetched: true,
                isFetching: false,
            } as any)
            useAutomationDatasetByEventTypeTimeSeriesMock.mockReturnValue({
                data: automatedInteractionsDataByEventType,
                isFetched: true,
            } as unknown as UseQueryResult<
                Record<string, TimeSeriesDataItem[][]>
            >)

            jest.spyOn(queryClient, 'invalidateQueries')
            const {result} = renderHook(
                () => useAutomateMetricsTrend(statsFilters, timezone),
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
