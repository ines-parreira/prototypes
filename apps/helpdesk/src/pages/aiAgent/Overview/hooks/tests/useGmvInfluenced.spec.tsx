import type { ReactNode } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { gmvInfluencedQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatGmvInfluencedData } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { user } from 'fixtures/users'
import { useGmvInfluenced } from 'pages/aiAgent/Overview/hooks/kpis/useGmvInfluenced'
import { useGmvInfluencedCtaButton } from 'pages/aiAgent/Overview/hooks/kpis/useGmvInfluencedCtaButton'
import type { RootState, StoreDispatch } from 'state/types'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimensionV2)

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend',
)
const formatGmvInfluencedDataMock = assumeMock(formatGmvInfluencedData)

jest.mock('pages/aiAgent/Overview/hooks/kpis/useGmvInfluencedCtaButton')
const useGmvInfluencedCtaButtonMock = assumeMock(useGmvInfluencedCtaButton)

jest.mock('domains/reporting/models/queryFactories/ai-sales-agent/metrics')
const gmvInfluencedQueryFactoryMock = assumeMock(gmvInfluencedQueryFactory)

jest.mock('@repo/feature-flags')
const mockUseFlag = jest.mocked(useFlag)

jest.useFakeTimers()

const queryClient = new QueryClient()

const history = createMemoryHistory()

const wrapper = ({ children }: { children?: ReactNode }) => (
    <Router history={history}>
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(defaultState)}>{children}</Provider>
        </QueryClientProvider>
    </Router>
)

const useGmvInfluencedInput = {
    timezone: 'UTC',
    filters: {
        period: {
            start_datetime: '2025-02-06T16:55:37.914Z',
            end_datetime: '2025-01-09T16:56:07.727Z',
        },
    } satisfies StatsFilters,
    aiAgentType: 'sales' as const,
    isOnNewPlan: true,
    showEarlyAccessModal: () => {},
    showActivationModal: () => {},
}

const mockStore = configureMockStore<RootState, StoreDispatch>()
const defaultState = {
    currentUser: fromJS(user),
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [],
    }),
} as RootState

describe('useGmvInfluenced', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
        )

        gmvInfluencedQueryFactoryMock.mockReturnValue({
            measures: [AiSalesAgentOrdersMeasure.Gmv],
            dimensions: [],
            filters: [],
            timeDimensions: [],
            metricName: METRIC_NAMES.TEST_METRIC,
        })

        useGmvInfluencedCtaButtonMock.mockReturnValue(
            <button>Mock Action</button>,
        )

        formatGmvInfluencedDataMock.mockReturnValue({
            value: 12000,
            prevValue: 10000,
            currency: 'USD',
        })
    })

    it('should return correct metric data when the query resolves and currency is USD', () => {
        const mockCurrentPeriodData = {
            value: 12000,
            decile: null,
            allData: [
                {
                    'AiSalesAgentOrders.gmv': '12000',
                    'AiSalesAgentOrders.currency': 'USD',
                },
            ],
            dimensions: [AiSalesAgentOrdersDimension.Currency],
            measures: [AiSalesAgentOrdersMeasure.Gmv],
        }
        const mockPreviousPeriodData = {
            value: 10000,
            decile: null,
            allData: [
                {
                    'AiSalesAgentOrders.gmv': '10000',
                    'AiSalesAgentOrders.currency': 'USD',
                },
            ],
            dimensions: [AiSalesAgentOrdersDimension.Currency],
            measures: [AiSalesAgentOrdersMeasure.Gmv],
        }

        useMetricPerDimensionMock
            .mockReturnValueOnce({
                data: mockCurrentPeriodData,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: mockPreviousPeriodData,
                isFetching: false,
                isError: false,
            })

        const { result } = renderHook(
            () => useGmvInfluenced(useGmvInfluencedInput),
            {
                wrapper,
            },
        )

        expect(result.current).toEqual({
            title: 'GMV Influenced',
            hint: {
                title: 'The total revenue generated from orders placed during or after a conversation with the AI Agent, without human intervention.',
            },
            'data-candu-id': 'ai-agent-overview-kpi-gmv-influenced',
            metricFormat: 'currency-precision-1',
            value: 12000,
            prevValue: 10000,
            isLoading: false,
            currency: 'USD',
            hidden: false,
            action: <button>Mock Action</button>,
            hideTrend: true,
        })
    })

    it('should return correct metric data when the query resolves and currency is EUR', () => {
        const mockCurrentPeriodData = {
            value: 12000,
            decile: null,
            allData: [
                {
                    'AiSalesAgentOrders.gmv': '12000',
                    'AiSalesAgentOrders.currency': 'EUR',
                },
            ],
        }
        const mockPreviousPeriodData = {
            value: 10000,
            decile: null,
            allData: [
                {
                    'AiSalesAgentOrders.gmv': '10000',
                    'AiSalesAgentOrders.currency': 'EUR',
                },
            ],
        }

        formatGmvInfluencedDataMock.mockReturnValueOnce({
            value: 12000,
            prevValue: 10000,
            currency: 'EUR',
        })

        useMetricPerDimensionMock
            .mockReturnValueOnce({
                data: mockCurrentPeriodData,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: mockPreviousPeriodData,
                isFetching: false,
                isError: false,
            })

        const { result } = renderHook(
            () => useGmvInfluenced(useGmvInfluencedInput),
            {
                wrapper,
            },
        )

        expect(result.current).toEqual({
            title: 'GMV Influenced',
            hint: {
                title: 'The total revenue generated from orders placed during or after a conversation with the AI Agent, without human intervention.',
            },
            'data-candu-id': 'ai-agent-overview-kpi-gmv-influenced',
            metricFormat: 'currency-precision-1',
            value: 12000,
            prevValue: 10000,
            isLoading: false,
            currency: 'EUR',
            hidden: false,
            action: <button>Mock Action</button>,
            hideTrend: true,
        })
    })

    it('should return loading state when the query is still loading', () => {
        useMetricPerDimensionMock
            .mockReturnValueOnce({
                data: null,
                isFetching: true,
                isError: false,
            })
            .mockReturnValueOnce({
                data: null,
                isFetching: false,
                isError: false,
            })

        formatGmvInfluencedDataMock.mockReturnValue({
            value: null,
            prevValue: null,
            currency: 'USD',
        })

        const { result } = renderHook(
            () => useGmvInfluenced(useGmvInfluencedInput),
            {
                wrapper,
            },
        )

        expect(result.current).toEqual({
            title: 'GMV Influenced',
            hint: {
                title: 'The total revenue generated from orders placed during or after a conversation with the AI Agent, without human intervention.',
            },
            'data-candu-id': 'ai-agent-overview-kpi-gmv-influenced',
            metricFormat: 'currency-precision-1',
            isLoading: true,
            value: null,
            prevValue: null,
            currency: 'USD',
            hidden: false,
            action: <button>Mock Action</button>,
            hideTrend: true,
        })
    })

    it(`should be hidden when feature flag ${FeatureFlagKey.AiShoppingAssistantEnabled} is disabled`, () => {
        mockUseFlag.mockReturnValue(false)

        useMetricPerDimensionMock
            .mockReturnValueOnce({
                data: null,
                isFetching: true,
                isError: false,
            })
            .mockReturnValueOnce({
                data: null,
                isFetching: false,
                isError: false,
            })

        const { result } = renderHook(
            () => useGmvInfluenced(useGmvInfluencedInput),
            {
                wrapper,
            },
        )

        expect(result.current.hidden).toBe(true)
    })

    it(`should not be hidden when feature flag ${FeatureFlagKey.AiShoppingAssistantEnabled} is enabled`, () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
        )

        useMetricPerDimensionMock
            .mockReturnValueOnce({
                data: null,
                isFetching: true,
                isError: false,
            })
            .mockReturnValueOnce({
                data: null,
                isFetching: false,
                isError: false,
            })

        const { result } = renderHook(
            () => useGmvInfluenced(useGmvInfluencedInput),
            {
                wrapper,
            },
        )

        expect(result.current.hidden).toBe(false)
    })

    it('should pass integrationIds to gmvInfluencedQueryFactory correctly', () => {
        const integrationIds = [123, 456]

        useMetricPerDimensionMock
            .mockReturnValueOnce({
                data: null,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: null,
                isFetching: false,
                isError: false,
            })

        renderHook(
            () =>
                useGmvInfluenced({
                    ...useGmvInfluencedInput,
                    integrationIds,
                }),
            {
                wrapper,
            },
        )

        expect(gmvInfluencedQueryFactoryMock).toHaveBeenCalledWith(
            useGmvInfluencedInput.filters,
            useGmvInfluencedInput.timezone,
            ['123', '456'],
        )
    })

    it('should handle when formattedData is undefined (covering optional chaining)', () => {
        useMetricPerDimensionMock
            .mockReturnValueOnce({
                data: null,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: null,
                isFetching: false,
                isError: false,
            })

        // Mock formatGmvInfluencedData to return undefined to test optional chaining
        formatGmvInfluencedDataMock.mockReturnValue(undefined as any)

        const { result } = renderHook(
            () => useGmvInfluenced(useGmvInfluencedInput),
            {
                wrapper,
            },
        )

        expect(result.current).toEqual({
            title: 'GMV Influenced',
            hint: {
                title: 'The total revenue generated from orders placed during or after a conversation with the AI Agent, without human intervention.',
            },
            'data-candu-id': 'ai-agent-overview-kpi-gmv-influenced',
            metricFormat: 'currency-precision-1',
            value: undefined,
            prevValue: undefined,
            currency: 'USD',
            isLoading: false,
            hidden: false,
            action: <button>Mock Action</button>,
            hideTrend: true,
        })
    })

    it('should handle when formattedData has partial data (testing optional chaining edge cases)', () => {
        useMetricPerDimensionMock
            .mockReturnValueOnce({
                data: {
                    value: null,
                    decile: null,
                    allData: [],
                },
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: {
                    value: null,
                    decile: null,
                    allData: [],
                },
                isFetching: false,
                isError: false,
            })

        // Test partial data object with missing properties
        const partialData = { value: 5000 } as any // Missing prevValue and currency
        formatGmvInfluencedDataMock.mockReturnValue(partialData)

        const { result } = renderHook(
            () => useGmvInfluenced(useGmvInfluencedInput),
            {
                wrapper,
            },
        )

        expect(result.current).toEqual({
            title: 'GMV Influenced',
            hint: {
                title: 'The total revenue generated from orders placed during or after a conversation with the AI Agent, without human intervention.',
            },
            'data-candu-id': 'ai-agent-overview-kpi-gmv-influenced',
            metricFormat: 'currency-precision-1',
            value: 5000,
            prevValue: undefined,
            currency: 'USD',
            isLoading: false,
            hidden: false,
            action: <button>Mock Action</button>,
            hideTrend: true,
        })
    })
})
