import { renderHook } from '@repo/testing'

import { useTicketCountPerProductWithEnrichment } from 'domains/reporting/hooks/voice-of-customer/metricsPerProduct'
import { useTicketsPerProductTrend } from 'domains/reporting/hooks/voice-of-customer/useTicketsPerProductTrend'
import { EnrichmentFields } from 'domains/reporting/models/types'
import {
    PRODUCT_ID_FIELD,
    PRODUCT_NAME_FIELD,
    TICKET_COUNT_FIELD,
} from 'domains/reporting/state/ui/stats/productsPerTicketSlice'
import { OrderDirection } from 'models/api/types'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/hooks/voice-of-customer/metricsPerProduct')
const useTicketCountPerProductWithEnrichmentMock = assumeMock(
    useTicketCountPerProductWithEnrichment,
)

describe('useTicketsPerProductTrend', () => {
    const statsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00+02:00',
            end_datetime: '2021-06-04T23:59:59+02:00',
        },
    }
    const userTimezone = 'UTC'
    const currentPeriodData = {
        data: {
            value: 123,
            allData: [
                {
                    [PRODUCT_ID_FIELD]: '1',
                    [TICKET_COUNT_FIELD]: '10',
                    [PRODUCT_NAME_FIELD]: 'Product name',
                    [EnrichmentFields.ProductThumbnailUrl]: '',
                    [EnrichmentFields.ProductExternalProductId]: '1',
                },
            ],
            decile: 4,
        },
        isFetching: false,
        isError: false,
    }
    const previousPeriodData = {
        data: {
            value: 99,
            allData: [
                {
                    [PRODUCT_ID_FIELD]: '1',
                    [TICKET_COUNT_FIELD]: '5',
                    [PRODUCT_NAME_FIELD]: 'Product name',
                    [EnrichmentFields.ProductThumbnailUrl]: '',
                    [EnrichmentFields.ProductExternalProductId]: '1',
                },
            ],
            decile: 4,
        },
        isFetching: false,
        isError: false,
    }

    it('should return data for current and previous period', () => {
        useTicketCountPerProductWithEnrichmentMock.mockReturnValueOnce(
            currentPeriodData as any,
        )
        useTicketCountPerProductWithEnrichmentMock.mockReturnValueOnce(
            previousPeriodData as any,
        )

        const { result } = renderHook(() =>
            useTicketsPerProductTrend(
                statsFilters,
                userTimezone,
                OrderDirection.Asc,
            ),
        )

        expect(result.current).toEqual({
            data: {
                value: currentPeriodData.data.allData,
                prevValue: previousPeriodData.data.allData,
            },
            isError: false,
            isFetching: false,
        })
    })

    it('should return empty arrays when no data', () => {
        useTicketCountPerProductWithEnrichmentMock.mockReturnValueOnce({
            data: null,
            isFetching: false,
            isError: false,
        })
        useTicketCountPerProductWithEnrichmentMock.mockReturnValueOnce({
            data: null,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() =>
            useTicketsPerProductTrend(
                statsFilters,
                userTimezone,
                OrderDirection.Asc,
            ),
        )

        expect(result.current).toEqual({
            data: {
                value: [],
                prevValue: [],
            },
            isError: false,
            isFetching: false,
        })
    })
})
