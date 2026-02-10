import { getMetafieldWidgetConfig } from './getMetafieldWidgetConfig'

describe('getMetafieldWidgetConfig', () => {
    describe('boolean metafields', () => {
        it('returns select widget with True/False options', () => {
            const config = getMetafieldWidgetConfig('boolean', 'eq')
            expect(config).toEqual({
                type: 'select',
                options: [
                    { value: 'true', label: 'True' },
                    { value: 'false', label: 'False' },
                ],
            })
        })
    })

    describe('numeric metafields', () => {
        const numericTypes = [
            'number_integer',
            'number_decimal',
            'rating',
            'dimension',
            'volume',
            'weight',
            'money',
        ] as const

        it.each(numericTypes)('returns number-input for %s', (type) => {
            const config = getMetafieldWidgetConfig(type, 'eq')
            expect(config).toEqual({ type: 'number-input' })
        })
    })

    describe('date metafields', () => {
        it.each(['date', 'date_time'] as const)(
            'returns datetime-select for %s',
            (type) => {
                const config = getMetafieldWidgetConfig(type, 'gte')
                expect(config).toEqual({ type: 'datetime-select' })
            },
        )
    })

    describe('text metafields', () => {
        const textTypes = [
            'single_line_text_field',
            'multi_line_text_field',
            'url',
        ] as const

        it.each(textTypes)('returns null for %s (uses default)', (type) => {
            const config = getMetafieldWidgetConfig(type, 'eq')
            expect(config).toBeNull()
        })
    })

    it('returns null when metafieldType is undefined', () => {
        const config = getMetafieldWidgetConfig(undefined, 'eq')
        expect(config).toBeNull()
    })
})
