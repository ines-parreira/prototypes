import { MetafieldCategory } from '../types'
import { getCategoryLabel } from './getCategoryLabel'

describe('getCategoryLabel', () => {
    it('should return "Customer" for customer category', () => {
        const result = getCategoryLabel('customer')
        expect(result).toBe('Customer')
    })

    it('should return "Order" for order category', () => {
        const result = getCategoryLabel('order')
        expect(result).toBe('Order')
    })

    it('should return "Draft Order" for draft_order category', () => {
        const result = getCategoryLabel('draft_order')
        expect(result).toBe('Draft Order')
    })

    it('should return empty string when category is undefined', () => {
        const result = getCategoryLabel(undefined)
        expect(result).toBe('')
    })

    it('should return empty string for category not in METAFIELD_CATEGORIES', () => {
        const result = getCategoryLabel('invalid_category' as MetafieldCategory)
        expect(result).toBe('')
    })
})
