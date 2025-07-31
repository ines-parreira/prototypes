import { renderHook } from '@repo/testing'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useProductsTicketCountsPerIntentWithEnrichment } from 'domains/reporting/hooks/voice-of-customer/metricsPerProductAndIntent'
import { useProductsTicketCountsPerIntentDistribution } from 'domains/reporting/hooks/voice-of-customer/useProductsTicketCountsPerIntentDistribution'
import { TicketProductsEnrichedMeasure } from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    EnrichmentFields,
    ReportingGranularity,
} from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock(
    'domains/reporting/hooks/voice-of-customer/metricsPerProductAndIntent',
)
jest.mock('domains/reporting/utils/reporting')

const useStatsFiltersMock = assumeMock(useStatsFilters)
const useProductsTicketCountsPerIntentWithEnrichmentMock = assumeMock(
    useProductsTicketCountsPerIntentWithEnrichment,
)
const getPreviousPeriodMock = assumeMock(getPreviousPeriod)

describe('useProductsTicketCountsPerIntentDistribution', () => {
    const intentCustomFieldId = 123
    const intentsCustomFieldValueString = 'Product::Return'
    const sorting = OrderDirection.Desc
    const limit = 5

    const mockStatsFilters: StatsFilters = {
        period: {
            start_datetime: '2024-01-01T00:00:00Z',
            end_datetime: '2024-01-31T23:59:59Z',
        },
    }

    const mockPreviousPeriodFilters: StatsFilters = {
        period: {
            start_datetime: '2023-12-01T00:00:00Z',
            end_datetime: '2023-12-31T23:59:59Z',
        },
    }

    const userTimezone = 'America/New_York'

    beforeEach(() => {
        jest.clearAllMocks()

        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: mockStatsFilters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })

        getPreviousPeriodMock.mockReturnValue(mockPreviousPeriodFilters.period)

        useProductsTicketCountsPerIntentWithEnrichmentMock.mockReturnValue({
            data: {
                allData: [],
            },
            isFetching: false,
            isError: false,
        })
    })

    describe('successful data loading', () => {
        it('should call dependencies with correct parameters', () => {
            renderHook(() =>
                useProductsTicketCountsPerIntentDistribution(
                    intentCustomFieldId,
                    intentsCustomFieldValueString,
                    sorting,
                ),
            )

            expect(useStatsFilters).toHaveBeenCalled()
            expect(getPreviousPeriod).toHaveBeenCalledWith(
                mockStatsFilters.period,
            )
            expect(
                useProductsTicketCountsPerIntentWithEnrichment,
            ).toHaveBeenNthCalledWith(
                1,
                mockStatsFilters,
                userTimezone,
                intentCustomFieldId,
                intentsCustomFieldValueString,
                sorting,
                limit,
            )
            expect(
                useProductsTicketCountsPerIntentWithEnrichment,
            ).toHaveBeenNthCalledWith(
                2,
                {
                    ...mockStatsFilters,
                    period: mockPreviousPeriodFilters.period,
                },
                userTimezone,
                intentCustomFieldId,
                intentsCustomFieldValueString,
                sorting,
                limit,
            )
        })

        it('should work without sorting parameter', () => {
            renderHook(() =>
                useProductsTicketCountsPerIntentDistribution(
                    intentCustomFieldId,
                    intentsCustomFieldValueString,
                ),
            )

            expect(
                useProductsTicketCountsPerIntentWithEnrichment,
            ).toHaveBeenNthCalledWith(
                1,
                mockStatsFilters,
                userTimezone,
                intentCustomFieldId,
                intentsCustomFieldValueString,
                undefined,
                limit,
            )
            expect(
                useProductsTicketCountsPerIntentWithEnrichment,
            ).toHaveBeenNthCalledWith(
                2,
                {
                    ...mockStatsFilters,
                    period: mockPreviousPeriodFilters.period,
                },
                userTimezone,
                intentCustomFieldId,
                intentsCustomFieldValueString,
                undefined,
                limit,
            )
        })

        it('should return formatted data with matching previous period data', () => {
            const mockData = {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            }
            useProductsTicketCountsPerIntentWithEnrichmentMock
                .mockReturnValueOnce(mockData)
                .mockReturnValueOnce(mockData)

            const { result } = renderHook(() =>
                useProductsTicketCountsPerIntentDistribution(
                    intentCustomFieldId,
                    intentsCustomFieldValueString,
                    sorting,
                ),
            )

            expect(result.current).toEqual({
                data: [],
                isFetching: false,
                isError: false,
            })
        })

        it('should correctly match and transform data with previous period data', () => {
            const currentPeriodData = {
                data: {
                    allData: [
                        {
                            [EnrichmentFields.ProductExternalProductId]:
                                'product-1',
                            [EnrichmentFields.ProductTitle]: 'iPhone 15',
                            [EnrichmentFields.ProductThumbnailUrl]:
                                'https://example.com/iphone.jpg',
                            [TicketProductsEnrichedMeasure.TicketCount]: 25,
                        },
                        {
                            [EnrichmentFields.ProductExternalProductId]:
                                'product-2',
                            [EnrichmentFields.ProductTitle]: 'MacBook Pro',
                            [EnrichmentFields.ProductThumbnailUrl]:
                                'https://example.com/macbook.jpg',
                            [TicketProductsEnrichedMeasure.TicketCount]: 15,
                        },
                        {
                            [EnrichmentFields.ProductExternalProductId]:
                                'product-3',
                            [EnrichmentFields.ProductTitle]: 'AirPods',
                            [EnrichmentFields.ProductThumbnailUrl]:
                                'https://example.com/airpods.jpg',
                            [TicketProductsEnrichedMeasure.TicketCount]: 10,
                        },
                    ],
                },
                isFetching: false,
                isError: false,
            } as any

            const previousPeriodData = {
                data: {
                    allData: [
                        {
                            [EnrichmentFields.ProductExternalProductId]:
                                'product-1',
                            [EnrichmentFields.ProductTitle]: 'iPhone 15',
                            [EnrichmentFields.ProductThumbnailUrl]:
                                'https://example.com/iphone.jpg',
                            [TicketProductsEnrichedMeasure.TicketCount]: 20,
                        },
                        {
                            [EnrichmentFields.ProductExternalProductId]:
                                'product-2',
                            [EnrichmentFields.ProductTitle]: 'MacBook Pro',
                            [EnrichmentFields.ProductThumbnailUrl]:
                                'https://example.com/macbook.jpg',
                            [TicketProductsEnrichedMeasure.TicketCount]: 18,
                        },
                    ],
                },
                isFetching: false,
                isError: false,
            } as any

            useProductsTicketCountsPerIntentWithEnrichmentMock
                .mockReturnValueOnce(currentPeriodData)
                .mockReturnValueOnce(previousPeriodData)

            const { result } = renderHook(() =>
                useProductsTicketCountsPerIntentDistribution(
                    intentCustomFieldId,
                    intentsCustomFieldValueString,
                    sorting,
                ),
            )

            expect(result.current.data).toEqual([
                {
                    name: 'iPhone 15',
                    value: 25,
                    prevValue: 20,
                    productId: 'product-1',
                    productUrl: 'https://example.com/iphone.jpg',
                },
                {
                    name: 'MacBook Pro',
                    value: 15,
                    prevValue: 18,
                    productId: 'product-2',
                    productUrl: 'https://example.com/macbook.jpg',
                },
                {
                    name: 'AirPods',
                    value: 10,
                    prevValue: undefined,
                    productId: 'product-3',
                    productUrl: 'https://example.com/airpods.jpg',
                },
            ])
            expect(result.current.isFetching).toBe(false)
            expect(result.current.isError).toBe(false)
        })

        it('should handle case where previous period data is missing', () => {
            const mockData = {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            }
            useProductsTicketCountsPerIntentWithEnrichmentMock
                .mockReturnValueOnce(mockData)
                .mockReturnValueOnce({
                    data: null,
                    isFetching: false,
                    isError: false,
                })

            const { result } = renderHook(() =>
                useProductsTicketCountsPerIntentDistribution(
                    intentCustomFieldId,
                    intentsCustomFieldValueString,
                ),
            )

            expect(result.current.data).toEqual([])
        })
    })

    describe('loading states', () => {
        it('should return isFetching=true when current period is loading', () => {
            const loadingData = {
                data: null,
                isFetching: true,
                isError: false,
            }
            const successData = {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            }
            useProductsTicketCountsPerIntentWithEnrichmentMock
                .mockReturnValueOnce(loadingData)
                .mockReturnValueOnce(successData)

            const { result } = renderHook(() =>
                useProductsTicketCountsPerIntentDistribution(
                    intentCustomFieldId,
                    intentsCustomFieldValueString,
                ),
            )

            expect(result.current.isFetching).toBe(true)
            expect(result.current.data).toEqual([])
        })

        it('should return isFetching=true when previous period is loading', () => {
            const successData = {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            }
            const loadingData = {
                data: null,
                isFetching: true,
                isError: false,
            }
            useProductsTicketCountsPerIntentWithEnrichmentMock
                .mockReturnValueOnce(successData)
                .mockReturnValueOnce(loadingData)

            const { result } = renderHook(() =>
                useProductsTicketCountsPerIntentDistribution(
                    intentCustomFieldId,
                    intentsCustomFieldValueString,
                ),
            )

            expect(result.current.isFetching).toBe(true)
        })

        it('should return isFetching=true when both periods are loading', () => {
            const loadingData = {
                data: null,
                isFetching: true,
                isError: false,
            }
            useProductsTicketCountsPerIntentWithEnrichmentMock
                .mockReturnValueOnce(loadingData)
                .mockReturnValueOnce(loadingData)

            const { result } = renderHook(() =>
                useProductsTicketCountsPerIntentDistribution(
                    intentCustomFieldId,
                    intentsCustomFieldValueString,
                ),
            )

            expect(result.current.isFetching).toBe(true)
        })
    })

    describe('error states', () => {
        it('should return isError=true when current period has error', () => {
            const errorData = {
                data: null,
                isFetching: false,
                isError: true,
            }
            const successData = {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            }
            useProductsTicketCountsPerIntentWithEnrichmentMock
                .mockReturnValueOnce(errorData)
                .mockReturnValueOnce(successData)

            const { result } = renderHook(() =>
                useProductsTicketCountsPerIntentDistribution(
                    intentCustomFieldId,
                    intentsCustomFieldValueString,
                ),
            )

            expect(result.current.isError).toBe(true)
            expect(result.current.data).toEqual([])
        })

        it('should return isError=true when previous period has error', () => {
            const successData = {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            }
            const errorData = {
                data: null,
                isFetching: false,
                isError: true,
            }
            useProductsTicketCountsPerIntentWithEnrichmentMock
                .mockReturnValueOnce(successData)
                .mockReturnValueOnce(errorData)

            const { result } = renderHook(() =>
                useProductsTicketCountsPerIntentDistribution(
                    intentCustomFieldId,
                    intentsCustomFieldValueString,
                ),
            )

            expect(result.current.isError).toBe(true)
        })

        it('should return isError=true when both periods have errors', () => {
            const errorData = {
                data: null,
                isFetching: false,
                isError: true,
            }
            useProductsTicketCountsPerIntentWithEnrichmentMock
                .mockReturnValueOnce(errorData)
                .mockReturnValueOnce(errorData)

            const { result } = renderHook(() =>
                useProductsTicketCountsPerIntentDistribution(
                    intentCustomFieldId,
                    intentsCustomFieldValueString,
                ),
            )

            expect(result.current.isError).toBe(true)
        })
    })

    describe('edge cases', () => {
        it('should handle empty current period data', () => {
            const emptyData = {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            }
            useProductsTicketCountsPerIntentWithEnrichmentMock
                .mockReturnValueOnce(emptyData)
                .mockReturnValueOnce(emptyData)

            const { result } = renderHook(() =>
                useProductsTicketCountsPerIntentDistribution(
                    intentCustomFieldId,
                    intentsCustomFieldValueString,
                ),
            )

            expect(result.current.data).toEqual([])
            expect(result.current.isFetching).toBe(false)
            expect(result.current.isError).toBe(false)
        })

        it('should handle null current period data', () => {
            const nullData = {
                data: null,
                isFetching: false,
                isError: false,
            }
            const emptyData = {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            }
            useProductsTicketCountsPerIntentWithEnrichmentMock
                .mockReturnValueOnce(nullData)
                .mockReturnValueOnce(emptyData)

            const { result } = renderHook(() =>
                useProductsTicketCountsPerIntentDistribution(
                    intentCustomFieldId,
                    intentsCustomFieldValueString,
                ),
            )

            expect(result.current.data).toEqual([])
        })
    })
})
