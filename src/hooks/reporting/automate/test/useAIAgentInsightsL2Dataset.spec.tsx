import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'

import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {ticketFieldDefinitions} from 'fixtures/customField'
import {useAIAgentUserId} from 'hooks/reporting/automate/useAIAgentUserId'
import {QueryReturnType} from 'hooks/reporting/useMetricPerDimension'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketCustomFieldsCube} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {StatsFilters} from 'models/stat/types'
import {assumeMock} from 'utils/testing'

import {
    EnrichedTicketCustomFieldsWithAutomationOpportunity,
    EnrichedTicketCustomFieldsWithSuccessRate,
} from '../types'
import {
    useAIAgentTicketsPerIntent,
    useAutomationOpportunityPerIntent,
    useCustomerSatisfactionPerIntent,
    useSuccessRatePerIntent,
} from '../useAIAgentInsightsDataset'
import {
    useAIAgentTicketsForIntentTrendMetric,
    useAutomatedOpportunityForIntentTrendMetric,
    useCustomerSatisfactionForIntentTrendMetric,
    useSuccessRateForIntentTrendMetric,
    useInsightPerformanceMetrics,
} from '../useAIAgentInsightsL2Dataset'

const timezone = 'UTC'

jest.mock('hooks/reporting/timeSeries')
jest.mock('hooks/reporting/useMetric')
jest.mock('hooks/reporting/useMetricPerDimension')
jest.mock('hooks/reporting/useMultipleMetricsTrend')

jest.mock('hooks/reporting/automate/useAIAgentUserId')
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
jest.mock('../useAIAgentInsightsDataset')

const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)
const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)
const useAutomationOpportunityPerIntentMock = assumeMock(
    useAutomationOpportunityPerIntent
)
const useAIAgentTicketsPerIntentMock = assumeMock(useAIAgentTicketsPerIntent)
const useSuccessRatePerIntentMock = assumeMock(useSuccessRatePerIntent)
const useCustomerSatisfactionPerIntentMock = assumeMock(
    useCustomerSatisfactionPerIntent
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

const data = [
    {
        'TicketCustomFieldsEnriched.valueString': 'intentA',
        automationOpportunity: 10,
        'TicketCustomFieldsEnriched.ticketCount': 5,
        successRate: 50,
        'TicketSatisfactionSurveyEnriched.avgSurveyScore': 3,
    } as unknown as EnrichedTicketCustomFieldsWithAutomationOpportunity,
    {
        'TicketCustomFieldsEnriched.valueString': 'intentB',
        automationOpportunity: 20,
        'TicketCustomFieldsEnriched.ticketCount': 4,
        successRate: 75,
        'TicketSatisfactionSurveyEnriched.avgSurveyScore': 4,
    } as unknown as EnrichedTicketCustomFieldsWithAutomationOpportunity,
]

const intent = 'intentA'

describe('useAiAgentInsightsL2Dataset', () => {
    beforeEach(() => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: ticketFieldDefinitions},
            isLoading: false,
        } as any)

        useAIAgentUserIdMock.mockReturnValue('2')
    })

    it('should return automated opportunity trend metric for intent', () => {
        useAutomationOpportunityPerIntentMock.mockReturnValue({
            data: data,
            isFetching: false,
            isError: false,
        })

        const {result} = renderHook(() =>
            useAutomatedOpportunityForIntentTrendMetric({
                filters: statsFilters,
                intent,
                timezone,
            })
        )

        expect(result.current).toEqual({
            data: {value: 10, prevValue: 10},
            isFetching: false,
            isError: false,
        })
    })

    it('should return tickets trend metric for intent', () => {
        useAIAgentTicketsPerIntentMock.mockReturnValue({
            data: {
                allData:
                    data as unknown as QueryReturnType<TicketCustomFieldsCube>,
                value: null,
                decile: null,
            },
            isFetching: false,
            isError: false,
        })

        const {result} = renderHook(() =>
            useAIAgentTicketsForIntentTrendMetric({
                filters: statsFilters,
                intent,
                timezone,
            })
        )

        expect(result.current).toEqual({
            data: {value: 5, prevValue: 5},
            isFetching: false,
            isError: false,
        })
    })

    it('should return automation rate  trend metric for intent', () => {
        useSuccessRatePerIntentMock.mockReturnValue({
            data: data as unknown as EnrichedTicketCustomFieldsWithSuccessRate[],
            isError: false,
            isFetching: false,
        })

        const {result} = renderHook(() =>
            useSuccessRateForIntentTrendMetric({
                filters: statsFilters,
                intent,
                timezone,
            })
        )

        expect(result.current).toEqual({
            data: {
                value: 50,
                prevValue: 50,
            },
            isFetching: false,
            isError: false,
        })
    })

    it('should return customer satisfaction trend metric for intent', () => {
        useCustomerSatisfactionPerIntentMock.mockReturnValue({
            data: {
                allData:
                    data as unknown as QueryReturnType<HelpdeskMessageCubeWithJoins>,
                value: null,
                decile: null,
            },
            isError: false,
            isFetching: false,
        })

        const {result} = renderHook(() =>
            useCustomerSatisfactionForIntentTrendMetric({
                filters: statsFilters,
                intent,
                timezone,
            })
        )

        expect(result.current).toEqual({
            data: {
                value: 3,
                prevValue: 3,
            },
            isFetching: false,
            isError: false,
        })
    })

    it('should return all trend metrics for intent', () => {
        useAutomationOpportunityPerIntentMock.mockReturnValue({
            data: data,
            isFetching: false,
            isError: false,
        })

        useAIAgentTicketsPerIntentMock.mockReturnValue({
            data: {
                allData:
                    data as unknown as QueryReturnType<TicketCustomFieldsCube>,
                value: null,
                decile: null,
            },
            isFetching: false,
            isError: false,
        })

        useSuccessRatePerIntentMock.mockReturnValue({
            data: data as unknown as EnrichedTicketCustomFieldsWithSuccessRate[],
            isError: false,
            isFetching: false,
        })

        useCustomerSatisfactionPerIntentMock.mockReturnValue({
            data: {
                allData:
                    data as unknown as QueryReturnType<HelpdeskMessageCubeWithJoins>,
                value: null,
                decile: null,
            },
            isError: false,
            isFetching: false,
        })

        const {result} = renderHook(() =>
            useInsightPerformanceMetrics({
                filters: statsFilters,
                intent,
                timezone,
            })
        )

        expect(result.current).toEqual({
            automationOpportunityPerIntent: {
                data: {value: 10, prevValue: 10},
                isFetching: false,
                isError: false,
            },
            ticketsPerIntent: {
                data: {value: 5, prevValue: 5},
                isFetching: false,
                isError: false,
            },
            successRatePerIntent: {
                data: {
                    value: 50,
                    prevValue: 50,
                },
                isFetching: false,
                isError: false,
            },
            customerSatisfactionPerIntent: {
                data: {
                    value: 3,
                    prevValue: 3,
                },
                isFetching: false,
                isError: false,
            },
        })
    })
})
