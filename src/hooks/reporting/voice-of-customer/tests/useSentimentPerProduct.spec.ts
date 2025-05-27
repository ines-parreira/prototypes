import { UseQueryResult } from '@tanstack/react-query'
import moment from 'moment'

import {
    INTENT_DIMENSION,
    PRODUCT_ID_DIMENSION,
    Sentiment,
    TICKET_COUNT_MEASURE,
    useSentimentPerProduct,
} from 'hooks/reporting/voice-of-customer/useSentimentPerProduct'
import { usePostReporting } from 'models/reporting/queries'
import { sentimentsTicketCountPerProductQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/sentimentPerProduct'
import { StatsFilters } from 'models/stat/types'
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

    const sentimentCustomFieldId = '123'

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

    const normalizedData = {
        [firstProductId]: {
            [Sentiment.Negative]: {
                productId: firstProductId,
                sentiment: Sentiment.Negative,
                value: 5,
            },
            [Sentiment.Positive]: {
                productId: firstProductId,
                sentiment: Sentiment.Positive,
                value: 10,
            },
        },
        [secondProductId]: {
            [Sentiment.Negative]: {
                productId: secondProductId,
                sentiment: Sentiment.Negative,
                value: 30,
            },
            [Sentiment.Positive]: {
                productId: secondProductId,
                sentiment: Sentiment.Positive,
                value: 15,
            },
        },
    }

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

        const expected = 5

        expect(result.current.data.value).toBe(expected)
    })

    it('returns normalized data per product and per sentiment', () => {
        const { result } = renderHook(() =>
            useSentimentPerProduct(
                statsFilters,
                timezone,
                sentimentCustomFieldId,
                Sentiment.Negative,
                firstProductId,
            ),
        )

        expect(result.current.data.allData).toEqual(normalizedData)
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

    it('ignores entries that are missing product id', () => {
        usePostReportingMock.mockReturnValue({
            ...defaultReporting,
            data: mockData.concat({
                [INTENT_DIMENSION]: Sentiment.Positive,
            } as any),
        } as UseQueryResult)

        const { result } = renderHook(() =>
            useSentimentPerProduct(
                statsFilters,
                timezone,
                sentimentCustomFieldId,
                Sentiment.Negative,
                'missing-product-id',
            ),
        )

        expect(result.current.data.allData).toEqual(normalizedData)
    })

    it('ignores entries that are missing sentiment', () => {
        usePostReportingMock.mockReturnValue({
            ...defaultReporting,
            data: mockData.concat({ [PRODUCT_ID_DIMENSION]: '123456' } as any),
        } as UseQueryResult)

        const { result } = renderHook(() =>
            useSentimentPerProduct(
                statsFilters,
                timezone,
                sentimentCustomFieldId,
                Sentiment.Negative,
                'missing-product-id',
            ),
        )

        expect(result.current.data.allData).toEqual(normalizedData)
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
        expect(result.current.data.allData).toEqual({})
    })
})
