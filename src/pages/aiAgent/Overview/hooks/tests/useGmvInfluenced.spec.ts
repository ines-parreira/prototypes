import { mockFlags } from 'jest-launchdarkly-mock'

import { FeatureFlagKey } from 'config/featureFlags'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import { StatsFilters } from 'models/stat/types'
import { useGmvInfluenced } from 'pages/aiAgent/Overview/hooks/kpis/useGmvInfluenced'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)

jest.mock('pages/aiAgent/Overview/hooks/useCurrency')
const useCurrencyMock = assumeMock(useCurrency)

jest.useFakeTimers()

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

describe('useGmvInfluenced', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
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

        const { result } = renderHook(() =>
            useGmvInfluenced(useGmvInfluencedInput),
        )

        expect(result.current).toEqual({
            title: 'GMV Influenced',
            hint: {
                title: 'The total revenue generated from orders placed during or after a conversation with the AI Agent, without human intervention.',
            },
            'data-candu-id': 'ai-agent-overview-kpi-gmv-influenced',
            metricFormat: 'currency',
            value: 12000,
            prevValue: 10000,
            isLoading: false,
            currency: 'USD',
            hidden: false,
            action: undefined,
            hideTrend: false,
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

        const { result } = renderHook(() =>
            useGmvInfluenced(useGmvInfluencedInput),
        )

        expect(result.current).toEqual({
            title: 'GMV Influenced',
            hint: {
                title: 'The total revenue generated from orders placed during or after a conversation with the AI Agent, without human intervention.',
            },
            'data-candu-id': 'ai-agent-overview-kpi-gmv-influenced',
            metricFormat: 'currency',
            value: 12000,
            prevValue: 10000,
            isLoading: false,
            currency: 'EUR',
            hidden: false,
            action: undefined,
            hideTrend: false,
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

        const { result } = renderHook(() =>
            useGmvInfluenced(useGmvInfluencedInput),
        )

        expect(result.current).toEqual({
            title: 'GMV Influenced',
            hint: {
                title: 'The total revenue generated from orders placed during or after a conversation with the AI Agent, without human intervention.',
            },
            'data-candu-id': 'ai-agent-overview-kpi-gmv-influenced',
            metricFormat: 'currency',
            isLoading: true,
            currency: 'USD',
            hidden: false,
            action: undefined,
            hideTrend: false,
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

        const { result } = renderHook(() =>
            useGmvInfluenced(useGmvInfluencedInput),
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

        const { result } = renderHook(() =>
            useGmvInfluenced(useGmvInfluencedInput),
        )

        expect(result.current.hidden).toBe(false)
    })
})
