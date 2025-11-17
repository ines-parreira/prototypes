import type { MetafieldType } from '../MetafieldTypeItem/MetafieldTypeItem'
import { isSupportedMetafieldType } from './isSupportedMetafieldType'

describe('isSupportedMetafieldType', () => {
    it.each([
        ['page', false],
        ['json', false],
        ['single_line_text', true],
        ['multi_line_text', true],
        ['boolean', true],
        ['product', true],
        ['integer', true],
        [undefined, false],
    ])('should return %s for type %s', (type, expected) => {
        expect(isSupportedMetafieldType(type as MetafieldType)).toBe(expected)
    })
})
