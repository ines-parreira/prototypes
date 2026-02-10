import { BASIC_OPERATORS } from 'config'

import getMetafieldOperators from '../getMetafieldOperators'

describe('getMetafieldOperators', () => {
    describe('text-based metafield types', () => {
        const textTypes = [
            'single_line_text_field',
            'multi_line_text_field',
            'url',
            'color',
            'id',
            'link',
            'customer_reference',
            'product_reference',
            'company_reference',
            'collection_reference',
            'variant_reference',
        ] as const

        it.each(textTypes)(
            'should return text operators for %s metafield type',
            (type) => {
                const operators = getMetafieldOperators(type)

                expect(operators).toHaveProperty('eq')
                expect(operators).toHaveProperty('neq')
                expect(operators).toHaveProperty('contains')
                expect(operators).toHaveProperty('notContains')
                expect(operators).toHaveProperty('startsWith')
                expect(operators).toHaveProperty('endsWith')
                expect(operators).toHaveProperty('containsAll')
                expect(operators).toHaveProperty('containsAny')
                expect(operators).toHaveProperty('notContainsAll')
                expect(operators).toHaveProperty('notContainsAny')
            },
        )
    })

    describe('numeric metafield types', () => {
        const numericTypes = [
            'number_integer',
            'number_decimal',
            'rating',
            'dimension',
            'volume',
            'weight',
            'money',
        ] as const

        it.each(numericTypes)(
            'should return numeric operators for %s metafield type',
            (type) => {
                const operators = getMetafieldOperators(type)

                expect(operators).toHaveProperty('eq')
                expect(operators).toHaveProperty('neq')
                expect(operators).toHaveProperty('lt')
                expect(operators).toHaveProperty('lte')
                expect(operators).toHaveProperty('gt')
                expect(operators).toHaveProperty('gte')
                expect(operators).not.toHaveProperty('contains')
            },
        )
    })

    describe('boolean metafield type', () => {
        it('should return boolean operators for boolean metafield type', () => {
            const operators = getMetafieldOperators('boolean')

            expect(operators).toHaveProperty('eq')
            expect(operators).toHaveProperty('neq')
            expect(Object.keys(operators)).toHaveLength(2)
        })
    })

    describe('date metafield types', () => {
        const dateTypes = ['date', 'date_time'] as const

        it.each(dateTypes)(
            'should return date operators for %s metafield type',
            (type) => {
                const operators = getMetafieldOperators(type)

                expect(operators).toHaveProperty('gte')
                expect(operators).toHaveProperty('lte')
                expect(operators).toHaveProperty('gteTimedelta')
                expect(operators).toHaveProperty('lteTimedelta')
                expect(operators).not.toHaveProperty('eq')
                expect(operators).not.toHaveProperty('contains')
            },
        )
    })

    describe('fallback cases', () => {
        it('should return BASIC_OPERATORS when metafield type is undefined', () => {
            const operators = getMetafieldOperators(undefined)
            expect(operators).toEqual(BASIC_OPERATORS)
        })

        it('should return BASIC_OPERATORS for unsupported metafield types', () => {
            const operators = getMetafieldOperators('unknown_type' as any)
            expect(operators).toEqual(BASIC_OPERATORS)
        })
    })
})
