import {
    fetchMetricPerDimension,
    MetricWithDecile,
    useMetricPerDimension,
    useMetricPerDimensionWithEnrichment,
} from 'hooks/reporting/useMetricPerDimension'
import {
    PRODUCT_ENRICHMENT_ENTITY_ID,
    PRODUCT_ENRICHMENT_FIELDS,
    useProductsTicketCountsPerIntentWithEnrichment,
    useTicketCountPerIntentForProduct,
} from 'hooks/reporting/voice-of-customer/metricsPerProductAndIntent'
import { OrderDirection } from 'models/api/types'
import {
    ticketCountForIntentQueryFactory,
    ticketCountPerIntentForProductQueryFactory,
} from 'models/reporting/queryFactories/voice-of-customer/ticketCountPerIntent'
import { StatsFilters } from 'models/stat/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/useMetric')
jest.mock('hooks/reporting/useMetricPerDimension')
jest.mock(
    'models/reporting/queryFactories/voice-of-customer/ticketCountPerIntent',
)

const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const useMetricPerDimensionWithEnrichmentMock = assumeMock(
    useMetricPerDimensionWithEnrichment,
)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)
const productsTicketCountPerIntentQueryFactoryMock = assumeMock(
    ticketCountForIntentQueryFactory,
)

describe('metricsPerProductAndIntent', () => {
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: '2024-01-01T00:00:00Z',
            end_datetime: '2024-01-31T23:59:59Z',
        },
    }
    const timezone = 'UTC'
    const intentCustomFieldId = 123
    const productId = 'test-product'
    const sorting = OrderDirection.Desc
    const mockQuery = {
        measures: [],
        dimensions: [],
        filters: [],
        timezone: 'UTC',
    }
    const mockResult: MetricWithDecile = {
        data: {
            value: 100,
            decile: 0.8,
            allData: [],
        },
        isFetching: false,
        isError: false,
    }

    const mockEnrichmentResult = {
        data: {
            value: null,
            allData: [],
        },
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        productsTicketCountPerIntentQueryFactoryMock.mockReturnValue(mockQuery)
        useMetricPerDimensionMock.mockReturnValue(mockResult)
        useMetricPerDimensionWithEnrichmentMock.mockReturnValue(
            mockEnrichmentResult,
        )
        fetchMetricPerDimensionMock.mockResolvedValue(mockResult)
    })

    describe('useTicketCountPerIntentForProduct', () => {
        it('calls `useMetricPerDimension` with correct arguments', () => {
            renderHook(() =>
                useTicketCountPerIntentForProduct(
                    statsFilters,
                    timezone,
                    intentCustomFieldId,
                    productId,
                ),
            )

            expect(useMetricPerDimension).toHaveBeenCalledWith(
                ticketCountPerIntentForProductQueryFactory(
                    statsFilters,
                    timezone,
                    intentCustomFieldId,
                    productId,
                ),
                undefined,
            )
        })

        it('should call `useMetricPerDimension` with `intent` if provided', () => {
            const intent = 'my::intent'

            renderHook(() =>
                useTicketCountPerIntentForProduct(
                    statsFilters,
                    timezone,
                    intentCustomFieldId,
                    productId,
                    OrderDirection.Asc,
                    intent,
                ),
            )

            expect(useMetricPerDimension).toHaveBeenCalledWith(
                ticketCountPerIntentForProductQueryFactory(
                    statsFilters,
                    timezone,
                    intentCustomFieldId,
                    productId,
                ),
                intent,
            )
        })
    })

    describe('useProductsTicketCountsPerIntentWithEnrichment', () => {
        const intentsCustomFieldValueString = 'Product::Return'

        it('should call useMetricPerDimensionWithEnrichment with correct parameters', () => {
            renderHook(() =>
                useProductsTicketCountsPerIntentWithEnrichment(
                    statsFilters,
                    timezone,
                    intentCustomFieldId,
                    intentsCustomFieldValueString,
                    sorting,
                ),
            )

            expect(ticketCountForIntentQueryFactory).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                intentCustomFieldId,
                intentsCustomFieldValueString,
                sorting,
            )
            expect(useMetricPerDimensionWithEnrichment).toHaveBeenCalledWith(
                mockQuery,
                PRODUCT_ENRICHMENT_FIELDS,
                PRODUCT_ENRICHMENT_ENTITY_ID,
            )
        })

        it('should work without sorting parameter', () => {
            renderHook(() =>
                useProductsTicketCountsPerIntentWithEnrichment(
                    statsFilters,
                    timezone,
                    intentCustomFieldId,
                    intentsCustomFieldValueString,
                ),
            )

            expect(ticketCountForIntentQueryFactory).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                intentCustomFieldId,
                intentsCustomFieldValueString,
                undefined,
            )
            expect(useMetricPerDimensionWithEnrichment).toHaveBeenCalledWith(
                mockQuery,
                PRODUCT_ENRICHMENT_FIELDS,
                PRODUCT_ENRICHMENT_ENTITY_ID,
            )
        })

        it('should return the result from useMetricPerDimensionWithEnrichment', () => {
            const { result } = renderHook(() =>
                useProductsTicketCountsPerIntentWithEnrichment(
                    statsFilters,
                    timezone,
                    intentCustomFieldId,
                    intentsCustomFieldValueString,
                    sorting,
                ),
            )

            expect(result.current).toEqual(mockEnrichmentResult)
        })
    })
})
