import type { MetafieldType } from '@gorgias/helpdesk-types'

import { isSupportedMetafieldType } from './isSupportedMetafieldType'

describe('isSupportedMetafieldType', () => {
    it.each([
        ['page_reference', false],
        ['json', false],
        ['single_line_text_field', true],
        ['multi_line_text_field', true],
        ['boolean', true],
        ['product_reference', true],
        ['number_integer', true],
        [undefined, false],
    ])('should return %s for type %s', (type, expected) => {
        expect(isSupportedMetafieldType(type as MetafieldType)).toBe(expected)
    })
})
