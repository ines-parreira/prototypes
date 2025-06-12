import {
    fetchMetricPerDimension,
    MetricWithDecile,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import {
    fetchTicketCountPerIntentForProduct,
    useTicketCountPerIntent,
    useTicketCountPerIntentForProduct,
} from 'hooks/reporting/voice-of-customer/metricsPerProductAndIntent'
import { OrderDirection } from 'models/api/types'
import {
    ticketCountPerIntentForProductQueryFactory,
    ticketCountPerIntentQueryFactory,
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
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)
const ticketCountPerIntentQueryFactoryMock = assumeMock(
    ticketCountPerIntentQueryFactory,
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

    beforeEach(() => {
        jest.clearAllMocks()
        ticketCountPerIntentQueryFactoryMock.mockReturnValue(mockQuery)
        useMetricPerDimensionMock.mockReturnValue(mockResult)
        fetchMetricPerDimensionMock.mockResolvedValue(mockResult)
    })

    describe('useTicketCountPerIntent', () => {
        it('should call useMetricPerDimension with correct parameters', () => {
            renderHook(() =>
                useTicketCountPerIntent(
                    statsFilters,
                    timezone,
                    intentCustomFieldId,
                    productId,
                    sorting,
                ),
            )

            expect(ticketCountPerIntentQueryFactory).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                intentCustomFieldId,
                sorting,
            )
            expect(useMetricPerDimension).toHaveBeenCalledWith(
                mockQuery,
                productId,
            )
        })

        it('should work without optional parameters', () => {
            renderHook(() =>
                useTicketCountPerIntent(
                    statsFilters,
                    timezone,
                    intentCustomFieldId,
                ),
            )

            expect(ticketCountPerIntentQueryFactory).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                intentCustomFieldId,
                undefined,
            )
            expect(useMetricPerDimension).toHaveBeenCalledWith(
                mockQuery,
                undefined,
            )
        })

        it('should return the result from useMetricPerDimension', () => {
            const { result } = renderHook(() =>
                useTicketCountPerIntent(
                    statsFilters,
                    timezone,
                    intentCustomFieldId,
                    productId,
                ),
            )

            expect(result.current).toEqual(mockResult)
        })
    })

    describe('fetchTicketCountPerIntent', () => {
        it('should call fetchMetricPerDimension with correct parameters', async () => {
            await fetchTicketCountPerIntentForProduct(
                statsFilters,
                timezone,
                intentCustomFieldId,
                productId,
                sorting,
            )

            expect(ticketCountPerIntentQueryFactory).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                intentCustomFieldId,
                sorting,
            )
            expect(fetchMetricPerDimension).toHaveBeenCalledWith(
                mockQuery,
                productId,
            )
        })

        it('should work without optional parameters', async () => {
            await fetchTicketCountPerIntentForProduct(
                statsFilters,
                timezone,
                intentCustomFieldId,
            )

            expect(ticketCountPerIntentQueryFactory).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                intentCustomFieldId,
                undefined,
            )
            expect(fetchMetricPerDimension).toHaveBeenCalledWith(
                mockQuery,
                undefined,
            )
        })

        it('should return the result from fetchMetricPerDimension', async () => {
            const result = await fetchTicketCountPerIntentForProduct(
                statsFilters,
                timezone,
                intentCustomFieldId,
                productId,
            )

            expect(result).toEqual(mockResult)
        })
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
})
