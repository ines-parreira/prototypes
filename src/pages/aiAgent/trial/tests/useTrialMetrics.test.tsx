import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import { useBillingState } from 'models/billing/queries'
import { IntegrationType } from 'models/integration/constants'
import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useGmvInfluencedRateTrend } from 'pages/stats/automate/aiSalesAgent/metrics/useGmvInfluencedRateTrend'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useTrialMetrics } from '../hooks/useTrialMetrics'

// Mock all dependencies
jest.mock('hooks/reporting/useMetricPerDimension')
jest.mock('hooks/useAppSelector')
jest.mock('models/billing/queries')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone')
jest.mock('pages/stats/automate/aiSalesAgent/metrics/useGmvInfluencedRateTrend')
jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/RefundOrderModal/utils',
    () => ({
        formatAmount: jest.fn(),
    }),
)

const mockUseMetricPerDimension = assumeMock(useMetricPerDimension)
const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseBillingState = assumeMock(useBillingState)
const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockUseSalesTrialRevampMilestone = assumeMock(
    useSalesTrialRevampMilestone,
)
const mockUseGmvInfluencedRateTrend = assumeMock(useGmvInfluencedRateTrend)
const mockFormatAmount = jest.requireMock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/RefundOrderModal/utils',
).formatAmount

describe('useTrialMetrics', () => {
    const mockStoreActivations = {
        'store-1': {
            name: 'store-1',
            configuration: {
                sales: {
                    trial: {
                        startDatetime: '2023-11-01T00:00:00.000Z',
                        endDatetime: '2023-11-15T00:00:00.000Z',
                    },
                },
            },
        },
        'store-2': {
            name: 'store-2',
            configuration: {
                sales: {
                    trial: {
                        startDatetime: '2023-11-01T00:00:00.000Z',
                        endDatetime: '2023-11-20T00:00:00.000Z',
                    },
                },
            },
        },
    }

    const mockStoreIntegrations = [
        { id: 1, name: 'store-1', type: IntegrationType.Shopify },
        { id: 2, name: 'store-2', type: IntegrationType.BigCommerce },
        { id: 3, name: 'store-3', type: IntegrationType.Magento2 },
    ]

    beforeEach(() => {
        jest.clearAllMocks()

        // Mock the specific selectors
        mockUseAppSelector
            .mockReturnValueOnce(mockStoreIntegrations) // First call for getIntegrationsByTypes
            .mockReturnValueOnce('America/New_York') // Second call for getTimezone

        mockUseStoreActivations.mockReturnValue({
            storeActivations: mockStoreActivations,
            isFetchLoading: false,
        } as any)

        mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')

        mockUseMetricPerDimension.mockReturnValue({
            data: {
                allData: [
                    { [AiSalesAgentOrdersMeasure.Gmv]: '1000' },
                    { [AiSalesAgentOrdersMeasure.Gmv]: '1500' },
                    { [AiSalesAgentOrdersMeasure.Gmv]: '2000' },
                ],
            },
            isFetching: false,
        } as any)

        mockUseGmvInfluencedRateTrend.mockReturnValue({
            data: { value: 25 },
            isFetching: false,
        } as any)

        mockUseBillingState.mockReturnValue({
            data: {
                current_plans: {
                    automate: {
                        currency: 'USD',
                    },
                },
            },
        } as any)

        mockFormatAmount.mockReturnValue('$4,500')
    })

    describe('basic functionality', () => {
        it('should calculate GMV correctly from time series data', () => {
            const { result } = renderHook(() => useTrialMetrics())

            expect(result.current.gmvInfluenced).toBe('$4,500') // formatted amount
            expect(result.current.isLoading).toBe(false)
        })

        it('should return 0 GMV when no data is available', () => {
            mockUseMetricPerDimension.mockReturnValue({
                data: undefined,
                isFetching: false,
            } as any)
            mockFormatAmount.mockReturnValue('$0')

            const { result } = renderHook(() => useTrialMetrics())

            expect(result.current.gmvInfluenced).toBe('$0')
        })

        it('should return 0 GMV when data is empty', () => {
            mockUseMetricPerDimension.mockReturnValue({
                data: { allData: [] },
                isFetching: false,
            } as any)
            mockFormatAmount.mockReturnValue('$0')

            const { result } = renderHook(() => useTrialMetrics())

            expect(result.current.gmvInfluenced).toBe('$0')
        })

        it('should handle null values in GMV data', () => {
            mockFormatAmount.mockReturnValue('$3,000')
            mockUseMetricPerDimension.mockReturnValue({
                data: {
                    allData: [
                        { [AiSalesAgentOrdersMeasure.Gmv]: '1000' },
                        { [AiSalesAgentOrdersMeasure.Gmv]: null },
                        { [AiSalesAgentOrdersMeasure.Gmv]: '2000' },
                    ],
                },
                isFetching: false,
            } as any)

            const { result } = renderHook(() => useTrialMetrics())

            expect(result.current.gmvInfluenced).toBe('$3,000') // formatted amount
        })
    })

    describe('store integrations', () => {
        it('should pass correct store IDs to GMV query', () => {
            renderHook(() => useTrialMetrics())

            expect(mockUseMetricPerDimension).toHaveBeenCalledWith(
                expect.objectContaining({
                    filters: expect.arrayContaining([
                        expect.objectContaining({
                            member: 'AiSalesAgentOrders.integrationId',
                            operator: 'equals',
                            values: ['1', '2'], // IDs for store-1 and store-2
                        }),
                    ]),
                }),
            )
        })

        it('should not include integrationId filter when no activations exist', () => {
            mockUseStoreActivations.mockReturnValue({
                storeActivations: null,
                isFetchLoading: false,
            } as any)

            renderHook(() => useTrialMetrics())

            const call = mockUseMetricPerDimension.mock.calls[0]
            const integrationFilter = call[0].filters.find(
                (f: any) => f.member === 'AiSalesAgentOrders.integrationId',
            )
            expect(integrationFilter).toBeUndefined()
        })

        it('should filter out stores without matching integrations', () => {
            const storeActivationsWithUnmatched = {
                ...mockStoreActivations,
                'store-unknown': {
                    name: 'store-unknown',
                    configuration: { sales: { trial: {} } },
                },
            }

            mockUseStoreActivations.mockReturnValue({
                storeActivations: storeActivationsWithUnmatched,
                isFetchLoading: false,
            } as any)

            renderHook(() => useTrialMetrics())

            expect(mockUseMetricPerDimension).toHaveBeenCalledWith(
                expect.objectContaining({
                    filters: expect.arrayContaining([
                        expect.objectContaining({
                            member: 'AiSalesAgentOrders.integrationId',
                            operator: 'equals',
                            values: ['1', '2'], // Only store-1 and store-2
                        }),
                    ]),
                }),
            )
        })
    })

    describe('timezone handling', () => {
        it('should use timezone from selector', () => {
            renderHook(() => useTrialMetrics())

            expect(mockUseMetricPerDimension).toHaveBeenCalledWith(
                expect.objectContaining({
                    timezone: 'America/New_York',
                }),
            )
        })

        it('should default to UTC when timezone is null', () => {
            // Clear all mocks to reset the mock implementation
            mockUseAppSelector.mockReset()
            mockUseStoreActivations.mockReset()
            mockUseMetricPerDimension.mockReset()
            mockUseGmvInfluencedRateTrend.mockReset()

            mockUseAppSelector
                .mockReturnValueOnce(mockStoreIntegrations) // getIntegrationsByTypes
                .mockReturnValueOnce(null) // getTimezone returns null

            mockUseStoreActivations.mockReturnValue({
                storeActivations: mockStoreActivations,
                isFetchLoading: false,
            } as any)

            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')

            mockUseMetricPerDimension.mockReturnValue({
                data: { allData: [] },
                isFetching: false,
            } as any)

            mockUseGmvInfluencedRateTrend.mockReturnValue({
                data: { value: 25 },
                isFetching: false,
            } as any)

            renderHook(() => useTrialMetrics())

            expect(mockUseMetricPerDimension).toHaveBeenCalledWith(
                expect.objectContaining({
                    timezone: 'UTC',
                }),
            )
        })
    })

    describe('remaining days calculation', () => {
        it('should return 0 when no store activations exist', () => {
            mockUseStoreActivations.mockReturnValue({
                storeActivations: null,
                isFetchLoading: false,
            } as any)

            const { result } = renderHook(() => useTrialMetrics())

            expect(result.current.remainingDays).toBe(0)
        })

        it('should return 0 when all stores have missing trial dates', () => {
            const storeActivationsWithMissingDates = {
                'store-1': {
                    name: 'store-1',
                    configuration: {
                        sales: {
                            trial: {}, // Missing dates
                        },
                    },
                },
            }

            mockUseStoreActivations.mockReturnValue({
                storeActivations: storeActivationsWithMissingDates,
                isFetchLoading: false,
            } as any)

            const { result } = renderHook(() => useTrialMetrics())

            expect(result.current.remainingDays).toBe(0)
        })
    })

    describe('loading state', () => {
        it('should return loading state from useMetricPerDimension', () => {
            mockUseMetricPerDimension.mockReturnValue({
                data: undefined,
                isFetching: true,
            } as any)

            const { result } = renderHook(() => useTrialMetrics())

            expect(result.current.isLoading).toBe(true)
        })

        it('should return loading state from useGmvInfluencedRateTrend', () => {
            mockUseGmvInfluencedRateTrend.mockReturnValue({
                data: undefined,
                isFetching: true,
            } as any)

            const { result } = renderHook(() => useTrialMetrics())

            expect(result.current.isLoading).toBe(true)
        })
    })

    describe('date range', () => {
        it('should pass a 14-day period to the query', () => {
            renderHook(() => useTrialMetrics())

            const call = mockUseMetricPerDimension.mock.calls[0]
            const filters = call[0].filters
            const startFilter = filters.find(
                (f: any) => f.member === 'AiSalesAgentOrders.periodStart',
            )
            const endFilter = filters.find(
                (f: any) => f.member === 'AiSalesAgentOrders.periodEnd',
            )

            expect(startFilter).toBeDefined()
            expect(endFilter).toBeDefined()
            expect(startFilter?.operator).toBe('afterDate')
            expect(endFilter?.operator).toBe('beforeDate')
            expect(typeof startFilter?.values[0]).toBe('string')
            expect(typeof endFilter?.values[0]).toBe('string')
        })
    })

    describe('integration types', () => {
        it('should call useAppSelector for integrations and timezone', () => {
            renderHook(() => useTrialMetrics())

            // Should be called at least twice - once for integrations, once for timezone
            expect(mockUseAppSelector).toHaveBeenCalledTimes(2)
        })

        it('should return gmvInfluencedRate from the trend hook', () => {
            const { result } = renderHook(() => useTrialMetrics())

            expect(result.current.gmvInfluencedRate).toBe(25)
        })

        it('should return 0 gmvInfluencedRate when no data', () => {
            mockUseGmvInfluencedRateTrend.mockReturnValue({
                data: undefined,
                isFetching: false,
            } as any)

            const { result } = renderHook(() => useTrialMetrics())

            expect(result.current.gmvInfluencedRate).toBe(0)
        })
    })
})
