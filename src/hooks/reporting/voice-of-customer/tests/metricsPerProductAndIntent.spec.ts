import {
    fetchMetricPerDimension,
    MetricWithDecile,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import {
    fetchTicketCountPerIntent,
    useTicketCountPerIntent,
} from 'hooks/reporting/voice-of-customer/metricsPerProductAndIntent'
import { OrderDirection } from 'models/api/types'
import { ticketCountPerIntentQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/ticketCountPerIntent'
import { StatsFilters } from 'models/stat/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

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
    const intentsCustomFieldId = 'test-intent-field'
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
                    intentsCustomFieldId,
                    productId,
                    sorting,
                ),
            )

            expect(ticketCountPerIntentQueryFactory).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                intentsCustomFieldId,
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
                    intentsCustomFieldId,
                ),
            )

            expect(ticketCountPerIntentQueryFactory).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                intentsCustomFieldId,
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
                    intentsCustomFieldId,
                    productId,
                ),
            )

            expect(result.current).toEqual(mockResult)
        })
    })

    describe('fetchTicketCountPerIntent', () => {
        it('should call fetchMetricPerDimension with correct parameters', async () => {
            await fetchTicketCountPerIntent(
                statsFilters,
                timezone,
                intentsCustomFieldId,
                productId,
                sorting,
            )

            expect(ticketCountPerIntentQueryFactory).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                intentsCustomFieldId,
                sorting,
            )
            expect(fetchMetricPerDimension).toHaveBeenCalledWith(
                mockQuery,
                productId,
            )
        })

        it('should work without optional parameters', async () => {
            await fetchTicketCountPerIntent(
                statsFilters,
                timezone,
                intentsCustomFieldId,
            )

            expect(ticketCountPerIntentQueryFactory).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                intentsCustomFieldId,
                undefined,
            )
            expect(fetchMetricPerDimension).toHaveBeenCalledWith(
                mockQuery,
                undefined,
            )
        })

        it('should return the result from fetchMetricPerDimension', async () => {
            const result = await fetchTicketCountPerIntent(
                statsFilters,
                timezone,
                intentsCustomFieldId,
                productId,
            )

            expect(result).toEqual(mockResult)
        })
    })
})
