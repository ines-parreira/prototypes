import type { Field } from '../MetafieldsTable/types'
import type { MetafieldCategory } from '../types'
import { isAtMaxFields } from './isAtMaxFields'

describe('isAtMaxFields', () => {
    it.each([
        ['undefined', undefined],
        ['empty', []],
    ] as const)(
        'should return false when importedFields is %s',
        (_description, fields) => {
            const result = isAtMaxFields(
                fields as unknown as Field[],
                'customer',
            )
            expect(result).toBe(false)
        },
    )

    it.each<{
        fieldCount: number
        category: MetafieldCategory
        expected: boolean
        description: string
    }>([
        {
            fieldCount: 5,
            category: 'customer',
            expected: false,
            description: 'has less than 10 fields',
        },
        {
            fieldCount: 9,
            category: 'order',
            expected: false,
            description: 'has exactly 9 fields',
        },
        {
            fieldCount: 10,
            category: 'draft_order',
            expected: true,
            description: 'has exactly 10 fields',
        },
        {
            fieldCount: 15,
            category: 'customer',
            expected: true,
            description: 'has more than 10 fields',
        },
    ])(
        'should return $expected when category $description',
        ({ fieldCount, category, expected }) => {
            const fields = Array.from({ length: fieldCount }, (_, i) => ({
                id: `field-${i}`,
                name: `Field ${i}`,
                type: 'single_line_text_field' as const,
                category,
            }))

            const result = isAtMaxFields(fields as unknown as Field[], category)
            expect(result).toBe(expected)
        },
    )

    it('should return false when other categories have 10+ fields but the specified category has fewer', () => {
        const fields = [
            ...Array.from({ length: 15 }, (_, i) => ({
                id: `customer-field-${i}`,
                name: `Customer Field ${i}`,
                type: 'single_line_text_field' as const,
                category: 'customer' as const,
            })),
            ...Array.from({ length: 3 }, (_, i) => ({
                id: `order-field-${i}`,
                name: `Order Field ${i}`,
                type: 'single_line_text_field' as const,
                category: 'order' as const,
            })),
        ]

        const result = isAtMaxFields(fields as unknown as Field[], 'order')
        expect(result).toBe(false)
    })
})
