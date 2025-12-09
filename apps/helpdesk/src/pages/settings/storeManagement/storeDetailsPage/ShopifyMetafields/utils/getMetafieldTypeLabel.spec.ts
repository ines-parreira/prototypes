import type { MetafieldType } from '../MetafieldTypeItem/MetafieldTypeItem'
import { getMetafieldTypeLabel } from './getMetafieldTypeLabel'

describe('getMetafieldTypeLabel', () => {
    it('should return "Single-line text" for single_line_text type', () => {
        const result = getMetafieldTypeLabel('single_line_text')
        expect(result).toBe('Single-line text')
    })

    it('should return "Multi-line text" for multi_line_text type', () => {
        const result = getMetafieldTypeLabel('multi_line_text')
        expect(result).toBe('Multi-line text')
    })

    it('should return "Date and time" for date_time type', () => {
        const result = getMetafieldTypeLabel('date_time')
        expect(result).toBe('Date and time')
    })

    it('should return "Integer" for integer type', () => {
        const result = getMetafieldTypeLabel('integer')
        expect(result).toBe('Integer')
    })

    it('should return "Product variant" for product_variant type', () => {
        const result = getMetafieldTypeLabel('product_variant')
        expect(result).toBe('Product variant')
    })

    it('should return "True or false" for boolean type', () => {
        const result = getMetafieldTypeLabel('boolean')
        expect(result).toBe('True or false')
    })

    it('should return the type itself when typeConfig has no label', () => {
        const invalidType = 'unknown_type' as MetafieldType
        const result = getMetafieldTypeLabel(invalidType)
        expect(result).toBe('unknown_type')
    })
})
