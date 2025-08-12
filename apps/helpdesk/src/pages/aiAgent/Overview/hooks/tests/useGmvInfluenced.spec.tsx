import { ReactNode } from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { FeatureFlagKey } from 'config/featureFlags'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { gmvInfluencedQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { user } from 'fixtures/users'
import { useGmvInfluenced } from 'pages/aiAgent/Overview/hooks/kpis/useGmvInfluenced'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'
import { RootState, StoreDispatch } from 'state/types'

jest.mock('domains/reporting/hooks/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)

jest.mock('pages/aiAgent/Overview/hooks/useCurrency')
const useCurrencyMock = assumeMock(useCurrency)

jest.mock('domains/reporting/models/queryFactories/ai-sales-agent/metrics')
const gmvInfluencedQueryFactoryMock = assumeMock(gmvInfluencedQueryFactory)

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
        mockFlags({
            [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
        })

        gmvInfluencedQueryFactoryMock.mockReturnValue({
            measures: [AiSalesAgentOrdersMeasure.Gmv],
            dimensions: [],
            filters: [],
            timeDimensions: [],
        })
    })

    it('should return correct metric data when the query resolves and currency is USD', () => {
        useCurrencyMock.mockReturnValue({
            currency: 'USD',
            isCurrencyUSD: true,
        })
        useMetricTrendMock.mockReturnValue({
            data: {
                value: 12000,
                prevValue: 10000,
            },
            isFetching: false,
        } as any)

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
            action: expect.anything(),
            hideTrend: true,
        })
    })

    it('should return correct metric data when the query resolves and currency is EUR', () => {
        useCurrencyMock.mockReturnValue({
            currency: 'EUR',
            isCurrencyUSD: false,
        })
        useMetricTrendMock.mockReturnValue({
            data: {
                value: 12000,
                prevValue: 10000,
            },
            isFetching: false,
        } as any)

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
            action: expect.anything(),
            hideTrend: true,
        })
    })

    it('should return loading state when the query is still loading', () => {
        useCurrencyMock.mockReturnValue({
            currency: 'USD',
            isCurrencyUSD: true,
        })
        useMetricTrendMock.mockReturnValue({
            isFetching: true,
        } as any)

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
            currency: 'USD',
            hidden: false,
            action: expect.anything(),
            hideTrend: true,
        })
    })

    it(`should be hidden when feature flag ${FeatureFlagKey.AiShoppingAssistantEnabled} is disabled`, () => {
        mockFlags({
            [FeatureFlagKey.AiShoppingAssistantEnabled]: false,
        })
        useCurrencyMock.mockReturnValue({
            currency: 'USD',
            isCurrencyUSD: true,
        })
        useMetricTrendMock.mockReturnValue({
            isFetching: true,
        } as any)

        const { result } = renderHook(
            () => useGmvInfluenced(useGmvInfluencedInput),
            {
                wrapper,
            },
        )

        expect(result.current.hidden).toBe(true)
    })

    it(`should not be hidden when feature flag ${FeatureFlagKey.AiShoppingAssistantEnabled} is enabled`, () => {
        mockFlags({
            [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
        })
        useCurrencyMock.mockReturnValue({
            currency: 'USD',
            isCurrencyUSD: true,
        })
        useMetricTrendMock.mockReturnValue({
            isFetching: true,
        } as any)

        const { result } = renderHook(
            () => useGmvInfluenced(useGmvInfluencedInput),
            {
                wrapper,
            },
        )

        expect(result.current.hidden).toBe(false)
    })

    it('should pass integrationIds to useCurrency and useMetricTrend correctly', () => {
        const integrationIds = [123, 456]
        useCurrencyMock.mockReturnValue({
            currency: 'USD',
            isCurrencyUSD: true,
        })
        useMetricTrendMock.mockReturnValue({
            data: {
                value: 12000,
                prevValue: 10000,
            },
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

        expect(useCurrencyMock).toHaveBeenCalledWith(123)
        expect(gmvInfluencedQueryFactoryMock).toHaveBeenCalledWith(
            useGmvInfluencedInput.filters,
            useGmvInfluencedInput.timezone,
            ['123', '456'],
        )
    })
})
