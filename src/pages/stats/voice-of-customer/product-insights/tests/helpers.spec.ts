import { useProductsTicketCountsPerIntentDistribution } from 'hooks/reporting/voice-of-customer/useProductsTicketCountsPerIntentDistribution'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    LeadColumn,
    TopIntentsColumns,
} from 'pages/stats/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentConfig'
import { DEFAULT_SORTING_VALUE } from 'pages/stats/voice-of-customer/constants'
import {
    formatProductsPerIntentsTableData,
    getColumnsSortingValue,
} from 'pages/stats/voice-of-customer/product-insights/helpers'
import { assumeMock } from 'utils/testing'

jest.mock(
    'hooks/reporting/voice-of-customer/useProductsTicketCountsPerIntentDistribution',
)
const useProductsTicketCountsPerIntentDistributionMock = assumeMock(
    useProductsTicketCountsPerIntentDistribution,
)

describe('formatTableData', () => {
    const intentCustomFieldId = 123

    useProductsTicketCountsPerIntentDistributionMock.mockImplementation(() => ({
        data: [],
        isFetching: false,
        isError: false,
    }))

    it('should format data with valid values', () => {
        const input = [
            {
                category: 'intent1',
                value: '100',
                prevValue: '80',
                productId: 'prod1',
                productUrl: 'http://example.com/prod1',
            },
            {
                category: 'intent2',
                value: '50',
                prevValue: '40',
                productId: 'prod2',
                productUrl: 'http://example.com/prod2',
            },
        ]

        const result = formatProductsPerIntentsTableData(
            input,
            intentCustomFieldId,
        )

        expect(result).toHaveLength(2)
        expect(result[0]).toMatchObject({
            entityId: 'intent1',
            value: 100,
            prevValue: 80,
            level: 0,
            intentCustomFieldId: 123,
            leadColumn: LeadColumn,
            children: [],
        })
        expect(result[1]).toMatchObject({
            entityId: 'intent2',
            value: 50,
            prevValue: 40,
            level: 0,
            intentCustomFieldId: 123,
            leadColumn: LeadColumn,
            children: [],
        })
    })

    it('should handle null values', () => {
        const input = [
            {
                category: null,
                value: null,
                prevValue: null,
                productId: 'prod1',
                productUrl: 'http://example.com/prod1',
            },
            {
                category: 'intent2',
                value: '50',
                prevValue: null,
                productId: 'prod2',
                productUrl: 'http://example.com/prod2',
            },
        ]

        const result = formatProductsPerIntentsTableData(
            input,
            intentCustomFieldId,
        )

        expect(result).toHaveLength(2)
        expect(result[0]).toMatchObject({
            entityId: '',
            value: 0,
            prevValue: 0,
            level: 0,
            intentCustomFieldId: 123,
            leadColumn: LeadColumn,
            children: [],
        })
        expect(result[1]).toMatchObject({
            entityId: 'intent2',
            value: 50,
            prevValue: 0,
            level: 0,
            intentCustomFieldId: 123,
            leadColumn: LeadColumn,
            children: [],
        })
    })

    it('should handle empty array', () => {
        const result = formatProductsPerIntentsTableData(
            [],
            intentCustomFieldId,
        )
        expect(result).toEqual([])
    })
})

describe('getColumnsSortingValue', () => {
    it('should return TicketCustomFieldsValue for Intent column', () => {
        const result = getColumnsSortingValue(TopIntentsColumns.Intent)
        expect(result).toBe(TicketCustomFieldsDimension.TicketCustomFieldsValue)
    })

    it('should return TicketCustomFieldsTicketCount for Volume column', () => {
        const result = getColumnsSortingValue(TopIntentsColumns.TicketVolume)
        expect(result).toBe(
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
        )
    })

    it('should return DEFAULT_SORTING_VALUE for unknown column', () => {
        const result = getColumnsSortingValue('unknown' as TopIntentsColumns)
        expect(result).toBe(DEFAULT_SORTING_VALUE)
    })
})
