import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'
import { useParams } from 'react-router-dom'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import type {
    EnrichedTicketCustomFieldsWithSuccessRate,
    EnrichedTicketCustomFieldsWithSuccessRateUpliftOpportunity,
} from 'domains/reporting/hooks/automate/types'
import {
    useAIAgentTicketsPerIntent,
    useCustomerSatisfactionPerIntent,
    useSuccessRatePerIntent,
    useSuccessRateUpliftOpportunityPerIntent,
} from 'domains/reporting/hooks/automate/useAIAgentInsightsDataset'
import {
    useAIAgentTicketsForIntentTrendMetric,
    useAutomatedOpportunityForIntentTrendMetric,
    useCustomerSatisfactionForIntentTrendMetric,
    useInsightPerformanceMetrics,
    useSuccessRateForIntentTrendMetric,
} from 'domains/reporting/hooks/automate/useAIAgentInsightsL2Dataset'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { filterMetricDataByIntentLevel } from 'domains/reporting/hooks/automate/utils'
import type { QueryReturnType } from 'domains/reporting/hooks/useMetricPerDimension'
import type { TicketCustomFieldsCube } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ticketFieldDefinitions } from 'fixtures/customField'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import { OrderDirection } from 'models/api/types'

const timezone = 'UTC'

jest.mock('domains/reporting/hooks/timeSeries')
jest.mock('domains/reporting/hooks/useMetric')
jest.mock('domains/reporting/hooks/useMetricPerDimension')
jest.mock('domains/reporting/hooks/useMultipleMetricsTrend')

jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
jest.mock('domains/reporting/hooks/automate/useAIAgentInsightsDataset')

jest.mock('domains/reporting/hooks/automate/utils')
jest.mock('hooks/integrations/useGetTicketChannelsStoreIntegrations')

const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)
const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)
const useAIAgentTicketsPerIntentMock = assumeMock(useAIAgentTicketsPerIntent)
const useSuccessRateUpliftOpportunityPerIntentMock = assumeMock(
    useSuccessRateUpliftOpportunityPerIntent,
)

const filterMetricDataByIntentLevelMock = assumeMock(
    filterMetricDataByIntentLevel,
)
const useCustomerSatisfactionPerIntentMock = assumeMock(
    useCustomerSatisfactionPerIntent,
)

const useSuccessRatePerIntentMock = assumeMock(useSuccessRatePerIntent)
const getTicketChannelsStoreIntegrationsMock = assumeMock(
    useGetTicketChannelsStoreIntegrations,
)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
const mockUseParams = assumeMock(useParams)
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

const data = [
    {
        'TicketCustomFieldsEnriched.valueString': 'intentA::subIntentA',
        successRateUpliftOpportunity: 10,
        'TicketCustomFieldsEnriched.ticketCount': 5,
        successRate: 50,
        'TicketSatisfactionSurveyEnriched.avgSurveyScore': 3,
    } as unknown as EnrichedTicketCustomFieldsWithSuccessRateUpliftOpportunity,
    {
        'TicketCustomFieldsEnriched.valueString': 'intentB::subIntentB',
        successRateUpliftOpportunity: 20,
        'TicketCustomFieldsEnriched.ticketCount': 4,
        successRate: 75,
        'TicketSatisfactionSurveyEnriched.avgSurveyScore': 4,
    } as unknown as EnrichedTicketCustomFieldsWithSuccessRateUpliftOpportunity,
]

const intentId = 'intentA::subIntentA'
const sorting = OrderDirection.Desc
const intentLevel = 2
const shopName = 'test-shop'

describe('useAiAgentInsightsL2Dataset', () => {
    beforeEach(() => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: { data: ticketFieldDefinitions },
            isLoading: false,
        } as any)

        useAIAgentUserIdMock.mockReturnValue(2)
        mockUseParams.mockReturnValue({
            shopType: 'shopify',
            shopName: shopName,
        })

        getTicketChannelsStoreIntegrationsMock.mockReturnValue(['1'])
    })

    it('should return automated opportunity trend metric for intent', () => {
        useSuccessRateUpliftOpportunityPerIntentMock
            .mockReturnValueOnce({
                data: [data[0]],
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: [data[1]],
                isFetching: false,
                isError: false,
            })
        filterMetricDataByIntentLevelMock
            .mockReturnValueOnce([{ successRateUpliftOpportunity: 10 }])
            .mockReturnValueOnce([{ successRateUpliftOpportunity: 5 }])

        const { result } = renderHook(() =>
            useAutomatedOpportunityForIntentTrendMetric({
                filters: statsFilters,
                timezone,
                sorting,
                intentId,
                intentLevel,
            }),
        )

        expect(result.current.data.value).toBe(10)
        expect(result.current.data.prevValue).toBe(5)
        expect(result.current.isFetching).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should return tickets trend metric for intent', () => {
        useAIAgentTicketsPerIntentMock
            .mockReturnValueOnce({
                data: {
                    allData: data as unknown as QueryReturnType<
                        string,
                        TicketCustomFieldsCube
                    >,
                    value: null,
                    decile: null,
                },
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: {
                    allData: data as unknown as QueryReturnType<
                        string,
                        TicketCustomFieldsCube
                    >,
                    value: null,
                    decile: null,
                },
                isFetching: false,
                isError: false,
            })
        filterMetricDataByIntentLevelMock
            .mockReturnValueOnce([{ tickets: 5 }])
            .mockReturnValueOnce([{ tickets: 4 }])

        const { result } = renderHook(() =>
            useAIAgentTicketsForIntentTrendMetric({
                filters: statsFilters,
                timezone,
                sorting,
                intentId,
                intentLevel,
            }),
        )

        expect(result.current.data.value).toBe(5)
        expect(result.current.data.prevValue).toBe(4)
        expect(result.current.isFetching).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should return customer satisfaction trend metric for intent', () => {
        useCustomerSatisfactionPerIntentMock
            .mockReturnValueOnce({
                data: data as unknown as {
                    'TicketCustomFieldsEnriched.valueString':
                        | string
                        | string
                        | undefined
                }[],
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: data as unknown as {
                    'TicketCustomFieldsEnriched.valueString':
                        | string
                        | string
                        | undefined
                }[],
                isFetching: false,
                isError: false,
            })
        filterMetricDataByIntentLevelMock
            .mockReturnValueOnce([{ avgCustomerSatisfaction: 3 }])
            .mockReturnValueOnce([{ avgCustomerSatisfaction: 4 }])

        const { result } = renderHook(() =>
            useCustomerSatisfactionForIntentTrendMetric({
                filters: statsFilters,
                timezone,
                sorting,
                intentId,
                intentLevel,
            }),
        )

        expect(result.current.data.value).toBe(3)
        expect(result.current.data.prevValue).toBe(4)
        expect(result.current.isFetching).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should return success rate trend metric for intent', () => {
        useSuccessRatePerIntentMock
            .mockReturnValueOnce({
                data: [
                    data[0],
                ] as unknown as EnrichedTicketCustomFieldsWithSuccessRate[],
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: [
                    data[1],
                ] as unknown as EnrichedTicketCustomFieldsWithSuccessRate[],
                isFetching: false,
                isError: false,
            })
        filterMetricDataByIntentLevelMock
            .mockReturnValueOnce([{ successRate: 50 }])
            .mockReturnValueOnce([{ successRate: 75 }])

        const { result } = renderHook(() =>
            useSuccessRateForIntentTrendMetric({
                filters: statsFilters,
                timezone,
                sorting,
                intentId,
                intentLevel,
            }),
        )

        expect(result.current.data.value).toBe(50)
        expect(result.current.data.prevValue).toBe(75)
        expect(result.current.isFetching).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should return all performance metrics for intent', () => {
        // successRateUpliftOpportunityPerIntent
        useSuccessRateUpliftOpportunityPerIntentMock.mockReturnValue({
            data: [data[0]],
            isFetching: false,
            isError: false,
        })
        filterMetricDataByIntentLevelMock
            .mockReturnValueOnce([{ successRateUpliftOpportunity: 10 }])
            .mockReturnValueOnce([{ successRateUpliftOpportunity: 5 }])
        // ticketsPerIntent
        useAIAgentTicketsPerIntentMock
            .mockReturnValueOnce({
                data: {
                    allData: data as unknown as QueryReturnType<
                        string,
                        TicketCustomFieldsCube
                    >,
                    value: null,
                    decile: null,
                },
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: {
                    allData: data as unknown as QueryReturnType<
                        string,
                        TicketCustomFieldsCube
                    >,
                    value: null,
                    decile: null,
                },
                isFetching: false,
                isError: false,
            })
        filterMetricDataByIntentLevelMock
            .mockReturnValueOnce([{ tickets: 5 }])
            .mockReturnValueOnce([{ tickets: 4 }])
        // successRatePerIntent
        useSuccessRatePerIntentMock
            .mockReturnValueOnce({
                data: [
                    data[0],
                ] as unknown as EnrichedTicketCustomFieldsWithSuccessRate[],
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: [
                    data[1],
                ] as unknown as EnrichedTicketCustomFieldsWithSuccessRate[],
                isFetching: false,
                isError: false,
            })
        filterMetricDataByIntentLevelMock
            .mockReturnValueOnce([{ successRate: 50 }])
            .mockReturnValueOnce([{ successRate: 75 }])

        // customerSatisfactionPerIntent
        useCustomerSatisfactionPerIntentMock
            .mockReturnValueOnce({
                data: data as unknown as {
                    'TicketCustomFieldsEnriched.valueString':
                        | string
                        | string
                        | undefined
                }[],
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: data as unknown as {
                    'TicketCustomFieldsEnriched.valueString':
                        | string
                        | string
                        | undefined
                }[],
                isFetching: false,
                isError: false,
            })
        filterMetricDataByIntentLevelMock
            .mockReturnValueOnce([{ avgCustomerSatisfaction: 3 }])
            .mockReturnValueOnce([{ avgCustomerSatisfaction: 4 }])

        const { result } = renderHook(() =>
            useInsightPerformanceMetrics({
                filters: statsFilters,
                timezone,
                sorting,
                intentId,
                intentLevel,
                shopName,
            }),
        )

        expect(
            result.current.successRateUpliftOpportunityPerIntent.data.value,
        ).toBe(10)
        expect(
            result.current.successRateUpliftOpportunityPerIntent.data.prevValue,
        ).toBe(5)
        expect(result.current.ticketsPerIntent.data.value).toBe(5)
        expect(result.current.ticketsPerIntent.data.prevValue).toBe(4)
        expect(result.current.successRatePerIntent.data.value).toBe(50)
        expect(result.current.successRatePerIntent.data.prevValue).toBe(75)
        expect(result.current.customerSatisfactionPerIntent.data.value).toBe(3)
        expect(
            result.current.customerSatisfactionPerIntent.data.prevValue,
        ).toBe(4)
        expect(
            result.current.successRateUpliftOpportunityPerIntent.isFetching,
        ).toBe(false)
        expect(
            result.current.successRateUpliftOpportunityPerIntent.isError,
        ).toBe(false)
        expect(result.current.ticketsPerIntent.isFetching).toBe(false)
        expect(result.current.ticketsPerIntent.isError).toBe(false)
        expect(result.current.successRatePerIntent.isFetching).toBe(false)
        expect(result.current.successRatePerIntent.isError).toBe(false)
        expect(result.current.customerSatisfactionPerIntent.isFetching).toBe(
            false,
        )
        expect(result.current.customerSatisfactionPerIntent.isError).toBe(false)
    })
})
