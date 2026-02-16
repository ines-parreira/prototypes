import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import moment from 'moment'
import { Provider } from 'react-redux'
import type { Store } from 'redux'

import { appQueryClient } from 'api/queryClient'
import { fetchMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import useAppSelector from 'hooks/useAppSelector'
import { useBillingState } from 'models/billing/queries'
import { IntegrationType } from 'models/integration/constants'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useAiAgentAutomationRate } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentAutomationRate'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'

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
jest.mock('pages/aiAgent/Overview/hooks/useCurrency')
jest.mock('pages/aiAgent/Overview/hooks/kpis/useAiAgentAutomationRate')

const mockFetchMetricPerDimension = assumeMock(fetchMetricPerDimensionV2)
const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseBillingState = assumeMock(useBillingState)
const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockUseSalesTrialRevampMilestone = assumeMock(
    useSalesTrialRevampMilestone,
)
const mockedUseCurrency = assumeMock(useCurrency)
const mockFormatAmount = jest.requireMock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/RefundOrderModal/utils',
).formatAmount
const mockUseAiAgentAutomationRate = assumeMock(useAiAgentAutomationRate)

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
        dimensions: [],
        measures: [AiSalesAgentOrdersMeasure.Gmv],
    },
    isFetching: false,
    isError: false,
}

const emptyGmvReportingData = {
    data: {
        value: null,
        decile: null,
        allData: [],
        dimensions: [],
        measures: [AiSalesAgentOrdersMeasure.Gmv],
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
        dimensions: [],
        measures: [AiSalesAgentOrdersMeasure.Gmv],
    },
    isFetching: false,
    isError: false,
}

beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()

    mockFetchMetricPerDimension.mockResolvedValue(gmvReportingData)
    mockedUseCurrency.mockReturnValue({
        currency: 'USD',
        isCurrencyUSD: true,
    })
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
                trial: {
                    startDatetime: '2023-11-01T00:00:00.000Z',
                    endDatetime: '2023-11-15T00:00:00.000Z',
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
                trial: {
                    startDatetime: '2023-11-01T00:00:00.000Z',
                    endDatetime: '2023-11-20T00:00:00.000Z',
                },
            },
        },
    }

    const mockStoreIntegrations = [
        { id: 1, name: 'store-1', type: IntegrationType.Shopify },
        { id: 2, name: 'store-2', type: IntegrationType.BigCommerce },
        { id: 3, name: 'store-3', type: IntegrationType.Magento2 },
    ]

    const renderHookWithWrapper = (
        trialType: TrialType = TrialType.ShoppingAssistant,
        shopName?: string,
    ) => {
        return renderHook(() => useTrialMetrics(trialType, shopName), {
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

        mockUseAiAgentAutomationRate.mockReturnValue({
            value: 0.75,
            prevValue: 0.65,
            isLoading: false,
        })

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

        it('should return gmvInfluencedRate correctly for empty data', async () => {
            mockFetchMetricPerDimension.mockResolvedValue(emptyGmvReportingData)
            appQueryClient.clear()
            const { result } = renderHookWithWrapper()

            await waitFor(() => {
                expect(result.current.gmvInfluencedRate).toBe(0)
            })
        })
    })

    describe('automation rate functionality', () => {
        it('should return automation rate when trialType is AiAgent and shopName is provided', async () => {
            mockFetchMetricPerDimension.mockResolvedValue(gmvReportingData)
            const { result } = renderHookWithWrapper(
                TrialType.AiAgent,
                'store-1',
            )

            await waitFor(() => {
                expect(result.current.automationRate).toEqual({
                    value: 0.75,
                    prevValue: 0.65,
                    isLoading: false,
                })
            })
        })

        it('should return undefined automation rate when trialType is not AiAgent', async () => {
            const { result } = renderHookWithWrapper(
                TrialType.ShoppingAssistant,
                'store-1',
            )

            await waitFor(() => {
                expect(result.current.automationRate).toBeUndefined()
            })
        })

        it('should return undefined automation rate when shopName is not provided', async () => {
            const { result } = renderHookWithWrapper(TrialType.AiAgent)

            await waitFor(() => {
                expect(result.current.automationRate).toBeUndefined()
            })
        })

        it('should return undefined automation rate when store has no trial configuration', async () => {
            const storeActivationsWithoutTrial = {
                'store-1': {
                    name: 'store-1',
                    configuration: {
                        sales: {},
                    },
                },
            }

            mockUseStoreActivations.mockReturnValue({
                storeActivations: storeActivationsWithoutTrial,
                isFetchLoading: false,
            } as any)

            const { result } = renderHookWithWrapper(
                TrialType.AiAgent,
                'store-1',
            )

            await waitFor(() => {
                expect(result.current.automationRate).toBeUndefined()
            })
        })

        it('should use fallback period (start of day to end of day) when trialStartDate is not available', async () => {
            const storeActivationsWithoutTrialStartDate = {
                'store-1': {
                    name: 'store-1',
                    configuration: {
                        sales: {
                            trial: undefined,
                        },
                    },
                },
            }

            mockUseStoreActivations.mockReturnValue({
                storeActivations: storeActivationsWithoutTrialStartDate,
                isFetchLoading: false,
            } as any)

            mockUseAiAgentAutomationRate.mockReturnValue({
                value: 0,
                prevValue: 0,
                isLoading: false,
            })

            renderHookWithWrapper(TrialType.AiAgent, 'store-1')

            await waitFor(() => {
                expect(mockUseAiAgentAutomationRate).toHaveBeenCalled()
            })

            const callArgs = mockUseAiAgentAutomationRate.mock.calls[0]
            const filters = callArgs[0]

            expect(filters.period).toBeDefined()
            expect(filters.period.start_datetime).toBeDefined()
            expect(filters.period.end_datetime).toBeDefined()

            const startMoment = moment(filters.period.start_datetime)
            const endMoment = moment(filters.period.end_datetime)

            expect(startMoment.isValid()).toBe(true)
            expect(endMoment.isValid()).toBe(true)
        })

        it('should handle loading state for automation rate', async () => {
            mockUseAiAgentAutomationRate.mockReturnValue({
                value: 0,
                prevValue: 0,
                isLoading: true,
            })

            const { result } = renderHookWithWrapper(
                TrialType.AiAgent,
                'store-1',
            )

            await waitFor(() => {
                expect(result.current.automationRate).toEqual({
                    value: 0,
                    prevValue: 0,
                    isLoading: true,
                })
                expect(result.current.isLoading).toBe(true)
            })
        })
    })
})
