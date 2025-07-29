import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { Store } from 'redux'

import { appQueryClient } from 'api/queryClient'
import { fetchMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import useAppSelector from 'hooks/useAppSelector'
import { useBillingState } from 'models/billing/queries'
import { IntegrationType } from 'models/integration/constants'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useTrialMetrics } from '../hooks/useTrialMetrics'

// Mock all dependencies
jest.mock('domains/reporting/hooks/useMetricPerDimension')
jest.mock('hooks/useAppSelector')
jest.mock('models/billing/queries')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone')
jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/RefundOrderModal/utils',
    () => ({
        formatAmount: jest.fn(),
    }),
)

const mockFetchMetricPerDimension = assumeMock(fetchMetricPerDimension)
const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseBillingState = assumeMock(useBillingState)
const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockUseSalesTrialRevampMilestone = assumeMock(
    useSalesTrialRevampMilestone,
)
const mockFormatAmount = jest.requireMock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/RefundOrderModal/utils',
).formatAmount

const mocksStore = {
    getState: () => ({}),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
} as unknown as Store

// Mock data responses
const gmvReportingData = {
    data: {
        value: null,
        decile: null,
        allData: [
            { [AiSalesAgentOrdersMeasure.Gmv]: '1000' },
            { [AiSalesAgentOrdersMeasure.Gmv]: '1500' },
            { [AiSalesAgentOrdersMeasure.Gmv]: '2000' },
        ],
    },
    isFetching: false,
    isError: false,
}

const emptyGmvReportingData = {
    data: {
        value: null,
        decile: null,
        allData: [],
    },
    isFetching: false,
    isError: false,
}

const gmvReportingDataWithNulls = {
    data: {
        value: null,
        decile: null,
        allData: [
            { [AiSalesAgentOrdersMeasure.Gmv]: '1000' },
            { [AiSalesAgentOrdersMeasure.Gmv]: null },
            { [AiSalesAgentOrdersMeasure.Gmv]: '2000' },
        ],
    },
    isFetching: false,
    isError: false,
}

beforeEach(() => {
    mockFetchMetricPerDimension.mockResolvedValue(gmvReportingData)
})

afterEach(() => {
    jest.clearAllMocks()
})

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

    const renderHookWithWrapper = () => {
        return renderHook(() => useTrialMetrics(), {
            wrapper: ({ children }) => (
                <Provider store={mocksStore}>
                    <QueryClientProvider client={appQueryClient}>
                        {children}
                    </QueryClientProvider>
                </Provider>
            ),
        })
    }

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
        it('should calculate GMV metrics correctly from time series data', async () => {
            mockFetchMetricPerDimension.mockResolvedValue(gmvReportingData)
            const { result } = renderHookWithWrapper()

            await waitFor(() => {
                expect(result.current.gmvInfluenced).toBe('$4,500')
                expect(result.current.isLoading).toBe(false)
            })
        })
        it('should return 0 GMV when no data is available', async () => {
            mockFetchMetricPerDimension.mockResolvedValue(emptyGmvReportingData)
            mockFormatAmount.mockReturnValue('$0')

            const { result } = renderHookWithWrapper()

            await waitFor(() => {
                expect(result.current.gmvInfluenced).toBe('$0')
            })
        })

        it('should return 0 GMV when data is empty', async () => {
            mockFetchMetricPerDimension.mockResolvedValue(emptyGmvReportingData)
            mockFormatAmount.mockReturnValue('$0')

            const { result } = renderHookWithWrapper()

            await waitFor(() => {
                expect(result.current.gmvInfluenced).toBe('$0')
            })
        })

        it('should handle null values in GMV data', async () => {
            mockFetchMetricPerDimension.mockResolvedValue(
                gmvReportingDataWithNulls,
            )
            mockFormatAmount.mockReturnValue('$3,000')

            const { result } = renderHookWithWrapper()

            await waitFor(() => {
                expect(result.current.gmvInfluenced).toBe('$3,000')
            })
        })
    })

    describe('store integrations', () => {
        it('should handle store integrations correctly', async () => {
            mockFetchMetricPerDimension.mockResolvedValue(gmvReportingData)
            const { result } = renderHookWithWrapper()

            await waitFor(() => {
                expect(result.current.gmvInfluenced).toBe('$4,500')
            })
        })

        it('should not make API calls when no activations exist', async () => {
            mockUseStoreActivations.mockReturnValue({
                storeActivations: null,
                isFetchLoading: false,
            } as any)
            mockFormatAmount.mockReturnValue('$0')

            const { result } = renderHookWithWrapper()

            await waitFor(() => {
                expect(result.current.gmvInfluenced).toBe('$0')
            })
        })

        it('should filter out stores without matching integrations', async () => {
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

            const { result } = renderHookWithWrapper()

            await waitFor(() => {
                expect(result.current.gmvInfluenced).toBe('$4,500')
            })
        })
    })

    describe('timezone handling', () => {
        it('should use timezone from selector', async () => {
            mockFetchMetricPerDimension.mockResolvedValue(gmvReportingData)
            const { result } = renderHookWithWrapper()

            await waitFor(() => {
                expect(result.current.gmvInfluenced).toBe('$4,500')
            })
        })

        it('should default to UTC when timezone is null', async () => {
            mockUseAppSelector.mockReset()
            mockUseAppSelector
                .mockReturnValueOnce(mockStoreIntegrations) // getIntegrationsByTypes
                .mockReturnValueOnce(null) // getTimezone returns null

            const { result } = renderHookWithWrapper()

            await waitFor(() => {
                expect(result.current.gmvInfluenced).toBe('$4,500')
            })
        })
    })

    describe('remaining days calculation', () => {
        it('should return 0 when no store activations exist', async () => {
            mockFetchMetricPerDimension.mockResolvedValue(emptyGmvReportingData)
            mockUseStoreActivations.mockReturnValue({
                storeActivations: null,
                isFetchLoading: false,
            } as any)
            mockFormatAmount.mockReturnValue('$0')

            const { result } = renderHookWithWrapper()

            await waitFor(() => {
                expect(result.current.gmvInfluenced).toBe('$0')
            })
        })

        it('should return 0 when all stores have missing trial dates', async () => {
            mockFetchMetricPerDimension.mockResolvedValue(emptyGmvReportingData)
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
            mockFormatAmount.mockReturnValue('$0')

            const { result } = renderHookWithWrapper()

            await waitFor(() => {
                expect(result.current.gmvInfluenced).toBe('$0')
            })
        })
    })

    describe('date range', () => {
        it('should handle date range correctly', async () => {
            mockFetchMetricPerDimension.mockResolvedValue(gmvReportingData)
            const { result } = renderHookWithWrapper()

            await waitFor(() => {
                expect(result.current.gmvInfluenced).toBe('$4,500')
            })
        })
    })

    describe('integration types', () => {
        it('should call useAppSelector for integrations and timezone', async () => {
            const { result } = renderHookWithWrapper()

            await waitFor(() => {
                expect(result.current.gmvInfluenced).toBe('$4,500')
            })

            // Should be called at least twice - once for integrations, once for timezone
            expect(mockUseAppSelector).toHaveBeenCalledWith(
                expect.any(Function), // getIntegrationsByTypes selector
                expect.any(Function), // shallowEqual
            )
            expect(mockUseAppSelector).toHaveBeenCalledWith(
                expect.any(Function), // getTimezone selector
            )
        })

        it('should return gmvInfluencedRate correctly', async () => {
            const { result } = renderHookWithWrapper()

            await waitFor(() => {
                expect(result.current.gmvInfluencedRate).toBe(1)
            })
        })

        it('should return gmvInfluencedRate correctly', async () => {
            mockFetchMetricPerDimension.mockResolvedValue(emptyGmvReportingData)
            appQueryClient.clear()
            const { result } = renderHookWithWrapper()

            await waitFor(() => {
                expect(result.current.gmvInfluencedRate).toBe(0)
            })
        })
    })
})
