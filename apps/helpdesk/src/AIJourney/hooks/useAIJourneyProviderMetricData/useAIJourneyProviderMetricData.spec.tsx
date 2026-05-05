import { renderHook } from '@testing-library/react'

import { useAIJourneyProviderMetricData } from './useAIJourneyProviderMetricData'

jest.mock(
    'AIJourney/hooks/useAIJourneyProviderTotalOrders/useAIJourneyProviderTotalOrders',
    () => ({
        useAIJourneyProviderTotalOrders: jest.fn(),
    }),
)

jest.mock(
    'AIJourney/hooks/useAIJourneyProviderTotalSales/useAIJourneyProviderTotalSales',
    () => ({
        useAIJourneyProviderTotalSales: jest.fn(),
    }),
)

jest.mock(
    'domains/reporting/hooks/drill-down/useDrillDownModalTrigger',
    () => ({
        useDrillDownModalTrigger: jest.fn(),
    }),
)

const mockUseAIJourneyProviderTotalOrders =
    require('AIJourney/hooks/useAIJourneyProviderTotalOrders/useAIJourneyProviderTotalOrders')
        .useAIJourneyProviderTotalOrders as jest.Mock

const mockUseAIJourneyProviderTotalSales =
    require('AIJourney/hooks/useAIJourneyProviderTotalSales/useAIJourneyProviderTotalSales')
        .useAIJourneyProviderTotalSales as jest.Mock

const mockUseDrillDownModalTrigger =
    require('domains/reporting/hooks/drill-down/useDrillDownModalTrigger')
        .useDrillDownModalTrigger as jest.Mock

const mockOrdersData = {
    value: 0,
    prevValue: null,
    series: [],
    interpretAs: 'more-is-better' as const,
    isLoading: false,
    metricFormat: 'decimal-precision-1' as const,
}

const mockSalesData = {
    value: 0,
    prevValue: null,
    series: [],
    interpretAs: 'more-is-better' as const,
    isLoading: false,
    metricFormat: 'currency' as const,
    currency: 'USD',
}

const mockDrillDown = {
    openDrillDownModal: jest.fn(),
    tooltipText: 'View tickets',
}

const baseParams = {
    integrationId: '123',
    userTimezone: 'UTC',
    filters: {} as any,
    currency: 'USD',
    granularity: 'day' as any,
    journeyIds: [],
    baseForceEmpty: false,
    isAttributionModelComparisonEnabled: true,
    keyKpisConfig: [
        {
            id: 'Total sales (click 5d > delivery 12h)',
            label: 'Total sales (click 5d > delivery 12h)',
            visibility: true,
        },
        {
            id: 'Orders (click 5d > delivery 12h)',
            label: 'Orders (click 5d > delivery 12h)',
            visibility: true,
        },
    ],
}

describe('useAIJourneyProviderMetricData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAIJourneyProviderTotalOrders.mockReturnValue(mockOrdersData)
        mockUseAIJourneyProviderTotalSales.mockReturnValue(mockSalesData)
        mockUseDrillDownModalTrigger.mockReturnValue(mockDrillDown)
    })

    it('should pass forceEmpty=false when the model metric is visible', () => {
        renderHook(() => useAIJourneyProviderMetricData('klaviyo', baseParams))

        expect(mockUseAIJourneyProviderTotalOrders).toHaveBeenCalledWith(
            expect.objectContaining({ forceEmpty: false }),
        )
        expect(mockUseAIJourneyProviderTotalSales).toHaveBeenCalledWith(
            expect.objectContaining({ forceEmpty: false }),
        )
    })

    it('should pass forceEmpty=true when baseForceEmpty is true', () => {
        renderHook(() =>
            useAIJourneyProviderMetricData('klaviyo', {
                ...baseParams,
                baseForceEmpty: true,
            }),
        )

        expect(mockUseAIJourneyProviderTotalOrders).toHaveBeenCalledWith(
            expect.objectContaining({ forceEmpty: true }),
        )
        expect(mockUseAIJourneyProviderTotalSales).toHaveBeenCalledWith(
            expect.objectContaining({ forceEmpty: true }),
        )
    })

    it('should pass forceEmpty=true when the feature flag is disabled', () => {
        renderHook(() =>
            useAIJourneyProviderMetricData('klaviyo', {
                ...baseParams,
                isAttributionModelComparisonEnabled: false,
            }),
        )

        expect(mockUseAIJourneyProviderTotalOrders).toHaveBeenCalledWith(
            expect.objectContaining({ forceEmpty: true }),
        )
        expect(mockUseAIJourneyProviderTotalSales).toHaveBeenCalledWith(
            expect.objectContaining({ forceEmpty: true }),
        )
    })

    it('should pass forceEmpty=true when no model metrics are visible in config', () => {
        renderHook(() =>
            useAIJourneyProviderMetricData('klaviyo', {
                ...baseParams,
                keyKpisConfig: [
                    {
                        id: 'Total sales (click 5d > delivery 12h)',
                        label: 'Total sales',
                        visibility: false,
                    },
                    {
                        id: 'Orders (click 5d > delivery 12h)',
                        label: 'Orders',
                        visibility: false,
                    },
                ],
            }),
        )

        expect(mockUseAIJourneyProviderTotalOrders).toHaveBeenCalledWith(
            expect.objectContaining({ forceEmpty: true }),
        )
    })

    it('should return the correct label for each model', () => {
        const { result } = renderHook(() =>
            useAIJourneyProviderMetricData('attentive', {
                ...baseParams,
                keyKpisConfig: [
                    {
                        id: 'Total sales (click 5d > delivery 24h)',
                        label: 'Total sales (click 5d > delivery 24h)',
                        visibility: true,
                    },
                ],
            }),
        )

        expect(result.current.label).toBe('click 5d > delivery 24h')
    })

    it('should return orders, totalSales and ordersDrillDown from inner hooks', () => {
        const { result } = renderHook(() =>
            useAIJourneyProviderMetricData('klaviyo', baseParams),
        )

        expect(result.current.orders).toBe(mockOrdersData)
        expect(result.current.totalSales).toBe(mockSalesData)
        expect(result.current.ordersDrillDown).toBe(mockDrillDown)
    })

    it('should pass the correct provider string to inner hooks', () => {
        renderHook(() =>
            useAIJourneyProviderMetricData('postscript', {
                ...baseParams,
                keyKpisConfig: [
                    {
                        id: 'Orders (click 7d > delivery 24h)',
                        label: 'Orders',
                        visibility: true,
                    },
                ],
            }),
        )

        expect(mockUseAIJourneyProviderTotalOrders).toHaveBeenCalledWith(
            expect.objectContaining({ provider: 'postscript' }),
        )
        expect(mockUseAIJourneyProviderTotalSales).toHaveBeenCalledWith(
            expect.objectContaining({ provider: 'postscript' }),
        )
    })
})
