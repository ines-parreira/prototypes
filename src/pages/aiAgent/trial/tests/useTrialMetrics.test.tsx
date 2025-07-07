import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { ReportingGranularity } from 'models/reporting/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useGmvUsdOverTimeSeries } from 'pages/stats/automate/aiSalesAgent/metrics/useGmvUsdOverTimeSeries'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useTrialMetrics } from '../hooks/useTrialMetrics'

// Mock all dependencies
jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('pages/stats/automate/aiSalesAgent/metrics/useGmvUsdOverTimeSeries')

const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockUseGmvUsdOverTimeSeries = assumeMock(useGmvUsdOverTimeSeries)

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

        mockUseGmvUsdOverTimeSeries.mockReturnValue({
            data: [
                [
                    { value: 1000, dateTime: '2023-11-01' },
                    { value: 1500, dateTime: '2023-11-02' },
                    { value: 2000, dateTime: '2023-11-03' },
                ],
            ],
            isLoading: false,
            isError: false,
            error: null,
            refetch: jest.fn(),
        } as any)
    })

    describe('basic functionality', () => {
        it('should calculate GMV correctly from time series data', () => {
            const { result } = renderHook(() => useTrialMetrics())

            expect(result.current.gmv).toBe(4500) // 1000 + 1500 + 2000
            expect(result.current.isLoading).toBe(false)
        })

        it('should return 0 GMV when no data is available', () => {
            mockUseGmvUsdOverTimeSeries.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false,
                error: null,
                refetch: jest.fn(),
            } as any)

            const { result } = renderHook(() => useTrialMetrics())

            expect(result.current.gmv).toBe(0)
        })

        it('should return 0 GMV when data is empty', () => {
            mockUseGmvUsdOverTimeSeries.mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                error: null,
                refetch: jest.fn(),
            } as any)

            const { result } = renderHook(() => useTrialMetrics())

            expect(result.current.gmv).toBe(0)
        })

        it('should handle null values in time series data', () => {
            mockUseGmvUsdOverTimeSeries.mockReturnValue({
                data: [
                    [
                        { value: 1000, dateTime: '2023-11-01' },
                        { value: null, dateTime: '2023-11-02' },
                        { value: 2000, dateTime: '2023-11-03' },
                    ],
                ],
                isLoading: false,
                isError: false,
                error: null,
                refetch: jest.fn(),
            } as any)

            const { result } = renderHook(() => useTrialMetrics())

            expect(result.current.gmv).toBe(3000) // 1000 + 0 + 2000
        })
    })

    describe('store integrations', () => {
        it('should pass correct store IDs to GMV query', () => {
            renderHook(() => useTrialMetrics())

            expect(mockUseGmvUsdOverTimeSeries).toHaveBeenCalledWith(
                expect.objectContaining({
                    storeIntegrations: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [1, 2], // IDs for store-1 and store-2
                    },
                }),
                'America/New_York',
                ReportingGranularity.Day,
            )
        })

        it('should pass undefined storeIntegrations when no activations exist', () => {
            mockUseStoreActivations.mockReturnValue({
                storeActivations: null,
                isFetchLoading: false,
            } as any)

            renderHook(() => useTrialMetrics())

            expect(mockUseGmvUsdOverTimeSeries).toHaveBeenCalledWith(
                expect.objectContaining({
                    storeIntegrations: undefined,
                }),
                'America/New_York',
                ReportingGranularity.Day,
            )
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

            expect(mockUseGmvUsdOverTimeSeries).toHaveBeenCalledWith(
                expect.objectContaining({
                    storeIntegrations: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [1, 2], // Only store-1 and store-2
                    },
                }),
                expect.any(String),
                expect.any(String),
            )
        })
    })

    describe('timezone handling', () => {
        it('should use timezone from selector', () => {
            renderHook(() => useTrialMetrics())

            expect(mockUseGmvUsdOverTimeSeries).toHaveBeenCalledWith(
                expect.any(Object),
                'America/New_York',
                ReportingGranularity.Day,
            )
        })

        it('should default to UTC when timezone is null', () => {
            // Clear all mocks to reset the mock implementation
            mockUseAppSelector.mockReset()
            mockUseStoreActivations.mockReset()
            mockUseGmvUsdOverTimeSeries.mockReset()

            mockUseAppSelector
                .mockReturnValueOnce(mockStoreIntegrations) // getIntegrationsByTypes
                .mockReturnValueOnce(null) // getTimezone returns null

            mockUseStoreActivations.mockReturnValue({
                storeActivations: mockStoreActivations,
                isFetchLoading: false,
            } as any)

            mockUseGmvUsdOverTimeSeries.mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                error: null,
                refetch: jest.fn(),
            } as any)

            renderHook(() => useTrialMetrics())

            expect(mockUseGmvUsdOverTimeSeries).toHaveBeenCalledWith(
                expect.any(Object),
                'UTC',
                ReportingGranularity.Day,
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
        it('should return loading state from useGmvUsdOverTimeSeries', () => {
            mockUseGmvUsdOverTimeSeries.mockReturnValue({
                data: undefined,
                isLoading: true,
                isError: false,
                error: null,
                refetch: jest.fn(),
            } as any)

            const { result } = renderHook(() => useTrialMetrics())

            expect(result.current.isLoading).toBe(true)
        })
    })

    describe('date range', () => {
        it('should pass a 30-day period to the query', () => {
            renderHook(() => useTrialMetrics())

            const call = mockUseGmvUsdOverTimeSeries.mock.calls[0]
            const period = call[0].period

            expect(period).toHaveProperty('start_datetime')
            expect(period).toHaveProperty('end_datetime')
            expect(typeof period.start_datetime).toBe('string')
            expect(typeof period.end_datetime).toBe('string')
        })
    })

    describe('integration types', () => {
        it('should call useAppSelector for integrations and timezone', () => {
            renderHook(() => useTrialMetrics())

            // Should be called at least twice - once for integrations, once for timezone
            expect(mockUseAppSelector).toHaveBeenCalledTimes(2)
        })
    })
})
