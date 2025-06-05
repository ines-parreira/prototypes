import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import { DEFAULT_BADGE_TEXT } from 'pages/stats/common/components/TrendBadge'
import { DEFAULT_SORTING_VALUE } from 'pages/stats/voice-of-customer/product-insights/constants'
import {
    formatTableData,
    formatTrendData,
    getColumnsSortingValue,
} from 'pages/stats/voice-of-customer/product-insights/helpers'
import {
    LeadColumn,
    TopProductsPerIntentColumn,
} from 'pages/stats/voice-of-customer/product-insights/TopProductsPerIntentConfig'

describe('formatTableData', () => {
    const intentCustomFieldId = 123

    it('should format data with valid values', () => {
        const input = [
            {
                category: 'intent1',
                value: '100',
                prevValue: '80',
            },
            {
                category: 'intent2',
                value: '50',
                prevValue: '40',
            },
        ]

        const result = formatTableData(input, intentCustomFieldId)

        expect(result).toEqual([
            {
                entityId: 'intent1',
                value: 100,
                prevValue: 80,
                level: 0,
                intentsCustomFieldId: 123,
                leadColumn: LeadColumn,
                children: [],
            },
            {
                entityId: 'intent2',
                value: 50,
                prevValue: 40,
                level: 0,
                intentsCustomFieldId: 123,
                leadColumn: LeadColumn,
                children: [],
            },
        ])
    })

    it('should handle null values', () => {
        const input = [
            {
                category: 'intent1',
                value: null,
                prevValue: null,
            },
            {
                category: 'intent2',
                value: '50',
                prevValue: null,
            },
        ]

        const result = formatTableData(input, intentCustomFieldId)

        expect(result).toEqual([
            {
                entityId: 'intent1',
                value: 0,
                prevValue: 0,
                level: 0,
                intentsCustomFieldId: 123,
                leadColumn: LeadColumn,
                children: [],
            },
            {
                entityId: 'intent2',
                value: 50,
                prevValue: 0,
                level: 0,
                intentsCustomFieldId: 123,
                leadColumn: LeadColumn,
                children: [],
            },
        ])
    })

    it('should handle empty array', () => {
        const result = formatTableData([], intentCustomFieldId)
        expect(result).toEqual([])
    })
})

describe('getColumnsSortingValue', () => {
    it('should return TicketCustomFieldsValue for Intent column', () => {
        const result = getColumnsSortingValue(TopProductsPerIntentColumn.Intent)
        expect(result).toBe(TicketCustomFieldsDimension.TicketCustomFieldsValue)
    })

    it('should return TicketCustomFieldsTicketCount for Volume column', () => {
        const result = getColumnsSortingValue(TopProductsPerIntentColumn.Volume)
        expect(result).toBe(
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
        )
    })

    it('should return DEFAULT_SORTING_VALUE for unknown column', () => {
        const result = getColumnsSortingValue(
            'unknown' as TopProductsPerIntentColumn,
        )
        expect(result).toBe(DEFAULT_SORTING_VALUE)
    })
})

describe('formatTrendData', () => {
    it('should return correct trend and sign for positive trend', () => {
        const result = formatTrendData(200, 100)
        expect(result.trend).toBe('100%')
        expect(result.sign).toBeGreaterThanOrEqual(0)
    })

    it('should return correct trend and sign for negative trend', () => {
        const result = formatTrendData(50, 100)
        expect(result.trend).toBe('50%')
        expect(result.sign).toBeLessThanOrEqual(0)
    })

    it('should return correct trend and sign for zero trend', () => {
        const result = formatTrendData(100, 100)
        expect(result.trend).toBe('0%')
        expect(result.sign).toBe(0)
    })

    it('should return default badge text when values are null', () => {
        const result = formatTrendData(null as any, null as any)
        expect(result.trend).toBe(DEFAULT_BADGE_TEXT)
    })

    it('should return default badge text when values are undefined', () => {
        const result = formatTrendData(undefined as any, undefined as any)
        expect(result.trend).toBe(DEFAULT_BADGE_TEXT)
    })
})
