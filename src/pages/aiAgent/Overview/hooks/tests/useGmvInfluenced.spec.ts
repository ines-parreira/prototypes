import { renderHook } from '@testing-library/react-hooks/dom'
import { mockFlags } from 'jest-launchdarkly-mock'

import { FeatureFlagKey } from 'config/featureFlags'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import { StatsFilters } from 'models/stat/types'
import { useGmvInfluenced } from 'pages/aiAgent/Overview/hooks/kpis/useGmvInfluenced'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)

jest.mock('pages/aiAgent/Overview/hooks/useCurrency')
const useCurrencyMock = assumeMock(useCurrency)

jest.useFakeTimers()

const timezone = 'UTC'
const filters: StatsFilters = {
    period: {
        start_datetime: '2025-02-06T16:55:37.914Z',
        end_datetime: '2025-01-09T16:56:07.727Z',
    },
}

describe('useGmvInfluenced', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.StandaloneAiSalesAnalyticsPage]: true,
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

        const { result } = renderHook(() => useGmvInfluenced(filters, timezone))

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

        const { result } = renderHook(() => useGmvInfluenced(filters, timezone))

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

        const { result } = renderHook(() => useGmvInfluenced(filters, timezone))

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
        })
    })

    it(`should be hidden when feature flag ${FeatureFlagKey.StandaloneAiSalesAnalyticsPage} is disabled`, () => {
        mockFlags({
            [FeatureFlagKey.StandaloneAiSalesAnalyticsPage]: false,
        })
        useCurrencyMock.mockReturnValue({
            currency: 'USD',
            isCurrencyUSD: true,
        })
        useMetricTrendMock.mockReturnValue({
            isFetching: true,
        } as any)

        const { result } = renderHook(() => useGmvInfluenced(filters, timezone))

        expect(result.current.hidden).toBe(true)
    })

    it(`should not be hidden when feature flag ${FeatureFlagKey.StandaloneAiSalesAnalyticsPage} is enabled`, () => {
        mockFlags({
            [FeatureFlagKey.StandaloneAiSalesAnalyticsPage]: true,
        })
        useCurrencyMock.mockReturnValue({
            currency: 'USD',
            isCurrencyUSD: true,
        })
        useMetricTrendMock.mockReturnValue({
            isFetching: true,
        } as any)

        const { result } = renderHook(() => useGmvInfluenced(filters, timezone))

        expect(result.current.hidden).toBe(false)
    })
})
