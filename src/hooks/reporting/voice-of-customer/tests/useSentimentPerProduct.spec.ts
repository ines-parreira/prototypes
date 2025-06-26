import { UseQueryResult } from '@tanstack/react-query'
import moment from 'moment'

import {
    useNegativeSentimentPerProduct,
    useNegativeSentimentsPerProductMetricTrend,
    usePositiveSentimentPerProduct,
    usePositiveSentimentsPerProductMetricTrend,
    useSentimentPerProduct,
} from 'hooks/reporting/voice-of-customer/useSentimentPerProduct'
import { usePostReporting } from 'models/reporting/queries'
import {
    INTENT_DIMENSION,
    PRODUCT_ID_DIMENSION,
    sentimentsTicketCountPerProductQueryFactory,
    TICKET_COUNT_MEASURE,
} from 'models/reporting/queryFactories/voice-of-customer/sentimentPerProduct'
import { Sentiment, StatsFilters } from 'models/stat/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

describe('useSentimentPerProduct', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }
    const timezone = 'Mars'
    const firstProductId = 'product1'
    const secondProductId = 'product2'

    const sentimentCustomFieldId = 123

    const mockData = [
        {
            [PRODUCT_ID_DIMENSION]: firstProductId,
            [INTENT_DIMENSION]: Sentiment.Positive,
            [TICKET_COUNT_MEASURE]: '10',
        },
        {
            [PRODUCT_ID_DIMENSION]: firstProductId,
            [INTENT_DIMENSION]: Sentiment.Negative,
            [TICKET_COUNT_MEASURE]: '5',
        },
        {
            [PRODUCT_ID_DIMENSION]: secondProductId,
            [INTENT_DIMENSION]: Sentiment.Positive,
            [TICKET_COUNT_MEASURE]: '15',
        },
        {
            [PRODUCT_ID_DIMENSION]: secondProductId,
            [INTENT_DIMENSION]: Sentiment.Negative,
            [TICKET_COUNT_MEASURE]: '30',
        },
    ]

    const firstProductNegativeSentimentCount = 5
    const firstProductPositiveSentimentCount = 10

    const defaultReporting = {
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        usePostReportingMock.mockReset()
        usePostReportingMock.mockReturnValue({
            ...defaultReporting,
            data: mockData,
        } as UseQueryResult)
    })

    it('calls usePostReporting with the correct query', () => {
        renderHook(() =>
            useSentimentPerProduct(
                statsFilters,
                timezone,
                sentimentCustomFieldId,
                Sentiment.Positive,
                firstProductId,
            ),
        )

        const select = usePostReportingMock.mock.calls[0][1]?.select

        expect(usePostReportingMock).toHaveBeenCalledWith(
            [
                sentimentsTicketCountPerProductQueryFactory(
                    statsFilters,
                    timezone,
                    sentimentCustomFieldId,
                    firstProductId,
                ),
            ],
            expect.objectContaining({ select }),
        )

        const mockResponse = {
            data: {
                data: mockData,
            },
        }
        expect(select?.(mockResponse as any)).toEqual(mockData)
    })

    it('returns number of tickets for a given sentiment and product', () => {
        const { result } = renderHook(() =>
            useSentimentPerProduct(
                statsFilters,
                timezone,
                sentimentCustomFieldId,
                Sentiment.Negative,
                firstProductId,
            ),
        )

        expect(result.current.data.value).toBe(
            firstProductNegativeSentimentCount,
        )
    })

    it('returns number of tickets for Positive sentiment and product', () => {
        const { result } = renderHook(() =>
            usePositiveSentimentPerProduct(
                statsFilters,
                timezone,
                sentimentCustomFieldId,
                firstProductId,
            ),
        )

        expect(result.current.data.value).toBe(
            firstProductPositiveSentimentCount,
        )
    })

    it('returns number of tickets for Negative sentiment and product', () => {
        const { result } = renderHook(() =>
            useNegativeSentimentPerProduct(
                statsFilters,
                timezone,
                sentimentCustomFieldId,
                firstProductId,
            ),
        )

        expect(result.current.data.value).toBe(
            firstProductNegativeSentimentCount,
        )
    })

    it('returns `null` when product is missing', () => {
        const { result } = renderHook(() =>
            useSentimentPerProduct(
                statsFilters,
                timezone,
                sentimentCustomFieldId,
                Sentiment.Negative,
                'missing-product-id',
            ),
        )

        expect(result.current.data.value).toBeNull()
    })

    it('returns `null` when `productId` is not provided', () => {
        const { result } = renderHook(() =>
            useSentimentPerProduct(
                statsFilters,
                timezone,
                sentimentCustomFieldId,
                Sentiment.Negative,
            ),
        )

        expect(result.current.data.value).toBeNull()
    })

    it('returns `null` when no data', () => {
        usePostReportingMock.mockReturnValue({
            ...defaultReporting,
            data: undefined,
        } as UseQueryResult)

        const { result } = renderHook(() =>
            useSentimentPerProduct(
                statsFilters,
                timezone,
                sentimentCustomFieldId,
                Sentiment.Negative,
                firstProductId,
            ),
        )

        expect(result.current.data.value).toBeNull()
        expect(result.current.data.allData).toEqual([])
    })

    describe('useNegativeSentimentsPerProductMetricTrend', () => {
        const sentimentCustomFieldId = 123

        it('should return current and previous values', () => {
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: [
                    {
                        [PRODUCT_ID_DIMENSION]: firstProductId,
                        [INTENT_DIMENSION]: Sentiment.Negative,
                        [TICKET_COUNT_MEASURE]: '5',
                    },
                ],
            } as UseQueryResult)
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: [
                    {
                        [PRODUCT_ID_DIMENSION]: firstProductId,
                        [INTENT_DIMENSION]: Sentiment.Negative,
                        [TICKET_COUNT_MEASURE]: '1',
                    },
                ],
            } as UseQueryResult)

            const { result } = renderHook(() =>
                useNegativeSentimentsPerProductMetricTrend(
                    statsFilters,
                    timezone,
                    sentimentCustomFieldId,
                    firstProductId,
                ),
            )

            expect(result.current.data?.value).toEqual(5)
            expect(result.current.data?.prevValue).toEqual(1)
        })
    })

    describe('usePositiveSentimentsPerProductMetricTrend', () => {
        const sentimentCustomFieldId = 123

        it('should return current and previous values', () => {
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: [
                    {
                        [PRODUCT_ID_DIMENSION]: firstProductId,
                        [INTENT_DIMENSION]: Sentiment.Positive,
                        [TICKET_COUNT_MEASURE]: String(
                            firstProductPositiveSentimentCount,
                        ),
                    },
                ],
            } as UseQueryResult)
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: [
                    {
                        [PRODUCT_ID_DIMENSION]: firstProductId,
                        [INTENT_DIMENSION]: Sentiment.Positive,
                        [TICKET_COUNT_MEASURE]: '1',
                    },
                ],
            } as UseQueryResult)

            const { result } = renderHook(() =>
                usePositiveSentimentsPerProductMetricTrend(
                    statsFilters,
                    timezone,
                    sentimentCustomFieldId,
                    firstProductId,
                ),
            )

            expect(result.current.data?.value).toEqual(
                firstProductPositiveSentimentCount,
            )
            expect(result.current.data?.prevValue).toEqual(1)
        })
    })
})
