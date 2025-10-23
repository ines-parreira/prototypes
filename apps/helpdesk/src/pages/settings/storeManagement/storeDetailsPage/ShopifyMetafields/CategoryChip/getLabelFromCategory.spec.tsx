import { MetafieldCategory } from '../types'
import getLabelFromCategory from './getLabelFromCategory'

describe('getLabelFromCategory', () => {
    it('should return "Order" for order category', () => {
        const result = getLabelFromCategory('order')
        expect(result).toBe('Order')
    })

    it('should return "Customer" for customer category', () => {
        const result = getLabelFromCategory('customer')
        expect(result).toBe('Customer')
    })

    it('should return "Draft Order" for draft_order category', () => {
        const result = getLabelFromCategory('draft_order')
        expect(result).toBe('Draft Order')
    })

    it.each([
        [undefined, ''],
        ['invalid' as MetafieldCategory, ''],
    ])('should return empty string for %p category', (input, expected) => {
        const result = getLabelFromCategory(input)
        expect(result).toBe(expected)
    })
})
