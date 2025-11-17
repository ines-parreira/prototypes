import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import moment from 'moment/moment'

import {
    INTENT_DIMENSION,
    PRODUCT_ID_DIMENSION,
    TICKET_COUNT_MEASURE,
    useTopIntentPerProduct,
} from 'domains/reporting/hooks/voice-of-customer/useTopIntentPerProduct'
import { usePostReporting } from 'domains/reporting/models/queries'
import { ticketCountPerProductAndIntentQueryFactory } from 'domains/reporting/models/queryFactories/voice-of-customer/intentPerProductQueryFactory'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReporting)

describe('useTopIntentPerProduct', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }
    const timezone = 'someTimeZone'
    const intentCustomFieldId = '123'
    const firstProductId = 'product1'
    const secondProductId = 'product2'

    const mockData = [
        {
            [PRODUCT_ID_DIMENSION]: firstProductId,
            [INTENT_DIMENSION]: 'intent1',
            [TICKET_COUNT_MEASURE]: '10',
        },
        {
            [PRODUCT_ID_DIMENSION]: firstProductId,
            [INTENT_DIMENSION]: 'intent2',
            [TICKET_COUNT_MEASURE]: '5',
        },
        {
            [PRODUCT_ID_DIMENSION]: secondProductId,
            [INTENT_DIMENSION]: 'intent3',
            [TICKET_COUNT_MEASURE]: '15',
        },
        {
            [PRODUCT_ID_DIMENSION]: secondProductId,
            [INTENT_DIMENSION]: 'intent4',
            [TICKET_COUNT_MEASURE]: '30',
        },
    ]

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

    it('should call usePostReporting with the correct query', () => {
        renderHook(() =>
            useTopIntentPerProduct(
                statsFilters,
                timezone,
                intentCustomFieldId,
                firstProductId,
            ),
        )

        const select = usePostReportingMock.mock.calls[0][1]?.select

        expect(usePostReportingMock).toHaveBeenCalledWith(
            [
                ticketCountPerProductAndIntentQueryFactory(
                    statsFilters,
                    timezone,
                    intentCustomFieldId,
                    OrderDirection.Desc,
                ),
            ],
            expect.objectContaining({
                select,
            }),
        )

        const mockResponse = {
            data: {
                data: mockData,
            },
        }
        expect(select?.(mockResponse as any)).toEqual(mockData)
    })

    it('should return the top intent for a specific product when productId is provided', () => {
        const { result } = renderHook(() =>
            useTopIntentPerProduct(
                statsFilters,
                timezone,
                intentCustomFieldId,
                firstProductId,
            ),
        )

        expect(result.current.data.value).toBe('intent1')
        expect(result.current.data.allData).toEqual([
            {
                productId: firstProductId,
                topIntent: 'intent1',
                value: 10,
            },
            {
                productId: secondProductId,
                topIntent: 'intent4',
                value: 30,
            },
        ])
    })

    it('should return null value when productId is not provided', () => {
        const { result } = renderHook(() =>
            useTopIntentPerProduct(statsFilters, timezone, intentCustomFieldId),
        )

        expect(result.current.data.value).toBe(null)
        expect(result.current.data.allData).toEqual([
            {
                productId: firstProductId,
                topIntent: 'intent1',
                value: 10,
            },
            {
                productId: secondProductId,
                topIntent: 'intent4',
                value: 30,
            },
        ])
    })

    it('should return null value and empty allData when data is undefined', () => {
        usePostReportingMock.mockReturnValue({
            ...defaultReporting,
            data: undefined,
        } as UseQueryResult)

        const { result } = renderHook(() =>
            useTopIntentPerProduct(
                statsFilters,
                timezone,
                intentCustomFieldId,
                firstProductId,
            ),
        )

        expect(result.current.data.value).toBe(null)
        expect(result.current.data.allData).toEqual([])
    })

    it('should return null value when productId is not found in data', () => {
        const nonExistentProductId = 'nonExistentProduct'

        const { result } = renderHook(() =>
            useTopIntentPerProduct(
                statsFilters,
                timezone,
                intentCustomFieldId,
                nonExistentProductId,
            ),
        )

        expect(result.current.data.value).toBe(null)
        expect(result.current.data.allData).toEqual([
            {
                productId: firstProductId,
                topIntent: 'intent1',
                value: 10,
            },
            {
                productId: secondProductId,
                topIntent: 'intent4',
                value: 30,
            },
        ])
    })

    it('should handle items with missing productId or intent', () => {
        const dataWithMissingFields = [
            ...mockData,
            {
                [PRODUCT_ID_DIMENSION]: 'product3',
                [INTENT_DIMENSION]: null,
                [TICKET_COUNT_MEASURE]: '20',
            },
            {
                [PRODUCT_ID_DIMENSION]: null,
                [INTENT_DIMENSION]: 'intent5',
                [TICKET_COUNT_MEASURE]: '55',
            },
        ]

        usePostReportingMock.mockReturnValue({
            ...defaultReporting,
            data: dataWithMissingFields,
        } as UseQueryResult)

        const { result } = renderHook(() =>
            useTopIntentPerProduct(statsFilters, timezone, intentCustomFieldId),
        )

        expect(result.current.data.allData).toEqual([
            {
                productId: firstProductId,
                topIntent: 'intent1',
                value: 10,
            },
            {
                productId: secondProductId,
                topIntent: 'intent4',
                value: 30,
            },
        ])
    })
})
